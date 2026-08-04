import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competitions,
  enrichCompetition,
  getPrimaryDeadline,
  normalizeCompetitionCollection,
  statusOf,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';

const byId = new Map(competitions.map((competition) => [competition.id, competition]));
const today = new Date('2026-07-30T00:00:00+08:00');

test('the collection is unique and valid in both legacy and V2 schemas', () => {
  assert.equal(competitions.length, 313);
  assert.equal(new Set(competitions.map((competition) => competition.id)).size, competitions.length);
  assert.deepEqual(validateCompetitions(competitions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitions).errors, []);
});

test('normalization preserves legacy fields while adding V2 fields', () => {
  const legacy = {
    id: 'legacy',
    name: 'Legacy',
    deadlineISO: '2026-08-20',
    url: 'https://example.com/legacy',
    customLegacyField: 'keep-me',
  };
  const [normalized] = normalizeCompetitionCollection([legacy], {}, { updatedAt: '2026-07-30' });
  assert.equal(normalized.customLegacyField, 'keep-me');
  assert.equal(normalized.deadlineISO, '2026-08-20');
  assert.equal(normalized.primaryDeadline.date, '2026-08-20');
  assert.equal(normalized.primaryDeadline.certainty, 'confirmed');
  assert.equal(normalized.recordType, 'competition');
  assert.equal(normalized.parentId, null);
  assert.equal(normalized.seriesId, null);
});

test('an explicit primary deadline is the single source of truth for tracked additions', () => {
  const fields = ['date', 'type', 'certainty', 'timezone', 'label', 'sourceUrl'];
  const ids = [
    'square-enix-game-contest-2026',
    'indehub-hackathon-2026',
    'binzhi-graduate-robot-2026',
  ];

  for (const id of ids) {
    const competition = byId.get(id);
    const explicitPrimaries = competition.deadlines.filter((deadline) => deadline.primary);
    assert.equal(explicitPrimaries.length, 1, id);
    for (const field of fields) {
      assert.equal(competition.primaryDeadline[field], explicitPrimaries[0][field], `${id}.${field}`);
    }
  }

  const indeHub = byId.get('indehub-hackathon-2026');
  assert.equal(indeHub.deadlineISO, '2026-07-31');
  assert.equal(indeHub.primaryDeadline.type, 'registration');
  const registration = indeHub.deadlines.find((deadline) => deadline.type === 'registration');
  assert.equal(registration.date, '2026-07-31');
  assert.equal(registration.primary, true);
  const submission = indeHub.deadlines.find((deadline) => deadline.type === 'submission');
  assert.equal(submission.date, '2026-08-07');
  assert.equal(submission.primary, false);
});

test('V2 validation rejects primary deadline drift across every identity field', () => {
  const [record] = normalizeCompetitionCollection([{
    id: 'primary-drift',
    name: 'Primary drift',
    deadlineISO: '2026-08-21',
    url: 'https://example.com/competition',
    primaryDeadline: {
      date: '2026-08-21',
      type: 'application',
      certainty: 'estimated',
      timezone: 'UTC',
      label: 'Different label',
      sourceUrl: 'https://example.com/other-source',
    },
    deadlines: [{
      date: '2026-08-20',
      type: 'submission',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '投稿截止',
      sourceUrl: 'https://example.com/competition',
      primary: true,
    }],
  }], {}, { updatedAt: '2026-07-30' });

  const result = validateCompetitionCollectionV2([record]);
  assert.equal(result.valid, false);
  const fields = new Set(result.errors.map((error) => error.field));
  for (const field of ['date', 'type', 'certainty', 'timezone', 'label', 'sourceUrl']) {
    assert.ok(fields.has(`primaryDeadline.${field}`), field);
  }
});

test('V2 validation rejects multiple explicit primaries but keeps fallback compatibility', () => {
  const records = normalizeCompetitionCollection([{
    id: 'multiple-primary',
    name: 'Multiple primary',
    deadlineISO: '2026-08-20',
    url: 'https://example.com/multiple',
    deadlines: [
      {
        date: '2026-08-20',
        type: 'registration',
        certainty: 'confirmed',
        timezone: 'UTC',
        label: '报名截止',
        sourceUrl: 'https://example.com/multiple',
        primary: true,
      },
      {
        date: '2026-08-27',
        type: 'submission',
        certainty: 'confirmed',
        timezone: 'UTC',
        label: '投稿截止',
        sourceUrl: 'https://example.com/multiple',
        primary: true,
      },
    ],
  }, {
    id: 'implicit-primary',
    name: 'Implicit primary',
    deadlineISO: '2026-09-01',
    url: 'https://example.com/implicit',
    deadlines: [{
      date: '2026-09-01',
      type: 'submission',
      certainty: 'confirmed',
      timezone: 'UTC',
      label: '投稿截止',
      sourceUrl: 'https://example.com/implicit',
      primary: false,
    }],
  }], {}, { updatedAt: '2026-07-30' });

  const multiple = validateCompetitionCollectionV2([records[0]]);
  assert.equal(multiple.valid, false);
  assert.ok(multiple.errors.some((error) => error.field === 'deadlines'));

  const implicit = validateCompetitionCollectionV2([records[1]]);
  assert.equal(implicit.valid, true);
  assert.equal(records[1].primaryDeadline.date, '2026-09-01');
  assert.equal(records[1].primaryDeadline.type, 'submission');
});

