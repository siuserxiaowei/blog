import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import yaml from 'js-yaml';
import {
  ASSET_EXTENSIONS, assertNoSymlinks, digest, inside, publicHttpUrl,
  readSourceFile, resolveSourceReference, scanSource, sourceRoot, statOrNull,
} from './lib/knowledge-paths.mjs';

const VERSION = 1;
const NOTE_PREFIX = 'src/content/knowledge/';
const ASSET_PREFIX = 'public/knowledge-assets/';
const TYPES = new Set(['日常', '学习', '工具', '方法', '随想']);
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, { bullet: '-', fences: true });
const text = (value) => ({ type: 'text', value });
const nodeText = (node) => node.value ?? node.alt ?? (node.children ?? []).map(nodeText).join('');
const simpleText = (value, length = 200) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, length) : '';
const isoDay = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? value : null;
};

function frontmatter(raw) {
  const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { metadata: {}, body: raw };
  const metadata = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) ?? {};
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error('Frontmatter must be a YAML mapping.');
  return { metadata, body: raw.replace(/^\uFEFF/, '').slice(match[0].length) };
}

function fallbackClassification(title, body) {
  const value = `${title}\n${body}`;
  const topics = [
    ['AI 与工具', /\b(ai|agent|llm|gpt|claude|codex)\b|人工智能|大模型|智能体|工具|软件|插件/i],
    ['工作实践', /产品|增长|创业|商业|营销|转化|获客|seo|工作|项目|社群|运营/i],
    ['学习方法', /知识管理|笔记|obsidian|第二大脑|学习方法|教程|课程|学习/i],
    ['阅读与思考', /阅读|写作|内容创作|传播|公众号|短视频|小红书|想法|随想|感悟|思考/],
    ['日常生活', /日常|日记|今天|生活|散步|旅行|家庭/],
  ];
  const topic = topics.find(([, pattern]) => pattern.test(value))?.[0] ?? '日常生活';
  const type = /工具|软件|插件|应用|脚本|\b(app|tool)\b/i.test(title) ? '工具'
    : /方法|流程|步骤|教程|指南/.test(title) ? '方法'
      : /日常|日记|今天|生活|散步/.test(title) ? '日常'
        : /想法|随想|感悟|思考/.test(title) ? '随想' : '学习';
  const tree = processor.parse(body);
  const description = simpleText(nodeText(tree).replace(/\s+/g, ' '), 150) || title;
  return { topic, type, tags: [topic, type], description };
}

function cleanClassification(value, fallback) {
  const result = value && typeof value === 'object' ? value : {};
  return {
    topic: simpleText(result.topic, 40) || fallback.topic,
    type: TYPES.has(result.type) ? result.type : fallback.type,
    tags: Array.isArray(result.tags) ? [...new Set(result.tags.map((tag) => simpleText(tag, 40)).filter(Boolean))].slice(0, 8) : fallback.tags,
    description: simpleText(result.description, 200) || fallback.description,
  };
}

function validateManagedEntry(entry) {
  return entry && typeof entry.path === 'string'
    && /^(src\/content\/knowledge\/[a-z0-9][a-z0-9_-]{0,95}\.md|public\/knowledge-assets\/[a-f0-9]{64}\.(png|jpg|jpeg|webp|gif|avif|mp4|webm|pdf))$/.test(entry.path)
    && /^[a-f0-9]{64}$/.test(entry.hash) && Number.isSafeInteger(entry.bytes) && entry.bytes >= 0;
}

