#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { exportKnowledge } from './knowledge-export.mjs';
import { assertNoSymlinks, sourceRoot, scanSource } from './lib/knowledge-paths.mjs';
import { createClassifier } from './lib/knowledge-ai.mjs';

const DEFAULT_CONFIG = path.join(os.homedir(), '.config/siuser-knowledge/config.json');
const EXPECTED_ORIGIN = 'https://github.com/siuserxiaowei/blog.git';
const EXPECTED_PROJECT = 'siuserxiaowei-blog';
const MANAGED = ['src/content/knowledge', 'public/knowledge-assets'];

export function isManagedPath(file) {
  return /^(src\/content\/knowledge\/[^/]+\.md|public\/knowledge-assets\/[a-f0-9]{64}\.(png|jpg|jpeg|webp|gif|avif|mp4|webm|pdf))$/.test(file);
}

export async function command(bin, args, { cwd, timeout = 180000, quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CI: '1', NODE_OPTIONS: '--max-old-space-size=1536' } });
    let output = ''; let settled = false;
    const finish = (error, value) => { if (settled) return; settled = true; clearTimeout(timer); error ? reject(error) : resolve(value); };
    const timer = setTimeout(() => { child.kill('SIGKILL'); finish(new Error(`${path.basename(bin)} 执行超时`)); }, timeout);
    child.on('error', () => finish(new Error(`无法启动 ${path.basename(bin)}`)));
    const collect = data => { output += data.toString(); if (output.length > 2_000_000) output = output.slice(-1_000_000); };
    child.stdout.on('data', collect); child.stderr.on('data', collect);
    child.on('close', code => code === 0 ? finish(null, output.trimEnd()) : finish(new Error(quiet ? `${path.basename(bin)} 执行失败` : `${path.basename(bin)} 执行失败：${output.slice(-1600)}`)));
  });
}

export async function validateConfig(config) {
  const expectedVault = path.join(os.homedir(), 'Documents/日常学习');
  if (config.vaultDir !== expectedVault || config.sourceDir !== path.join(expectedVault, '网站发布')) throw new Error('发布范围必须是本机「日常学习/网站发布」，不接受其他知识库。');
  if (config.projectName !== EXPECTED_PROJECT || config.origin !== EXPECTED_ORIGIN || config.branch !== 'main') throw new Error('发布目标与本站不符。');
  const runtimeRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  if (path.resolve(config.projectDir) !== runtimeRoot) throw new Error('同步器只能操作它所在的独立工作区。');
  for (const p of [config.vaultDir, config.sourceDir, config.projectDir, config.stateDir]) await assertNoSymlinks(p);
  const source = await sourceRoot(config.sourceDir);
  const homeStat = await fs.stat(os.homedir());
  if (source.dev !== homeStat.dev) throw new Error('发布目录不在本机内置磁盘。');
  const origin = await command('/opt/homebrew/bin/git', ['remote', 'get-url', 'origin'], { cwd: config.projectDir });
  if (origin !== EXPECTED_ORIGIN) throw new Error('Git 远程仓库与本站不符。');
  return source;
}

async function atomicJson(file, value) {
  await assertNoSymlinks(file);
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  await fs.rename(temp, file);
}

export async function acquireLock(file) {
  await assertNoSymlinks(file);
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = await fs.open(file, 'wx', 0o600);
      await handle.writeFile(JSON.stringify({ pid: process.pid, started: Date.now() })); await handle.close();
      return async () => { await fs.unlink(file).catch(() => {}); };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let lock;
      try { lock = JSON.parse(await fs.readFile(file, 'utf8')); } catch { throw new Error('同步锁无法读取，请先检查同步状态。'); }
      try { process.kill(lock.pid, 0); return null; }
      catch (probe) { if (probe.code !== 'ESRCH') return null; }
      await fs.unlink(file);
    }
  }
  return null;
}

async function readState(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
}

async function statusNote(config, state) {
  const file = path.join(config.vaultDir, '同步状态.md');
  await assertNoSymlinks(file);
  const text = `# 同步状态\n\n- 状态：${state.message}\n- 最近检查：${state.checkedAt}\n- 最近成功：${state.lastSuccess ?? '尚未发布'}\n- 已同步笔记：${state.count ?? 0}\n- 本次 AI 分类：${state.aiCount ?? 0} 条\n- 本次本地备用分类：${state.fallbackCount ?? 0} 条\n\n网站：[日常与学习](https://siuserxiaowei.com/knowledge/)\n\n只发布本机此库中的「网站发布」文件夹和实际引用附件。「草稿」、此说明页和移动硬盘不参与发布。\n`;
  const temp = `${file}.${process.pid}.tmp`; await fs.writeFile(temp, text, { mode: 0o600 }); await fs.rename(temp, file);
}