test('Pokémon primary deadline is the mandatory intent, not the final report', () => {
  const pokemon = byId.get('pokemonagent2026');
  assert.equal(getPrimaryDeadline(pokemon).date, '2026-08-09');
  assert.deepEqual(
    pokemon.deadlines.map((deadline) => deadline.date),
    ['2026-08-09', '2026-08-16', '2026-09-06', '2026-09-13'],
  );
});

test('AI Infra models registration/start and final submission separately', () => {
  const competition = byId.get('aiinfrasummit2026');
  assert.equal(getPrimaryDeadline(competition).date, '2026-09-10');
  assert.equal(competition.deadlines.find((deadline) => deadline.type === 'submission').date, '2026-09-17');
});

test('rolling, unknown, and estimated dates never enter urgent countdown', () => {
  const ids = [
    'oh',
    'hax',
    'hwdevcomp',
    'mihome',
    'geekpark',
    'builderx',
    'wise36kr',
    'creatorhackathonvol1',
  ];
  for (const id of ids) {
    const competition = byId.get(id);
    const primary = getPrimaryDeadline(competition);
    assert.notEqual(primary.certainty, 'confirmed', id);
    assert.equal(statusOf(primary, today).kind, 'unknown', id);
    assert.equal(enrichCompetition(competition, today).status.kind, 'unknown', id);
  }
});

test('Agentic Cinema retains five rule tracks totaling $65,000 and the directory conflict', () => {
  const competition = byId.get('agenticcinema2026');
  assert.match(competition.desc, /5 个奖金轨/);
  assert.match(competition.desc, /合计现金 65,000 美元/);
  assert.equal(competition.prizeBoundary.cash.length, 5);
  assert.equal(
    competition.prizeBoundary.cash.reduce((sum, prize) => sum + prize.amount, 0),
    65000,
  );
  assert.match(competition.verification.notes, /USD 75,000/);
});

test('all twelve high-confidence research additions are present', () => {
  const ids = [
    'pazhou-super-claw-2026',
    'pazhou-ai-application-2026',
    'guangzhou-super-agent-2026',
    'vacat-2026',
    'cuhkx-2026',
    'global-digital-education-2026',
    'malanshan-ai-microdrama-2026',
    'we-are-human-film-2026',
    'world-usability-design-2026',
    'ifcomp-2026',
    'unu-ai-sdgs-2026',
    'industrial-internet-2026',
  ];
  for (const id of ids) assert.ok(byId.has(id), id);
});

test('new verified records retain official sources and qualification boundaries', () => {
  const unu = byId.get('unu-ai-sdgs-2026');
  assert.equal(unu.verification.status, 'verified');
  assert.equal(unu.verification.sourceKind, 'official');
  assert.match(unu.audience, /TRL 6\+/);
  assert.ok(unu.sources.some((source) => source.url.startsWith('https://unu.edu/')));

  const film = byId.get('we-are-human-film-2026');
  assert.match(film.audience, /18/);
  assert.match(film.rewards.join(' '), /€5,000/);

  const guangzhou = byId.get('guangzhou-super-agent-2026');
  assert.equal(getPrimaryDeadline(guangzhou).date, '2026-07-31');
  assert.equal(getPrimaryDeadline(guangzhou).certainty, 'confirmed');

  const industrial = byId.get('industrial-internet-2026');
  assert.equal(getPrimaryDeadline(industrial).date, '2026-09-21');
  assert.equal(getPrimaryDeadline(industrial).certainty, 'confirmed');
});

test('dead primary action links fall back to a reachable organizer page with a warning', () => {
  const step = byId.get('stepsoftware2026');
  assert.equal(step.url, 'https://www.stepelectric.com/');
  assert.equal(step.verification.linkHealth, 'dead');
  assert.equal(getPrimaryDeadline(step).certainty, 'estimated');
  assert.match(step.verification.notes, /404/);
  assert.ok(step.sources.every((source) => source.url !== 'https://www.stepelectric.com/Product_detail_by/103.html'));
});

test('default source labels no longer assert official status', () => {
  const misleading = competitions.flatMap((competition) => competition.sources)
    .filter((source) => source.title.startsWith('官方赛事页｜'));
  assert.deepEqual(misleading, []);
});

test('parent-child validation accepts existing parents and rejects missing parents', () => {
  const raw = [
    {
      id: 'series',
      name: 'Series',
      deadlineISO: '2026-10-01',
      url: 'https://example.com/series',
      recordType: 'series',
    },
    {
      id: 'track',
      name: 'Track',
      deadlineISO: '2026-09-01',
      url: 'https://example.com/track',
      recordType: 'track',
      parentId: 'series',
      seriesId: 'series',
    },
  ];
  const normalized = normalizeCompetitionCollection(raw, {}, { updatedAt: '2026-07-30' });
  assert.equal(validateCompetitionCollectionV2(normalized).valid, true);

  normalized[1] = { ...normalized[1], parentId: 'missing' };
  const invalid = validateCompetitionCollectionV2(normalized);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.field === 'parentId'));
});
