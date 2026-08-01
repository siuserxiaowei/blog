import assert from 'node:assert/strict';
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  collectOfficialSources,
  hashNormalizedText,
  normalizeHtml,
  parseArgs,
  runSourceWatch,
  writeJsonAtomically,
} from '../scripts/competition-source-watch.mjs';

function sourceRecords() {
  return [
    {
      id: 'alpha',
      sources: [
        { kind: 'official', title: 'Official rules', url: 'https://official.example/rules#entry' },
        { kind: 'reported', title: 'Aggregator', url: 'https://aggregator.example/alpha' },
      ],
    },
    {
      id: 'beta',
      sources: [
        { kind: 'official', title: 'Organizer rules', url: 'https://official.example/rules' },
      ],
    },
  ];
}

function response(url, html, overrides = {}) {
  const body = Buffer.from(html);
  const headers = new Map([
    ['content-type', 'text/html; charset=utf-8'],
    ['content-encoding', 'identity'],
    ...Object.entries(overrides.headers ?? {}),
  ]);
  return {
    body,
    bytesRead: body.byteLength,
    finalUrl: url,
    headers: { get: (name) => headers.get(name.toLowerCase()) ?? null },
    redirects: [],
    statusCode: 200,
    truncated: false,
    ...overrides,
  };
}

function watchOptions(stateFile, overrides = {}) {
  return {
    ...parseArgs(['--state-file', stateFile, '--limit', '10']),
    ...overrides,
  };
}

async function temporaryDirectory(t) {
  const directory = await mkdtemp(join(tmpdir(), 'competition-source-watch-'));
  t.after(() => rm(directory, { force: true, recursive: true }));
  return directory;
}

test('normalization removes executable and presentation noise while keeping visible text stable', () => {
  const first = normalizeHtml(`
    <!-- generated at 10:00 -->
    <html><head>
      <style>.deadline { color: red }</style>
      <script>window.build = "random-a"</script>
      <noscript>tracking fallback a</noscript>
    </head><body class="build-a">
      <h1>Official&nbsp;Rules</h1>
      <svg><text>random-vector-a</text></svg>
      <p>Deadline: August 5</p>
    </body></html>
  `);
  const second = normalizeHtml(`
    <!-- generated at 10:01 -->
    <h1 data-build="b"> Official Rules </h1>
    <script>window.build = "random-b"</script>
    <style>.deadline { color: blue }</style>
    <noscript>tracking fallback b</noscript>
    <svg><text>random-vector-b</text></svg>
    <p>Deadline:   August 5</p>
  `);

  assert.equal(first, 'Official Rules Deadline: August 5');
  assert.equal(second, first);
  assert.equal(hashNormalizedText(first), hashNormalizedText(second));
  assert.notEqual(
    hashNormalizedText(first),
    hashNormalizedText(normalizeHtml('<h1>Official Rules</h1><p>Deadline: August 6</p>')),
  );
  assert.equal(normalizeHtml('<p>&lt;script&gt; is visible text</p>'), '<script> is visible text');
});

test('selection watches only explicitly official sources and keeps all associated competition IDs', () => {
  const entries = collectOfficialSources(sourceRecords(), {
    ids: ['alpha'],
    limit: Number.POSITIVE_INFINITY,
  });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, 'https://official.example/rules');
  assert.deepEqual(
    entries[0].references.map((reference) => reference.competitionId),
    ['alpha', 'beta'],
  );
  assert.throws(
    () => collectOfficialSources(sourceRecords(), { ids: ['missing'] }),
    /Unknown competition IDs: missing/,
  );
});

test('arguments cover bounded source-watch controls and dry-run defaults', () => {
  const options = parseArgs([
    '--dry-run',
    '--state-file', './watch.json',
    '--id', 'alpha',
    '--limit', '3',
    '--timeout-ms', '2500',
    '--concurrency', '2',
    '--max-bytes', '4096',
    '--max-redirects', '1',
    '--json',
  ]);
  assert.equal(options.dryRun, true);
  assert.equal(options.limit, 3);
  assert.equal(options.timeoutMs, 2500);
  assert.equal(options.concurrency, 2);
  assert.equal(options.maxBytes, 4096);
  assert.equal(options.maxRedirects, 1);
  assert.equal(options.json, true);
  assert.deepEqual(options.ids, ['alpha']);
  assert.equal(parseArgs(['--dry-run']).limit, 10);
  assert.throws(() => parseArgs(['--concurrency', '17']), /between 1 and 16/);
  assert.throws(() => parseArgs(['--max-bytes', '0']), /between 1 and/);
  assert.throws(() => parseArgs(['--unknown']), /Unknown argument/);
});

