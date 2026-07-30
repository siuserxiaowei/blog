import assert from 'node:assert/strict';
import test from 'node:test';

import {
  diffLinkHealth,
  parseArgs,
} from '../scripts/competition-radar-monitor.mjs';

test('monitor arguments keep a bounded dry-run and deterministic local date', () => {
  const options = parseArgs(['--dry-run', '--today', '2026-07-30', '--review-limit', '12']);
  assert.equal(options.linkLimit, 10);
  assert.equal(options.reviewLimit, 12);
  assert.equal(options.notify, true);
  assert.throws(() => parseArgs(['--today', '2026-02-30']), /Invalid date/);
  assert.throws(() => parseArgs(['--link-limit', '0']), /positive integer/);
});

test('monitor detects newly dead and recovered URLs without treating uncertainty as recovery', () => {
  const previous = {
    links: {
      problems: [
        { url: 'https://dead.example/', status: 'dead' },
        { url: 'https://uncertain.example/', status: 'uncertain' },
      ],
    },
  };
  const changes = diffLinkHealth(previous, [
    { url: 'https://dead.example/', status: 'ok' },
    { url: 'https://uncertain.example/', status: 'dead' },
    { url: 'https://new.example/', status: 'dead' },
  ]);
  assert.deepEqual(changes.recovered, ['https://dead.example/']);
  assert.deepEqual(changes.newDead, ['https://uncertain.example/', 'https://new.example/']);
});
