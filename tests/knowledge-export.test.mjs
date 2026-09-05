import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { exportKnowledge } from '../scripts/knowledge-export.mjs';
import { MAX_FILE_BYTES, readSourceFile, scanSource, sourceRoot } from '../scripts/lib/knowledge-paths.mjs';

async function fixture(t) {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'knowledge-export-test-'));
  const base = await fs.realpath(temporary);
  const source = path.join(base, 'publish');
  const output = path.join(base, 'site');
  const stateDir = path.join(base, 'private-state');
  await fs.mkdir(source); await fs.mkdir(output);
  t.after(() => fs.rm(base, { recursive: true, force: true }));
  return {
    base, source, output, stateDir,
    async put(relative, content) { const target = path.join(source, relative); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, content); return target; },
    run(options = {}) { return exportKnowledge({ source, output, stateDir, ...options }); },
    async published() {
      const directory = path.join(output, 'src/content/knowledge');
      try { return Promise.all((await fs.readdir(directory)).filter((name) => name.endsWith('.md')).map(async (name) => ({ name, content: await fs.readFile(path.join(directory, name), 'utf8') }))); }
      catch (error) { if (error.code === 'ENOENT') return []; throw error; }
    },
  };
}

test('exports only public local notes and cited assets; stable on repeated export', async (t) => {
  const f = await fixture(t);
  await f.put('daily.md', '---\ntitle: 今天的学习\ndate: 2026-09-05\n---\n\n# 今天的学习\n\n学习笔记。![[assets/photo.png|300]]\n\n[[method|这个方法]]\n');
  await f.put('method.md', '# 一个方法\n\n按步骤学习。');
  await f.put('assets/photo.png', Buffer.from('fixture-image'));
  await f.put('assets/unreferenced.jpg', Buffer.from('PRIVATE_UNUSED_ASSET'));
  await f.put('secret.md', '---\nvisibility: private\n---\nPRIVATE_CONTENT');
  await f.put('draft.md', '---\ndraft: true\n---\nPRIVATE_DRAFT');
  await f.put('unpublished.md', '---\npublish: false\n---\nPRIVATE_UNPUBLISHED');
  const first = await f.run();
  assert.equal(first.count, 2); assert.equal(first.filesChanged, 3);
  const records = await f.published();
  const combined = records.map((record) => record.content).join('\n');
  assert.match(combined, /\/knowledge-assets\/[a-f0-9]{64}\.png/);
  assert.match(combined, /\[这个方法\]\(\/knowledge\/k-[a-f0-9]+\/\)/);
  assert.doesNotMatch(combined, /PRIVATE_|publish\/|private-state/);
  assert.equal(first.manifest.filter((entry) => entry.path.startsWith('public/')).length, 1);
  const before = await fs.stat(path.join(f.output, 'src/content/knowledge', records[0].name));
  const second = await f.run();
  const after = await fs.stat(path.join(f.output, 'src/content/knowledge', records[0].name));
  assert.equal(second.changed, false); assert.equal(second.filesChanged, 0);
  assert.equal(before.mtimeMs, after.mtimeMs);
  assert.deepEqual(first.manifest, second.manifest);
});

test('check validates without making output or private state', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# First');
  const result = await f.run({ check: true });
  assert.equal(result.count, 1); assert.equal(result.changed, true);
  assert.deepEqual(await fs.readdir(f.output), []);
  await assert.rejects(fs.stat(f.stateDir), { code: 'ENOENT' });
});

test('rename retains stable identity and metadata; removed notes/assets are pruned by manifest only', async (t) => {
  const f = await fixture(t);
  await f.put('a.md', '# 学习\n![](a.png)'); await f.put('a.png', 'sample');
  await f.run();
  const [{ name }] = await f.published();
  await fs.rename(path.join(f.source, 'a.md'), path.join(f.source, 'renamed.md'));
  const renamed = await f.run();
  assert.equal(renamed.changed, false); assert.equal((await f.published())[0].name, name);
  const unrelated = path.join(f.output, 'src/content/knowledge/manual.md');
  await fs.writeFile(unrelated, '# Handwritten unrelated article');
  await fs.unlink(path.join(f.source, 'renamed.md'));
  await assert.rejects(f.run(), /unmanaged output file/);
  await fs.unlink(unrelated);
  const removed = await f.run();
  assert.equal(removed.count, 0); assert.equal(removed.removed, 2);
  assert.equal(await fs.stat(path.join(f.output, 'src/content/knowledge')).then(() => true), true);
});

