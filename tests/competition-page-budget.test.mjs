import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';

const builtPageUrl = new URL('../dist/competitions/index.html', import.meta.url);
const pageSourceUrl = new URL('../src/pages/competitions.astro', import.meta.url);
const workbenchSourceUrl = new URL('../src/lib/competition-workbench.js', import.meta.url);
// Round5（2026-08-02）起记录数 221 → 271，HTML 预算按数据量等比上调；
// Round6（2026-08-04）271 → 313（约 +15.5%），预算按同一等比规则上调至 1.62MB；
// Round6.5（2026-08-04 同日补扫）313 → 315，实际体积仍低于 1.62MB 预算，不再上调；
// Round7（2026-08-05）315 → 364（约 +15.6%），预算按同一等比规则上调至 1.87MB；
// Round9（2026-08-06）364 → 370，实测仍低于 1.87MB，不上调预算；
// Round10（2026-08-06）370 → 373，增量很小，仍沿用现有预算；
// Round11（2026-08-06）373 → 381，页面体积仍需保持在同一预算内；
// Round13（2026-08-06）381 → 394，新增 13 条科研 / Agent 赛事；HTML 字节仍沿用现有预算，
// Round14（2026-08-06）394 → 409，新增 15 条官网核验赛事；预算上调至 1.95MB / 8,600 元素；
// Round15（2026-08-07）409 → 419，再补 10 条大厂产品赛，按条目数约 +2.4% 等比上调至
// 2.0MB / 8,820 元素，仍要求每条记录只保留一行和一个详情链接。
// Round16（2026-08-09）419 → 420，补入支付宝 AI 支付开发者激励计划，体积增量很小，预算不变。
// Round17（2026-08-09）420 → 429，补入魔搭当前比赛与两项鸿蒙激励；实测 2,013,508 字节，
// 按记录数约 +1.7% 将 HTML 预算等比上调至 2.035MB，DOM 仍保持原上限。
// Round19（2026-08-09）429 → 434，补入全网检索核验的监管、医疗 Agent 与学生 AI 赛事；预算小幅上调。
// Round22（2026-08-09）434 → 439，补入知乎内容征集、Caspian、eGain、OpenSearch 与 TikTok TechJam。
// 线上经 Brotli/gzip 后传输量远小于原始字节。
const HTML_BUDGET_BYTES = 2_110_000;
const DOM_ELEMENT_BUDGET = 9_080;

test('competition radar stays within the production page budget', async () => {
  const html = await readFile(builtPageUrl, 'utf8');
  const bytes = Buffer.byteLength(html);
  const elementCount = html.match(/<[a-zA-Z][^>]*>/g)?.length ?? 0;

  assert.ok(
    bytes < HTML_BUDGET_BYTES,
    `competitions/index.html is ${bytes.toLocaleString()} bytes; budget is < ${HTML_BUDGET_BYTES.toLocaleString()}`,
  );
  assert.ok(
    elementCount < DOM_ELEMENT_BUDGET,
    `competitions/index.html has approximately ${elementCount.toLocaleString()} elements; budget is < ${DOM_ELEMENT_BUDGET.toLocaleString()}`,
  );
});

test('budget savings retain every record, no-JS links, and one reusable detail panel', async () => {
  const html = await readFile(builtPageUrl, 'utf8');
  const dataMatch = html.match(/<script id="competition-data" type="application\/json">([\s\S]*?)<\/script>/);

  assert.ok(dataMatch, 'serialized workbench data is present');
  const records = JSON.parse(dataMatch[1]);
  assert.equal(records.length, competitions.length, 'all competition records remain available to search and render');

  const listItemCount = html.match(/class="cp-list-item relative"/g)?.length ?? 0;
  const noJsDetailLinkCount = html.match(/<a\b[^>]*data-select-competition/g)?.length ?? 0;
  const detailPanelCount = html.match(/id="detail-panel"/g)?.length ?? 0;
  const projectPresetCount = html.match(/\bdata-project="[^"]+"/g)?.length ?? 0;
  const accessFilterCount = html.match(/\bdata-faccess="[^"]+"/g)?.length ?? 0;
  assert.equal(listItemCount, competitions.length, 'all records remain server-rendered in the basic list');
  assert.equal(noJsDetailLinkCount, competitions.length, 'each record keeps a no-JS detail-page link');
  assert.equal(detailPanelCount, 1, 'the workbench reuses one detail DOM container');
  assert.equal(projectPresetCount, 9, 'the project-first picker stays a small fixed control set');
  assert.equal(accessFilterCount, 5, 'access filters stay a small fixed control set');
  assert.ok(records.every(record => Array.isArray(record.projectPresetIds)));
  assert.ok(records.every(record => ['open', 'special', 'unknown', 'blocked'].includes(record.access?.group)));
});

test('client detail renderer does not interpolate record text into HTML', async () => {
  const pageSource = await readFile(pageSourceUrl, 'utf8');
  const source = await readFile(workbenchSourceUrl, 'utf8');
  assert.equal(pageSource.match(/competition-workbench\.js/g)?.length, 1);
  assert.doesNotMatch(pageSource, /__competitionRadarAbort/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.doesNotMatch(source, /insertAdjacentHTML/);
  assert.match(source, /textContent/);
  assert.match(source, /record\.calendarEligible !== true/);
  assert.match(source, /statusForDeadline\(record\.deadline, record\.calendarEligible\)/);
  assert.match(source, /isConfirmed !== true/);
  assert.match(source, /event\.metaKey/);
});

test('project preset state round-trips through the URL and composes with existing filters', async () => {
  const source = await readFile(workbenchSourceUrl, 'utf8');
  assert.match(source, /url\.searchParams\.set\('project', state\.project\)/);
  assert.match(source, /urlParams\.get\('project'\)/);
  assert.match(source, /record\.projectPresetIds\.includes\(state\.project\)/);
  assert.match(source, /state\.cat === '全部'/);
  assert.match(source, /state\.status === '全部'/);
  assert.match(source, /state\.favoritesOnly/);
  assert.match(source, /record\.searchText\.includes\(query\)/);
});

test('project action recommendations exclude low-priority media formats unless they pass the reward exception', async () => {
  const pageSource = await readFile(pageSourceUrl, 'utf8');
  const workbenchSource = await readFile(workbenchSourceUrl, 'utf8');

  assert.match(pageSource, /evaluateCompetitionIntake/);
  assert.match(pageSource, /recommendationEligible/);
  assert.match(pageSource, /recommendationEligibilityByCompetition\.get\(c\.id\)/);
  assert.match(workbenchSource, /record\.recommendationEligible === true/);
  assert.match(pageSource, /纯视频或纯音乐赛事默认不进入主动推荐/);
});