test('real visible text changes report previous/current hashes while dynamic noise stays quiet', async (t) => {
  const directory = await temporaryDirectory(t);
  const stateFile = join(directory, 'watch.json');
  let html = '<h1>Rules</h1><p>Deadline August 5</p><script>build-a</script>';
  let now = new Date('2026-08-02T00:00:00.000Z');
  const dependencies = {
    competitions: sourceRecords().slice(0, 1),
    now: () => now,
    requestPage: async (entry) => response(entry.url, html),
  };

  const baseline = await runSourceWatch(watchOptions(stateFile), dependencies);
  assert.equal(baseline.summary['new-baseline'], 1);
  assert.equal(baseline.events[0].previousHash, null);
  const baselineHash = baseline.events[0].currentHash;

  html = '<h1 data-build="b"> Rules </h1><p>Deadline August 5</p><script>build-b</script>';
  now = new Date('2026-08-02T01:00:00.000Z');
  const noiseOnly = await runSourceWatch(watchOptions(stateFile), dependencies);
  assert.equal(noiseOnly.summary.ok, 1);
  assert.deepEqual(noiseOnly.events, []);

  html = '<h1>Rules</h1><p>Deadline August 6</p><script>build-c</script>';
  now = new Date('2026-08-02T02:00:00.000Z');
  const changed = await runSourceWatch(watchOptions(stateFile), dependencies);
  assert.equal(changed.summary.changed, 1);
  assert.equal(changed.events[0].previousHash, baselineHash);
  assert.notEqual(changed.events[0].currentHash, baselineHash);
  assert.deepEqual(changed.events[0].competitionIds, ['alpha']);
  assert.equal(changed.events[0].normalizedLength, 'Rules Deadline August 6'.length);
});

test('dry-run fetches comparison evidence without creating a state file', async (t) => {
  const directory = await temporaryDirectory(t);
  const stateFile = join(directory, 'dry-run.json');
  const report = await runSourceWatch(
    watchOptions(stateFile, { dryRun: true }),
    {
      competitions: sourceRecords().slice(0, 1),
      now: () => new Date('2026-08-02T00:00:00.000Z'),
      requestPage: async (entry) => response(entry.url, '<main>Official rules</main>'),
    },
  );

  assert.equal(report.stateWritten, false);
  assert.equal(report.summary['new-baseline'], 1);
  await assert.rejects(readFile(stateFile), { code: 'ENOENT' });
});

test('state replacement is atomic, private, and leaves no temporary file', async (t) => {
  const directory = await temporaryDirectory(t);
  const stateFile = join(directory, 'state.json');
  await writeJsonAtomically(stateFile, { schemaVersion: '1.0', sources: { old: true } });
  await writeJsonAtomically(stateFile, { schemaVersion: '1.0', sources: { current: true } });

  const parsed = JSON.parse(await readFile(stateFile, 'utf8'));
  assert.deepEqual(parsed.sources, { current: true });
  assert.deepEqual(await readdir(directory), ['state.json']);
  assert.equal((await stat(stateFile)).mode & 0o777, 0o600);
});

test('one explicit dead response stays uncertain; confirmed dead and recovery are reported', async (t) => {
  const directory = await temporaryDirectory(t);
  const stateFile = join(directory, 'continuity.json');
  let mode = 'ok';
  let now = new Date('2026-08-02T00:00:00.000Z');
  const dependencies = {
    competitions: sourceRecords().slice(0, 1),
    now: () => now,
    requestPage: async (entry) => mode === 'ok'
      ? response(entry.url, '<main>Stable official rules</main>')
      : response(entry.url, 'Not found', { statusCode: 404 }),
  };

  await runSourceWatch(watchOptions(stateFile), dependencies);
  mode = 'dead';
  now = new Date('2026-08-03T00:00:00.000Z');
  const firstFailure = await runSourceWatch(watchOptions(stateFile), dependencies);
  assert.equal(firstFailure.events[0].status, 'uncertain');
  assert.match(firstFailure.events[0].reason, /confirmation_pending/);

  now = new Date('2026-08-04T00:00:01.000Z');
  const confirmed = await runSourceWatch(watchOptions(stateFile), dependencies);
  assert.equal(confirmed.events[0].status, 'dead');

  mode = 'ok';
  now = new Date('2026-08-04T01:00:00.000Z');
  const recovered = await runSourceWatch(watchOptions(stateFile), dependencies);
  assert.equal(recovered.events[0].status, 'ok');
  assert.equal(recovered.events[0].recoveredFrom, 'dead');
  assert.equal(recovered.summary.recovered, 1);
});

test('bot blocking is distinct from dead and truncation is visible without storing page text', async (t) => {
  const directory = await temporaryDirectory(t);
  const botStateFile = join(directory, 'bot.json');
  const bot = await runSourceWatch(
    watchOptions(botStateFile),
    {
      competitions: sourceRecords().slice(0, 1),
      now: () => new Date('2026-08-02T00:00:00.000Z'),
      requestPage: async (entry) => response(entry.url, '<main>Verify you are human</main>', {
        statusCode: 403,
      }),
    },
  );
  assert.equal(bot.events[0].status, 'bot-blocked');

  const truncatedStateFile = join(directory, 'truncated.json');
  const truncated = await runSourceWatch(
    watchOptions(truncatedStateFile),
    {
      competitions: sourceRecords().slice(0, 1),
      now: () => new Date('2026-08-02T01:00:00.000Z'),
      requestPage: async (entry) => response(entry.url, '<main>Partial official rules</main>', {
        truncated: true,
      }),
    },
  );
  assert.equal(truncated.events[0].status, 'new-baseline');
  assert.equal(truncated.events[0].truncated, true);
  const persisted = await readFile(truncatedStateFile, 'utf8');
  assert.doesNotMatch(persisted, /Partial official rules/);
  assert.match(persisted, /"bodyTruncated": true/);
});