async function loadJson(file) {
  await assertNoSymlinks(file);
  const stat = await statOrNull(file);
  if (!stat) return null;
  if (!stat.isFile()) throw new Error('Exporter state must be a regular file.');
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function atomicWrite(file, bytes, mode = 0o644) {
  await assertNoSymlinks(file);
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.tmp-${process.pid}-${Math.random().toString(36).slice(2)}`;
  try { await fs.writeFile(temp, bytes, { flag: 'wx', mode }); await fs.rename(temp, file); }
  finally { await fs.rm(temp, { force: true }); }
}

function assertState(state, sourceKey, outputKey) {
  if (!state) return;
  if (state.version !== VERSION || state.sourceKey !== sourceKey || state.outputKey !== outputKey
    || !Array.isArray(state.manifest) || !state.manifest.every(validateManagedEntry)) {
    throw new Error('Exporter state does not belong to this source/output, or its manifest is invalid.');
  }
}

function selectNoteId(note, existingEntries, used, currentPaths) {
  const explicit = note.metadata.id;
  if (explicit !== undefined && (typeof explicit !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,95}$/.test(explicit))) {
    throw new Error('A note id must contain 1–96 lowercase letters, numbers, underscores or hyphens.');
  }
  let previous = existingEntries[note.relative];
  if (!previous) {
    const renamed = Object.entries(existingEntries).filter(([relative, record]) => !currentPaths.has(relative) && record.hash === note.hash);
    if (renamed.length === 1) previous = renamed[0][1];
  }
  const id = explicit ?? previous?.id ?? `k-${digest(note.relative).slice(0, 20)}`;
  if (!/^[a-z0-9][a-z0-9_-]{0,95}$/.test(id) || used.has(id)) throw new Error('Duplicate or invalid note id; set a unique frontmatter id.');
  used.add(id);
  return { id, previous };
}

function safeFragment(value) {
  if (!value) return '';
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { decoded = value; }
  const slug = decoded.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
  return slug ? `#${encodeURIComponent(slug)}` : '';
}

async function transformNote(note, context) {
  if (/!\[\[\s*https?:\/\//i.test(note.body)) {
    throw new Error('Embedding another Markdown note (including remote Markdown) is disabled; publish a link instead.');
  }
  const tree = processor.parse(note.body);
  const definitions = new Map();
  function collect(node) {
    if (node.type === 'definition') definitions.set(node.identifier.toLowerCase(), node);
    for (const child of node.children ?? []) collect(child);
  }
  collect(tree);

  async function assetUrl(value) {
    if (/^https?:\/\//i.test(value)) {
      const url = publicHttpUrl(value);
      if (!url) throw new Error('An external image or attachment must have a public HTTP(S) URL.');
      return url;
    }
    const relative = resolveSourceReference(context.root, note.relative, value, context.files, [...ASSET_EXTENSIONS], 'attachment');
    if (!relative) throw new Error(`Missing attachment referenced by ${note.relative}.`);
    const extension = path.extname(relative).toLowerCase();
    if (!ASSET_EXTENSIONS.has(extension)) throw new Error('Only supported image, video and PDF attachments can be published.');
    const buffer = await readSourceFile(context.root, context.dev, context.files.get(relative));
    const filename = `${digest(buffer)}${extension}`;
    context.outputs.set(`${ASSET_PREFIX}${filename}`, buffer);
    return `/knowledge-assets/${filename}`;
  }

  function noteUrl(value) {
    const relative = resolveSourceReference(context.root, note.relative, value, context.files, ['.md'], 'note');
    if (!relative || !context.notes.get(relative)?.published) return null;
    const linked = context.notes.get(relative);
    return `/knowledge/${linked.id}/${safeFragment(value.split('#').slice(1).join('#'))}`;
  }

  async function localOrRemoteLink(value) {
    if (value.startsWith('#')) return value;
    if (/^https?:\/\//i.test(value)) return publicHttpUrl(value);
    // Dangerous URI schemes become inert text. Absolute filesystem paths remain errors.
    if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^(file:|[a-z]:[\\/])/i.test(value)) return null;
    const plain = value.split(/[?#]/, 1)[0];
    const extension = path.extname(plain).toLowerCase();
    if (ASSET_EXTENSIONS.has(extension)) return assetUrl(value);
    if (!extension || extension === '.md') return noteUrl(value);
    // Still resolve to enforce the boundary before reporting an unsupported link.
    resolveSourceReference(context.root, note.relative, value, context.files, [], 'link');
    throw new Error('A local link uses an unsupported attachment type.');
  }

  async function wiki(value, embed) {
    const [target, ...labels] = value.split('|');
    const reference = target.trim();
    const label = labels.join('|').trim() || path.basename(reference.split('#')[0], '.md') || reference;
    if (embed) {
      if (/^https?:\/\//i.test(reference)) throw new Error('Embedding another Markdown note (including remote Markdown) is disabled; publish a link instead.');
      const extension = path.extname(reference.split(/[?#]/, 1)[0]).toLowerCase();
      if (!ASSET_EXTENSIONS.has(extension)) throw new Error('Embedding another Markdown note is disabled; publish a link instead.');
      const url = await assetUrl(reference);
      if (['.mp4', '.webm', '.pdf'].includes(extension)) return { type: 'link', url, children: [text(label)] };
      return { type: 'image', url, alt: /^\d+(x\d+)?$/.test(label) ? path.basename(reference) : label };
    }
    const url = await localOrRemoteLink(reference);
    return url ? { type: 'link', url, children: [text(label)] } : text(label);
  }

  async function transform(node) {
    if (node.type === 'definition') return [];
    if (node.type === 'html') return [text(node.value.replaceAll('<', '\\\\<'))];
    if (node.type === 'text') {
      const pattern = /(!?)\[\[([^\]\n]+)\]\]/g;
      const result = []; let cursor = 0;
      for (const match of node.value.matchAll(pattern)) {
        if (match.index > cursor) result.push(text(node.value.slice(cursor, match.index)));
        result.push(await wiki(match[2], Boolean(match[1])));
        cursor = match.index + match[0].length;
      }
      if (cursor < node.value.length) result.push(text(node.value.slice(cursor)));
      return result.length ? result : [node];
    }
    if (node.type === 'imageReference' || node.type === 'linkReference') {
      const definition = definitions.get(node.identifier.toLowerCase());
      if (!definition) return [text(node.alt ?? nodeText(node))];
      node = node.type === 'imageReference'
        ? { type: 'image', url: definition.url, alt: node.alt, title: definition.title }
        : { type: 'link', url: definition.url, children: node.children, title: definition.title };
    }
    if (node.type === 'image') {
      return [{ ...node, url: await assetUrl(node.url), alt: simpleText(node.alt, 250) }];
    }
    if (node.type === 'link') {
      const url = await localOrRemoteLink(node.url);
      if (!url) return [text(nodeText(node))];
      node = { ...node, url };
    }
    if (node.children) {
      const children = [];
      for (const child of node.children) children.push(...await transform(child));
      node = { ...node, children };
    }
    return [node];
  }
  const [result] = await transform(tree);
  return processor.stringify(result).trimEnd();
}

/** Export only the explicitly selected local folder. No source files are modified. */
export async function exportKnowledge({ source, output = process.cwd(), stateDir, check = false, classify } = {}) {
  const { root, dev } = await sourceRoot(source);
  const outputRoot = path.resolve(output);
  if (outputRoot === path.parse(outputRoot).root || inside(root, outputRoot) || inside(outputRoot, root)) throw new Error('Source and output must be separate, non-nested directories.');
  const sourceKey = digest(root);
  const outputKey = digest(outputRoot);
  const privateRoot = path.resolve(stateDir ?? path.join(os.homedir(), '.local/state/siuserxiaowei-knowledge', sourceKey.slice(0, 20)));
  if (inside(root, privateRoot) || inside(outputRoot, privateRoot) || inside(privateRoot, root) || inside(privateRoot, outputRoot)) throw new Error('Private exporter state must be outside both source and output.');
  await assertNoSymlinks(outputRoot);
  await assertNoSymlinks(privateRoot);
  let lock;
  if (!check) {
    await fs.mkdir(privateRoot, { recursive: true, mode: 0o700 });
    await fs.chmod(privateRoot, 0o700);
    try { lock = await fs.open(path.join(privateRoot, 'export.lock'), 'wx', 0o600); }
    catch (error) { if (error.code === 'EEXIST') throw new Error('Another export is running, or a stale export.lock needs review.'); throw error; }
  }
  try {
    const stateFile = path.join(privateRoot, 'state.json');
    const journalFile = path.join(privateRoot, 'pending.json');
    const previous = await loadJson(stateFile);
    const pending = await loadJson(journalFile);
    assertState(previous, sourceKey, outputKey);
    assertState(pending, sourceKey, outputKey);
    const owned = new Map();
    for (const entry of [...previous?.manifest ?? [], ...pending?.manifest ?? []]) {
      if (!owned.has(entry.path)) owned.set(entry.path, new Set());
      owned.get(entry.path).add(entry.hash);
    }
    const files = await scanSource(root, dev);
    const notes = new Map();
    const outputs = new Map();
    const warnings = [];
    for (const [relative, record] of files) {
      if (path.extname(relative).toLowerCase() !== '.md') continue;
      const raw = (await readSourceFile(root, dev, record)).toString('utf8');
      const { metadata, body } = frontmatter(raw);
      const published = metadata.draft !== true && metadata.publish !== false && String(metadata.visibility ?? '').toLowerCase() !== 'private';
      notes.set(relative, { relative, metadata, body, hash: digest(raw), published, record });
    }
    const used = new Set();
    for (const note of notes.values()) {
      if (!note.published) continue;
      Object.assign(note, selectNoteId(note, previous?.entries ?? {}, used, new Set(notes.keys())));
    }
    const entries = {};
    for (const note of notes.values()) {
      if (!note.published) continue;
      const tree = processor.parse(note.body);
      const title = simpleText(note.metadata.title, 200) || simpleText(nodeText(tree.children.find((node) => node.type === 'heading' && node.depth === 1) ?? {}), 200) || path.basename(note.relative, '.md');
      const body = await transformNote(note, { root, dev, notes, files, outputs });
      const fallback = fallbackClassification(title, body);
      let classification = note.previous?.hash === note.hash ? note.previous.classification : null;
      if (!classification) {
        try { classification = classify ? await classify({ title, body, existingMetadata: { ...note.metadata, ...note.previous?.classification } }) : fallback; }
        catch { classification = fallback; warnings.push(`Classification used a local fallback for ${note.id}.`); }
      }
      classification = cleanClassification(classification, fallback);
      const sourceDay = note.record.stat.mtime.toISOString().slice(0, 10);
      const date = isoDay(note.metadata.date) ?? note.previous?.date ?? sourceDay;
      const updated = isoDay(note.metadata.updated) ?? (note.previous?.hash === note.hash ? note.previous.updated : sourceDay) ?? date;
      const metadata = { title, date, updated, ...classification, draft: false, visibility: 'public' };
      const sourceUrl = publicHttpUrl(note.metadata.sourceUrl ?? note.metadata.source);
      if (sourceUrl) metadata.sourceUrl = sourceUrl;
      const rendered = `---\n${yaml.dump(metadata, { noRefs: true, lineWidth: -1, sortKeys: false })}---\n\n${body}\n`;
      outputs.set(`${NOTE_PREFIX}${note.id}.md`, Buffer.from(rendered));
      entries[note.relative] = { id: note.id, hash: note.hash, date, updated, classification };
    }
    // Classification can take time; never publish a body read from an older
    // version of a note than the one now on disk.
    for (const note of notes.values()) {
      const current = await fs.lstat(note.record.absolute);
      if (!current.isFile() || current.ino !== note.record.stat.ino || current.size !== note.record.stat.size
        || current.mtimeMs !== note.record.stat.mtimeMs) {
        throw new Error(`A source note changed during export: ${note.relative}`);
      }
    }
    // Astro reads every Markdown/media file in these directories. Refuse to
    // continue while an unowned file is present so a manual artifact cannot
    // become public accidentally.
    async function unmanagedOutputFiles(directory, prefix, result = []) {
      const stat = await statOrNull(directory);
      if (!stat) return result;
      if (!stat.isDirectory()) throw new Error(`Exporter output path is not a directory: ${prefix}`);
      for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        const relative = `${prefix}${entry.name}`;
        const child = await fs.lstat(absolute);
        if (child.isSymbolicLink()) throw new Error(`Symbolic links are forbidden in exporter output: ${relative}`);
        if (child.isDirectory()) await unmanagedOutputFiles(absolute, `${relative}/`, result);
        else if (child.isFile() && entry.name !== '.gitkeep' && (/\.md$/i.test(entry.name) || ASSET_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))) result.push(relative);
      }
      return result;
    }
    const unmanaged = await unmanagedOutputFiles(path.join(outputRoot, 'src/content/knowledge'), NOTE_PREFIX);
    unmanaged.push(...await unmanagedOutputFiles(path.join(outputRoot, 'public/knowledge-assets'), ASSET_PREFIX));
    for (const relative of unmanaged) if (!owned.has(relative) && !outputs.has(relative)) throw new Error(`Refusing to absorb an unmanaged output file: ${relative}`);
    const manifest = [...outputs].map(([file, bytes]) => ({ path: file, hash: digest(bytes), bytes: bytes.length })).sort((a, b) => a.path.localeCompare(b.path));
    const writes = []; const removals = [];
    // Validate every current managed file before making any change.
    for (const relative of new Set([...owned.keys(), ...outputs.keys()])) {
      const absolute = path.join(outputRoot, relative);
      await assertNoSymlinks(absolute);
      const stat = await statOrNull(absolute);
      if (stat && !stat.isFile()) throw new Error(`The exporter output is not a regular file: ${relative}`);
      const current = stat ? await fs.readFile(absolute) : null;
      const currentHash = current ? digest(current) : null;
      if (stat && !owned.has(relative)) throw new Error(`Refusing to overwrite an unmanaged file: ${relative}`);
      if (stat && !owned.get(relative)?.has(currentHash)) throw new Error(`A managed file was edited outside the exporter: ${relative}`);
      if (!outputs.has(relative)) { if (stat) removals.push(relative); }
      else if (currentHash !== digest(outputs.get(relative))) writes.push(relative);
    }
    const nextState = { version: VERSION, sourceKey, outputKey, entries, manifest };
    const stateChanged = JSON.stringify(previous) !== JSON.stringify(nextState);
    if (!check && (writes.length || removals.length || stateChanged || pending)) {
      // A private journal permits safe recovery if the process stops during output writes.
      const recoveryManifest = [...previous?.manifest ?? [], ...pending?.manifest ?? [], ...manifest];
      await atomicWrite(journalFile, `${JSON.stringify({ version: VERSION, sourceKey, outputKey, manifest: recoveryManifest })}\n`, 0o600);
      for (const relative of writes) await atomicWrite(path.join(outputRoot, relative), outputs.get(relative));
      for (const relative of removals) await fs.unlink(path.join(outputRoot, relative));
      await atomicWrite(stateFile, `${JSON.stringify(nextState, null, 2)}\n`, 0o600);
      await fs.rm(journalFile, { force: true });
    }
    return {
      count: Object.keys(entries).length,
      bytes: manifest.reduce((total, entry) => total + entry.bytes, 0),
      changed: Boolean(writes.length || removals.length), filesChanged: writes.length, removed: removals.length,
      manifest, warnings, check,
    };
  } finally {
    if (lock) { await lock.close(); await fs.unlink(path.join(privateRoot, 'export.lock')); }
  }
}

export { fallbackClassification };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = {};
  for (let index = 2; index < process.argv.length; index++) {
    const flag = process.argv[index];
    if (flag === '--check') options.check = true;
    else if (['--source', '--output', '--state-dir'].includes(flag)) {
      const value = process.argv[++index];
      if (!value || value.startsWith('--')) throw new Error(`${flag} requires a directory.`);
      options[flag === '--state-dir' ? 'stateDir' : flag.slice(2)] = value;
    } else throw new Error(`Unknown option: ${flag}`);
  }
  exportKnowledge(options).then((result) => {
    process.stdout.write(`${JSON.stringify({ ...result, manifest: undefined }, null, 2)}\n`);
  }).catch((error) => { process.stderr.write(`Knowledge export stopped: ${error.message}\n`); process.exitCode = 1; });
}