test('public-to-private change removes public output and referenced-only assets', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# Study\n![](a.png)'); await f.put('a.png', 'sample');
  await f.run(); await f.put('a.md', '---\npublish: false\n---\n# Study\n![](missing.png)');
  const result = await f.run();
  assert.equal(result.count, 0); assert.equal(result.removed, 2);
  assert.deepEqual(await f.published(), []);
});

test('private note links become plain labels and note bodies cannot be embedded', async (t) => {
  const f = await fixture(t);
  await f.put('public.md', '# Public\n\n[[private|a private idea]] and [another](private.md)');
  await f.put('private.md', '---\ndraft: true\n---\nSENSITIVE_BODY');
  await f.run(); const body = (await f.published())[0].content;
  assert.match(body, /a private idea and another/); assert.doesNotMatch(body, /SENSITIVE_BODY|\/knowledge\/|private\.md/);
  await f.put('public.md', '# Public\n![[private]]');
  await assert.rejects(f.run(), /Embedding another Markdown note/);
  await f.put('public.md', '# Public\n![[https:\/\/example.com\/remote.md]]');
  await assert.rejects(f.run(), /Embedding another Markdown note/);
});

test('ambiguous note basenames are rejected while explicit paths work', async (t) => {
  const f = await fixture(t);
  await f.put('a.md', '# A\n[[same]]'); await f.put('one/same.md', '# One'); await f.put('two/same.md', '# Two');
  await assert.rejects(f.run(), /Ambiguous note/);
  await f.put('a.md', '# A\n[[one/same|One]]');
  assert.equal((await f.run()).count, 3);
});

test('missing, absolute, encoded absolute and escaping attachments fail before writes', async (t) => {
  const f = await fixture(t);
  for (const reference of ['missing.png', '../outside.png', '%2e%2e/outside.png', '/Users/person/private.png', '%2FUsers/private.png', 'file:///Users/private.png', 'C:\\Users\\private.png']) {
    await f.put('a.md', `# Public\n\n![[${reference}]]`);
    await assert.rejects(f.run(), /Missing attachment|escapes|Absolute paths/);
    assert.deepEqual(await f.published(), []);
  }
});

test('source root, ancestor and child symlinks are all rejected, even internal links', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# Real');
  const alias = path.join(f.base, 'alias'); await fs.symlink(f.source, alias);
  await assert.rejects(f.run({ source: alias }), /Symbolic links/);
  await fs.mkdir(path.join(f.source, 'nested'));
  await assert.rejects(f.run({ source: path.join(alias, 'nested') }), /Symbolic links/);
  await fs.symlink(path.join(f.source, 'a.md'), path.join(f.source, 'internal.md'));
  await assert.rejects(f.run(), /Symbolic links/);
  await fs.unlink(path.join(f.source, 'internal.md'));
  await fs.symlink('/Volumes/never-read-external-drive', path.join(f.source, 'external'));
  await assert.rejects(f.run(), /Symbolic links/);
});

test('source devices are checked during enumeration and again during reads', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# Real');
  const { root, dev } = await sourceRoot(f.source);
  await assert.rejects(scanSource(root, dev + 1), /Cross-device/);
  const files = await scanSource(root, dev);
  await assert.rejects(readSourceFile(root, dev + 1, files.get('a.md')), /changed identity/);
});

test('oversized referenced files are refused; unreferenced large files are never read', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# Small');
  const big = await f.put('large.mp4', ''); await fs.truncate(big, MAX_FILE_BYTES + 1);
  assert.equal((await f.run()).count, 1);
  await f.put('a.md', '# Video\n![[large.mp4]]');
  await assert.rejects(f.run(), /24 MiB/);
});

test('raw HTML, event attributes and dangerous links are inert; safe external URLs remain', async (t) => {
  const f = await fixture(t);
  await f.put('a.md', '# Safe\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert%281%29) [data](data:text/html,evil) [good](https://example.com/page)\n\n[reference][bad-ref]\n\n[bad-ref]: javascript:alert%281%29\n\n![remote](https://example.com/a.png)');
  await f.run(); const content = (await f.published())[0].content;
  assert.doesNotMatch(content, /(?<!\\)<script>|(?<!\\)<img|\]\(javascript:|\]\(data:/);
  assert.match(content, /\\<script>/); assert.match(content, /https:\/\/example.com\/page/);
  assert.match(content, /https:\/\/example.com\/a.png/);
  assert.equal((await fs.readdir(path.join(f.output, 'src/content/knowledge'))).length, 1);
  for (const url of ['javascript:alert(1)', 'data:image/png;base64,AAAA', 'https://localhost/a.png', 'https://127.0.0.1/a.png']) {
    await f.put('a.md', `# Unsafe\n![](${url})`);
    await assert.rejects(f.run(), /forbidden|public HTTP|unsupported|Absolute paths/i);
  }
});

