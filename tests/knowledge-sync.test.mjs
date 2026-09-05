import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { isManagedPath, validateConfig, acquireLock } from '../scripts/knowledge-sync.mjs';
import { validateClassification } from '../scripts/lib/knowledge-ai.mjs';

test('automatic commits allow only generated notes and hashed media', () => {
  assert.equal(isManagedPath('src/content/knowledge/note-1.md'), true);
  assert.equal(isManagedPath('public/knowledge-assets/' + 'a'.repeat(64) + '.png'), true);
  for (const file of ['src/pages/index.astro', '.env', 'src/content/blog/private.md', 'src/content/knowledge/../../secret.md', 'public/knowledge-assets/screenshot.png']) assert.equal(isManagedPath(file), false, file);
});

test('runtime rejects external or legacy source configuration before reading it', async () => {
  await assert.rejects(validateConfig({ vaultDir: '/Volumes/Private', sourceDir: '/Volumes/Private/notes' }), /发布范围/);
  await assert.rejects(validateConfig({ vaultDir: path.join(os.homedir(), 'Documents/Obsidian Vault') }), /发布范围/);
});

test('classification accepts only controlled categories and bounded text', () => {
  const value = validateClassification({ topic: '学习方法', type: '学习', tags: ['复习', '复习', null], description: '掌握复习方法。' });
  assert.deepEqual(value.tags, ['复习']);
  assert.throws(() => validateClassification({ topic: '任意新目录', type: '学习', tags: [], description: 'test' }));
});

test('live runner lock prevents concurrent publish and releases normally', async () => {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'knowledge-runner-')));
  try {
    const release = await acquireLock(path.join(root, 'run.lock'));
    assert.equal(await acquireLock(path.join(root, 'run.lock')), null);
    await release();
    const next = await acquireLock(path.join(root, 'run.lock'));
    assert.equal(typeof next, 'function'); await next();
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
