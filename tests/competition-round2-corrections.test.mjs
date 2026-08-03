import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competitions,
  normalizeCompetitionCollection,
  statusOf,
  validateCompetitionCollectionV2,
} from '../src/data/competitions.js';
import { competitionRound2Corrections } from '../src/data/competition-round2-corrections.js';

const correctionIds = Object.keys(competitionRound2Corrections);
const originalIds = new Set(competitions.map((competition) => competition.id));
const today = new Date('2026-07-30T00:00:00+08:00');
const corrected = normalizeCompetitionCollection(
  competitions,
  competitionRound2Corrections,
  { updatedAt: '2026-07-30' },
);
const correctedById = new Map(corrected.map((competition) => [competition.id, competition]));

test('every round-two correction targets an existing competition', () => {
  assert.ok(correctionIds.length >= 40, 'expected a material correction sidecar');
  for (const id of correctionIds) {
    assert.ok(originalIds.has(id), `unknown correction id: ${id}`);
  }
});

test('every correction carries review provenance and HTTP(S) sources', () => {
  for (const [id, patch] of Object.entries(competitionRound2Corrections)) {
    assert.equal(patch.verification?.checkedAt, '2026-07-30', id);
    assert.ok(['official', 'reported'].includes(patch.verification?.sourceKind), id);
    assert.ok(['reachable', 'uncertain', 'dead'].includes(patch.verification?.linkHealth), id);
    assert.equal(typeof patch.verification?.notes, 'string', id);
    assert.ok(patch.verification.notes.length > 0, id);
    assert.ok(Array.isArray(patch.sources) && patch.sources.length > 0, id);

    for (const source of patch.sources) {
      const url = new URL(source.url);
      assert.ok(['http:', 'https:'].includes(url.protocol), `${id}: ${source.url}`);
      assert.ok(['official', 'reported'].includes(source.kind), `${id}: ${source.kind}`);
    }
  }
});

test('the complete collection remains valid after applying corrections', () => {
  assert.equal(corrected.length, 271);
  const validation = validateCompetitionCollectionV2(corrected);
  assert.deepEqual(validation.errors, []);
});

test('uncertain dates never enter countdown or calendar-eligible status', () => {
  const uncertainIds = [
    'qingchuangopc2026',
    'shundeaihack2026',
    'miaoyatoy2026',
    'aigcforfuture2026',
    'guangdongsensor2026',
    'goai',
    'creatorhackathonvol1',
    'oh',
  ];

  for (const id of uncertainIds) {
    const primary = correctedById.get(id).primaryDeadline;
    assert.notEqual(primary.certainty, 'confirmed', id);
    assert.equal(statusOf(primary, today).kind, 'unknown', id);
  }
});

test('Fujian finance models registration and solution delivery separately', () => {
  const competition = correctedById.get('fujianfinanceai2026');
  assert.deepEqual(
    competition.deadlines.map(({ type, date }) => ({ type, date })),
    [
      { type: 'registration', date: '2026-07-31' },
      { type: 'submission', date: '2026-08-31' },
    ],
  );
  assert.match(competition.audience, /2026-01-01/);
  assert.match(competition.audience, /2—3/);
  assert.ok(competition.rewards.every((reward) => !/总奖池/.test(reward)));
});

test('Zindi action links use the final zindi.world host', () => {
  for (const id of ['waxalasr2026', 'geoaiagua2026']) {
    const competition = correctedById.get(id);
    assert.equal(new URL(competition.url).hostname, 'zindi.world', id);
    assert.ok(competition.sources.every((item) => new URL(item.url).hostname === 'zindi.world'), id);
  }
});

test('multi-stage and sibling tracks are represented explicitly', () => {
  const pokemon = correctedById.get('pokemonagent2026');
  assert.equal(pokemon.recordType, 'series');
  assert.equal(pokemon.seriesId, 'pokemon-tcg-ai-battle-challenge-2026');
  assert.deepEqual(
    pokemon.deadlines.map((deadline) => deadline.date),
    ['2026-08-09', '2026-08-16', '2026-09-06', '2026-09-13'],
  );

  for (const id of [
    'wearableproactive2026',
    'wearableconversation2026',
    'wearablelongvideo2026',
  ]) {
    const competition = correctedById.get(id);
    assert.equal(competition.recordType, 'track', id);
    assert.equal(competition.seriesId, 'wearable-ai-grand-challenge-2026', id);
    assert.deepEqual(
      competition.deadlines.map((deadline) => deadline.date),
      ['2026-08-07', '2026-08-15'],
      id,
    );
  }
});

test('cash, credits, investment and financing are not conflated', () => {
  assert.match(correctedById.get('aifactory2026').desc, /未披露现金奖/);
  assert.match(correctedById.get('aiskillathon2026').verification.notes, /非现金/);
  assert.match(correctedById.get('jiangxitalent2026').verification.notes, /不是比赛现金奖金/);

  const miraclePlus = correctedById.get('mp');
  assert.equal(miraclePlus.url, 'https://www.miracleplus.com/apply/');
  assert.ok(miraclePlus.rewards.some((reward) => reward.includes('$300,000')));
  assert.ok(miraclePlus.rewards.some((reward) => reward.includes('7%')));
  assert.match(miraclePlus.desc, /股权投资，不是奖金/);
});

test('known dead action links have explicit safe fallbacks or warnings', () => {
  const openHarmony = correctedById.get('oh');
  assert.equal(openHarmony.url, 'https://www.openharmony.cn/');
  assert.equal(openHarmony.verification.linkHealth, 'reachable');
  assert.equal(openHarmony.primaryDeadline.certainty, 'unknown');

  const miraclePlus = correctedById.get('mp');
  assert.equal(new URL(miraclePlus.url).hostname, 'www.miracleplus.com');
  assert.equal(miraclePlus.verification.linkHealth, 'reachable');
  assert.equal(miraclePlus.primaryDeadline.certainty, 'rolling');
});
