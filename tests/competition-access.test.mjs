import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';
import {
  ACCESS_FILTERS,
  accessMatchesFilter,
  getCompetitionAccessSummary,
} from '../src/lib/competition-access.js';

const byId = new Map(competitions.map(competition => [competition.id, competition]));

test('chinaEligible uses a strict allowlist and never upgrades unknown or missing values', () => {
  const cases = [
    ['yes', 'open', '大陆可参加'],
    ['no', 'blocked', '大陆不可参加'],
    ['yes-with-travel', 'special', '可参加但需出行'],
    ['not-stated', 'unknown', '资格待核'],
    ['unknown', 'unknown', '资格待核'],
    [undefined, 'unknown', '资格待核'],
  ];
  for (const [chinaEligible, group, label] of cases) {
    const summary = getCompetitionAccessSummary({ eligibility: { chinaEligible } });
    assert.equal(summary.group, group);
    assert.equal(summary.displayLabel, label);
    assert.notEqual(summary.chinaEligibility.value, chinaEligible === 'unknown' ? 'yes' : '__never__');
  }
});

test('china=no always wins over otherwise attractive audience text', () => {
  const summary = getCompetitionAccessSummary({
    eligibility: { chinaEligible: 'no', regions: ['明确排除中国居民'] },
    audience: '全球开发者、个人和团队均可参加',
    cons: [],
  });
  assert.equal(summary.group, 'blocked');
  assert.equal(summary.chinaEligibility.label, '大陆不可参加');
});

test('known records separate ordinary mainland access, special gates, travel, unknown, and no-go', () => {
  assert.equal(getCompetitionAccessSummary(byId.get('waxalasr2026')).group, 'open');
  assert.equal(getCompetitionAccessSummary(byId.get('agenticcinema2026')).group, 'blocked');
  assert.equal(getCompetitionAccessSummary(byId.get('supabase-select-hackathon-2026')).group, 'special');
  assert.equal(getCompetitionAccessSummary(byId.get('nanningopc2026')).group, 'unknown');
  assert.equal(getCompetitionAccessSummary(byId.get('aicomp-agent-development-2026')).group, 'special');
});

test('hard gates retain evidence without treating broad audiences as mandatory identity gates', () => {
  const student = getCompetitionAccessSummary(byId.get('aicomp-agent-development-2026'));
  assert.deepEqual(student.gates.map(gate => gate.kind), ['student', 'team', 'travel']);
  assert.match(student.gates.find(gate => gate.kind === 'student').value, /学籍|学生/);
  assert.match(student.gates.find(gate => gate.kind === 'team').value, /2–3|同校/);

  const youth = getCompetitionAccessSummary(byId.get('unescohack2026'));
  assert.ok(!youth.gates.some(gate => gate.kind === 'student'));
  assert.ok(youth.gates.some(gate => gate.kind === 'age'));
  assert.ok(youth.gates.some(gate => gate.kind === 'team'));

  const publicGroup = getCompetitionAccessSummary(byId.get('hong-kong-aigc-culture-2026'));
  assert.ok(!publicGroup.gates.some(gate => gate.kind === 'student'));
});

test('returnee, company, and offline gates appear only with explicit evidence', () => {
  const summary = getCompetitionAccessSummary({
    eligibility: {
      chinaEligible: 'yes',
      scope: 'institution-only',
      regions: ['中国全国'],
      team: '初创企业；最多 4 人',
    },
    audience: '仅限海外留学人员创办的公司；决赛须赴上海现场路演。',
    cons: [],
  });
  assert.equal(summary.group, 'special');
  assert.deepEqual(
    summary.gates.map(gate => gate.kind),
    ['region', 'organization', 'returnee', 'team', 'travel'],
  );
  assert.ok(summary.gates.every(gate => gate.evidenceField && gate.value));
});

test('filter definitions are stable and every current record receives one valid group', () => {
  assert.deepEqual(
    ACCESS_FILTERS.map(filter => filter.id),
    ['all', 'open', 'special', 'unknown', 'blocked'],
  );
  const groups = new Set(ACCESS_FILTERS.slice(1).map(filter => filter.id));
  for (const competition of competitions) {
    const summary = getCompetitionAccessSummary(competition);
    assert.ok(groups.has(summary.group), `${competition.id}: invalid access group`);
    assert.ok(accessMatchesFilter(summary, summary.group));
    assert.equal(new Set(summary.gates.map(gate => gate.kind)).size, summary.gates.length);
  }
});