export async function syncKnowledge(config, { check = false, force = false } = {}) {
  const source = await validateConfig(config);
  const unlock = await acquireLock(path.join(config.stateDir, 'runner.lock'));
  if (!unlock) return { status: 'busy' };
  const stateFile = path.join(config.stateDir, 'runner.json');
  let state = { ...await readState(stateFile), checkedAt: new Date().toISOString(), aiCount: 0, fallbackCount: 0 };
  const save = async (message) => { state.message = message; await atomicJson(stateFile, state); await statusNote(config, state); };
  try {
    const files = await scanSource(source.root, source.dev);
    if (!force && [...files.values()].some(record => Date.now() - record.stat.mtimeMs < (config.settleSeconds ?? 45) * 1000)) {
      await save('等待最近的编辑保存完成'); return { status: 'settling' };
    }
    const git = args => command('/usr/bin/git', args, { cwd: config.projectDir });
    if (check) {
      const summary = await exportKnowledge({ source: config.sourceDir, output: config.projectDir, stateDir: path.join(config.stateDir, 'export'), check: true });
      return { status: 'checked', count: summary.count, bytes: summary.bytes };
    }
    const dirty = (await git(['status', '--porcelain=v1', '-uall'])).split('\n').filter(Boolean);
    if (dirty.some(line => !isManagedPath(line.slice(3)))) throw new Error('独立发布工作区有非笔记改动，已暂停自动发布。');
    if (dirty.length) {
      // Validate manifest ownership before recovering a previous interrupted export.
      await exportKnowledge({ source: config.sourceDir, output: config.projectDir, stateDir: path.join(config.stateDir, 'export'), check: true });
      await git(['add', '--', ...MANAGED]);
      await git(['commit', '-m', 'content: recover pending knowledge update']);
    }
    await git(['fetch', '--quiet', 'origin', 'main']);
    const counts = (await git(['rev-list', '--left-right', '--count', 'HEAD...origin/main'])).trim().split(/\s+/).map(Number);
    if (counts[0] && counts[1]) throw new Error('网站与远端同时有改动，需要合并后继续同步。');
    if (counts[0]) {
      const aheadFiles = (await git(['diff', '--name-only', 'origin/main..HEAD'])).split('\n').filter(Boolean);
      if (aheadFiles.some(file => !isManagedPath(file))) throw new Error('本地工作区有未发布的代码改动，已暂停自动同步。');
    }
    if (counts[1]) await git(['merge', '--ff-only', 'origin/main']);
    let calls = 0;
    const classify = config.ai === false ? undefined : createClassifier({
      pythonBin: config.pythonBin, model: config.model || 'gpt-5.4-mini',
      onResult: mode => { state[mode === 'ai' ? 'aiCount' : 'fallbackCount']++; },
    });
    const summary = await exportKnowledge({ source: config.sourceDir, output: config.projectDir, stateDir: path.join(config.stateDir, 'export'),
      classify: classify ? async input => { if (++calls > 20) { state.fallbackCount++; throw new Error('本批次先使用本地分类'); } return classify(input); } : undefined });
    state.count = summary.count; state.bytes = summary.bytes;
    const head = await git(['rev-parse', 'HEAD']);
    const changed = (await git(['status', '--porcelain=v1', '-uall', '--', ...MANAGED])).trim();
    if (!changed && state.deployedCommit === head && !force) { await save('已同步，没有新改动'); return { status: 'unchanged', count: summary.count }; }
    await save('正在构建网页');
    await command('/opt/homebrew/bin/npm', ['run', 'build'], { cwd: config.projectDir });
    if (changed) {
      await git(['add', '--', ...MANAGED]);
      await git(['commit', '-m', 'content: sync daily learning notes']);
    }
    const commit = await git(['rev-parse', 'HEAD']);
    await git(['push', '--quiet', 'origin', 'HEAD:main']);
    await save('正在更新网站');
    await command('/opt/homebrew/bin/wrangler', ['pages', 'deploy', 'dist', '--project-name', EXPECTED_PROJECT, '--branch', 'main', '--commit-hash', commit], { cwd: config.projectDir, timeout: 180000, quiet: true });
    state.deployedCommit = commit; state.lastSuccess = new Date().toISOString(); state.lastError = null;
    await save('已同步到网站');
    return { status: 'published', count: summary.count, commit };
  } catch (error) {
    state.lastError = error.message;
    await save('同步暂停：' + error.message.slice(0, 300));
    throw error;
  } finally { await unlock(); }
}

async function main() {
  const args = process.argv.slice(2); const at = args.indexOf('--config');
  const configFile = at >= 0 ? args[at + 1] : DEFAULT_CONFIG;
  await assertNoSymlinks(configFile);
  const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
  if (args.includes('--status')) { const state = await readState(path.join(config.stateDir, 'runner.json')); console.log(JSON.stringify(state, null, 2)); return; }
  const result = await syncKnowledge(config, { check: args.includes('--check'), force: args.includes('--force') });
  console.log(JSON.stringify({ time: new Date().toISOString(), ...result }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(JSON.stringify({ time: new Date().toISOString(), status: 'error', message: error.message })); process.exitCode = 1; });
}
