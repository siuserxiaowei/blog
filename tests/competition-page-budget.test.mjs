import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';

const builtPageUrl = new URL('../dist/competitions/index.html', import.meta.url);
const workbenchSourceUrl = new URL('../src/lib/competition-workbench.js', import.meta.url);
const HTML_BUDGET_BYTES = 1_200_000;
const DOM_ELEMENT_BUDGET = 8_000;

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
  assert.equal(listItemCount, competitions.length, 'all records remain server-rendered in the basic list');
  assert.equal(noJsDetailLinkCount, competitions.length, 'each record keeps a no-JS detail-page link');
  assert.equal(detailPanelCount, 1, 'the workbench reuses one detail DOM container');
  assert.equal(projectPresetCount, 8, 'the project-first picker stays a small fixed control set');
  assert.ok(records.every(record => Array.isArray(record.projectPresetIds)));
});

test('client detail renderer does not interpolate record text into HTML', async () => {
  const source = await readFile(workbenchSourceUrl, 'utf8');
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
