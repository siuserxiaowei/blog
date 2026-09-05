import assert from 'node:assert/strict';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';
import {
  ROUND12_CORRECTIONS_CHECKED_AT,
  competitionRound12Corrections,
} from '../src/data/competition-round12-corrections.js';

const id = 'wuhu-compute-algorithm-2026';
const articleUrl = 'https://mp.weixin.qq.com/s/5CYFEmBR3KkA6yJDD5_r-w';

test('the supplied WeChat article enriches the existing Wuhu contest without duplicating it', () => {
  assert.equal(ROUND12_CORRECTIONS_CHECKED_AT, '2026-08-06');
  assert.deepEqual(Object.keys(competitionRound12Corrections), [id]);
  assert.equal(competitions.filter((item) => item.id === id).length, 1);
  assert.equal(competitions.length, 439);

  const record = competitions.find((item) => item.id === id);
  assert.ok(record);
  assert.ok(record.sources.some((source) => source.url === articleUrl));
  assert.ok(record.sources.some((source) => source.url === 'https://cvmart.net/cv_landing/list/wuhu2026'));
});

test('the article closes the missing-WeChat-evidence note without inventing a deadline', () => {
  const record = competitions.find((item) => item.id === id);
  const article = record.sources.find((source) => source.url === articleUrl);

  assert.equal(article.kind, 'reported');
  assert.equal(article.date, '2026-08-06');
  assert.match(article.title, /AINLP.*50 万赏金/);
  assert.doesNotMatch(record.cons.join(' '), /公众号原文待补/);
  assert.doesNotMatch(record.verification.notes, /公众号原文待补/);

  assert.equal(record.primaryDeadline.certainty, 'estimated');
  assert.equal(record.primaryDeadline.date, '2026-08-31');
  assert.match(record.primaryDeadline.label, /预计 8 月底.*待确认/);
});