test('round-four structured scopes remain special even without keyword inference', () => {
  const specialScopes = [
    'returnee-required',
    'city-affiliation-required',
    'overseas-identity-required',
    'region-limited',
    'youth-or-innovation-team',
    'global-with-onsite-final',
    'track-dependent',
  ];
  for (const scope of specialScopes) {
    const summary = getCompetitionAccessSummary({
      eligibility: { chinaEligible: 'yes', scope },
    });
    assert.equal(summary.group, 'special', scope);
  }
});

test('round-four records expose their decisive qualification boundaries', () => {
  const summaries = new Map([
    'chongqing-returnee-innovation-2026',
    'hubei-returnee-innovation-2026',
    'shenzhen-generative-ai-skills-2026',
    'liaoning-qiangsheng-cup-2026',
    'guangzhou-global-startup-special-eligibility-2026',
    'western-land-sea-audiovisual-2026',
    'clean-bayu-microdrama-2026',
    'shandong-air-ground-ai-student-2026',
    'ruc-global-ai-governance-safety-2026',
    'the-great-agent-hackathon-2026',
    'gx-ai-nonferrous-metals-2026',
  ].map(id => {
    assert.ok(byId.has(id), `${id}: missing round-four record`);
    return [id, getCompetitionAccessSummary(byId.get(id))];
  }));
  const gate = (id, kind) => summaries.get(id).gates.find(item => item.kind === kind);

  for (const id of ['chongqing-returnee-innovation-2026', 'hubei-returnee-innovation-2026']) {
    assert.equal(summaries.get(id).group, 'special');
    assert.ok(gate(id, 'returnee'));
    assert.ok(gate(id, 'region'));
  }
  assert.match(gate('hubei-returnee-innovation-2026', 'organization').value, /组队单位/);

  const shenzhenId = 'shenzhen-generative-ai-skills-2026';
  assert.equal(summaries.get(shenzhenId).group, 'special');
  assert.ok(gate(shenzhenId, 'region'));
  assert.ok(gate(shenzhenId, 'age'));
  assert.match(gate(shenzhenId, 'organization').value, /单位签章/);

  const liaoningId = 'liaoning-qiangsheng-cup-2026';
  assert.equal(summaries.get(liaoningId).group, 'special');
  assert.match(gate(liaoningId, 'region').label, /赛轨/);
  assert.match(gate(liaoningId, 'region').value, /创意组国内外开放；产品组限辽宁产品/);

  const guangzhouId = 'guangzhou-global-startup-special-eligibility-2026';
  assert.equal(summaries.get(guangzhouId).group, 'special');
  assert.match(gate(guangzhouId, 'returnee').label, /海外身份/);
  assert.match(gate(guangzhouId, 'region').value, /广州落地/);

  const westernId = 'western-land-sea-audiovisual-2026';
  assert.equal(summaries.get(westernId).group, 'special');
  assert.match(gate(westernId, 'region').value, /云南；广西；重庆；四川；贵州；陕西/);
  assert.ok(!gate(westernId, 'organization'), 'individual entrants must not become an organization gate');

  const cleanBayu = summaries.get('clean-bayu-microdrama-2026');
  assert.equal(cleanBayu.group, 'open');
  assert.deepEqual(cleanBayu.gates, []);

  const shandongId = 'shandong-air-ground-ai-student-2026';
  assert.equal(summaries.get(shandongId).group, 'special');
  assert.ok(gate(shandongId, 'student'));
  assert.ok(!gate(shandongId, 'region'), 'an undisclosed Shandong-only rule must not be invented');

  const rucId = 'ruc-global-ai-governance-safety-2026';
  assert.equal(summaries.get(rucId).group, 'special');
  assert.match(gate(rucId, 'age').value, /青年年龄定义未披露/);

  const agentId = 'the-great-agent-hackathon-2026';
  assert.equal(summaries.get(agentId).group, 'special');
  assert.match(gate(agentId, 'travel').value, /自费赴 Bangalore/);

  const guangxiId = 'gx-ai-nonferrous-metals-2026';
  assert.equal(summaries.get(guangxiId).group, 'special');
  assert.match(gate(guangxiId, 'region').label, /赛轨/);
  assert.match(gate(guangxiId, 'region').value, /专业 \/ 高校 \/ 东盟三轨/);
});

test('workbench access UI keeps URL state, conservative recommendation gating, and safe text writes', async () => {
  const source = await readFile(new URL('../src/lib/competition-workbench.js', import.meta.url), 'utf8');
  assert.match(source, /url\.searchParams\.set\('access', state\.access\)/);
  assert.match(source, /urlParams\.get\('access'\)/);
  assert.match(source, /record\.access\.group === state\.access/);
  assert.match(source, /record\.access\.group !== 'blocked'/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.doesNotMatch(source, /insertAdjacentHTML/);
});