test('reference-style attachments, Unicode paths, video/PDF embeds and heading links rewrite', async (t) => {
  const f = await fixture(t);
  await f.put('a.md', '# A\n\n![文字][picture]\n\n[picture]: assets/%E5%9B%BE%20%E7%89%87.png\n\n![[assets/demo.mp4]]\n\n![[assets/doc.pdf]]\n\n[[B#一个 标题|查看]]');
  await f.put('B.md', '# B\n\n## 一个 标题');
  await f.put('assets/图 片.png', 'img'); await f.put('assets/demo.mp4', 'video'); await f.put('assets/doc.pdf', 'pdf');
  const result = await f.run(); assert.equal(result.manifest.length, 5);
  const content = (await f.published()).map((note) => note.content).join('\n');
  assert.match(content, /\/knowledge-assets\/[a-f0-9]+\.mp4/);
  assert.match(content, /\/knowledge-assets\/[a-f0-9]+\.pdf/);
  assert.match(content, /#%E4%B8%80%E4%B8%AA-%E6%A0%87%E9%A2%98/);
});

test('classification is cached and failures use deterministic local fallback', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# Agent 学习\n使用智能体。');
  let calls = 0;
  const classify = async ({ title, body }) => { calls++; assert.equal(title, 'Agent 学习'); assert.match(body, /智能体/); return { tags: ['AI', 'AI'], topic: 'AI 与 Agent', type: '学习', description: '我的学习记录' }; };
  await f.run({ classify }); await f.run({ classify }); assert.equal(calls, 1);
  assert.match((await f.published())[0].content, /我的学习记录/);
  await f.put('a.md', '# Agent 学习\n新的智能体经验。');
  const fallback = await f.run({ classify: async () => { throw new Error('offline'); } });
  assert.equal(fallback.warnings.length, 1); assert.match((await f.published())[0].content, /topic: AI 与工具/);
  assert.equal((await f.run()).changed, false);
});

test('unmanaged collisions, externally edited managed files and forged manifests are refused', async (t) => {
  const f = await fixture(t); await f.put('a.md', '---\nid: stable-note\n---\n# Note');
  const directory = path.join(f.output, 'src/content/knowledge'); await fs.mkdir(directory, { recursive: true });
  const collision = path.join(directory, 'stable-note.md'); await fs.writeFile(collision, '# User work');
  await assert.rejects(f.run(), /unmanaged file/); assert.equal(await fs.readFile(collision, 'utf8'), '# User work');
  await fs.unlink(collision); await f.run(); await fs.appendFile(collision, '\nUser edit');
  await assert.rejects(f.run(), /edited outside/);
  const stateFile = path.join(f.stateDir, 'state.json'); const state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  state.manifest[0].path = '../../private'; await fs.writeFile(stateFile, JSON.stringify(state));
  await assert.rejects(f.run(), /manifest is invalid/);
});

test('output symlinks and private state inside the site cannot leak data', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# A');
  await assert.rejects(f.run({ stateDir: path.join(f.output, '.secret') }), /outside both/);
  await assert.rejects(f.run({ output: path.join(f.source, 'site') }), /non-nested/);
  await fs.symlink(f.base, path.join(f.output, 'src'));
  await assert.rejects(f.run(), /Symbolic links/);
});

test('pending journal safely recovers ownership after an interrupted export', async (t) => {
  const f = await fixture(t); await f.put('a.md', '# Original'); await f.run();
  const stateFile = path.join(f.stateDir, 'state.json');
  const previous = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  await f.put('a.md', '# Changed'); await f.run();
  const next = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  await fs.writeFile(stateFile, JSON.stringify(previous));
  await fs.writeFile(path.join(f.stateDir, 'pending.json'), JSON.stringify({ ...next, manifest: [...previous.manifest, ...next.manifest] }));
  const result = await f.run(); assert.equal(result.changed, false);
  assert.equal(JSON.parse(await fs.readFile(stateFile, 'utf8')).entries['a.md'].hash, next.entries['a.md'].hash);
  await assert.rejects(fs.stat(path.join(f.stateDir, 'pending.json')), { code: 'ENOENT' });
});
