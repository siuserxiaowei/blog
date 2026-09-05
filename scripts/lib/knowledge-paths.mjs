import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const MAX_FILE_BYTES = 24 * 1024 * 1024;
export const ASSET_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.mp4', '.webm', '.pdf']);
export const digest = (value) => createHash('sha256').update(value).digest('hex');
export const inside = (root, candidate) => candidate === root || candidate.startsWith(`${root}${path.sep}`);

export async function statOrNull(file) {
  try { return await fs.lstat(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// Inspect every existing path component. realpath alone would silently follow a link.
export async function assertNoSymlinks(file) {
  const absolute = path.resolve(file);
  let current = path.parse(absolute).root;
  for (const component of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    const stat = await statOrNull(current);
    if (!stat) break;
    if (stat.isSymbolicLink()) throw new Error(`Symbolic links are forbidden: ${current}`);
  }
}

export async function sourceRoot(input) {
  if (!input) throw new Error('An explicit --source directory is required.');
  const root = path.resolve(input);
  if (root === path.parse(root).root) throw new Error('The filesystem root cannot be a publication directory.');
  await assertNoSymlinks(root);
  const stat = await fs.lstat(root);
  if (!stat.isDirectory()) throw new Error('The publication source must be a directory.');
  const real = await fs.realpath(root);
  if (real === '/Volumes' || real.startsWith('/Volumes/')) throw new Error('External volumes are excluded from publication.');
  if (real !== root) throw new Error('The publication directory must use its physical path.');
  return { root, dev: stat.dev };
}

export async function scanSource(root, dev) {
  const files = new Map();
  async function walk(directory) {
    await assertNoSymlinks(directory);
    for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(directory, entry.name);
      const stat = await fs.lstat(absolute);
      if (stat.isSymbolicLink()) throw new Error(`Symbolic links are forbidden: ${absolute}`);
      if (stat.dev !== dev) throw new Error(`Cross-device content is forbidden: ${absolute}`);
      if (stat.isDirectory()) await walk(absolute);
      else if (stat.isFile()) files.set(path.relative(root, absolute).split(path.sep).join('/'), { absolute, stat });
      else throw new Error(`Unsupported filesystem entry: ${absolute}`);
    }
  }
  await walk(root);
  return files;
}

export async function readSourceFile(root, dev, record) {
  if (!inside(root, record.absolute)) throw new Error('A source file escaped the publication directory.');
  await assertNoSymlinks(record.absolute);
  const handle = await fs.open(record.absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.dev !== dev || stat.ino !== record.stat.ino) throw new Error('A source file changed identity during export.');
    if (stat.size > MAX_FILE_BYTES) throw new Error(`A source file exceeds the 24 MiB limit: ${record.absolute}`);
    const bytes = await handle.readFile();
    if (bytes.length > MAX_FILE_BYTES) throw new Error('A source file grew beyond the 24 MiB limit.');
    await assertNoSymlinks(record.absolute);
    return bytes;
  } finally { await handle.close(); }
}

export function parseLocalReference(value) {
  let decoded;
  try { decoded = decodeURIComponent(value.split(/[?#]/, 1)[0]); }
  catch { throw new Error('A local attachment or note URL has invalid escaping.'); }
  if (!decoded || decoded.includes('\0') || decoded.includes('\\') || path.isAbsolute(decoded) || /^[a-z][a-z\d+.-]*:/i.test(decoded)) {
    throw new Error('Absolute paths and non-web URL schemes are forbidden in local references.');
  }
  return decoded;
}

export function resolveSourceReference(root, from, value, files, extensions, label) {
  const local = parseLocalReference(value);
  const candidates = [path.resolve(root, path.dirname(from), local), path.resolve(root, local)];
  if (candidates.some((candidate) => !inside(root, candidate))) throw new Error('A reference escapes the publication directory.');
  const relative = candidates.map((candidate) => path.relative(root, candidate).split(path.sep).join('/'));
  const withExtensions = relative.flatMap((candidate) => path.extname(candidate) ? [candidate] : extensions.map((extension) => `${candidate}${extension}`));
  // Obsidian commonly stores attachment references using just their basename.
  if (!local.includes('/')) {
    const names = new Set(withExtensions.map((candidate) => path.basename(candidate).toLowerCase()));
    const matches = [...files.keys()].filter((candidate) => names.has(path.basename(candidate).toLowerCase()));
    if (matches.length > 1) throw new Error(`Ambiguous ${label} basename; use a path within the publication folder.`);
    if (matches.length === 1) return matches[0];
  }
  for (const candidate of withExtensions) if (files.has(candidate)) return candidate;
  return null;
}

export function publicHttpUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !host.includes('.') && !host.includes(':')) return null;
    if (host === 'localhost' || /\.(localhost|local|internal|test|invalid)$/.test(host)) return null;
    if (/^(0\.|10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(host)) return null;
    if (host.includes(':') && (/^(::|fc|fd|fe[89ab])/i.test(host) || host.includes('ffff:'))) return null;
    return url.href;
  } catch { return null; }
}
