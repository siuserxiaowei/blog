import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFICIAL_CATALOGS_CHECKED_AT,
  huaweiCloudOfficialCatalog,
  tencentCloudOfficialCatalog,
  volcengineOfficialCatalog,
} from '../src/data/competition-official-catalogs.js';

test('Tencent Cloud official overview is preserved in full', () => {
  assert.equal(OFFICIAL_CATALOGS_CHECKED_AT, '2026-08-06');
  assert.equal(tencentCloudOfficialCatalog.length, 11);
  assert.equal(new Set(tencentCloudOfficialCatalog.map((item) => item.officialId)).size, 11);
  assert.deepEqual(
    tencentCloudOfficialCatalog.map((item) => item.officialId).sort((a, b) => a - b),
    [31, 32, 33, 34, 36, 37, 38, 39, 40, 41, 42],
  );
  for (const item of tencentCloudOfficialCatalog) {
    assert.match(item.officialUrl, /^https:\/\/tch\.cloud\.tencent\.com\/contest(?:\/\d+)?$/);
  }
});

test('Huawei Cloud official directory keeps all current and historical records', () => {
  assert.equal(huaweiCloudOfficialCatalog.length, 423);
  assert.equal(new Set(huaweiCloudOfficialCatalog.map((item) => item.competitionId)).size, 423);
  assert.equal(new Set(huaweiCloudOfficialCatalog.map((item) => item.urlId)).size, 423);
  assert.equal(huaweiCloudOfficialCatalog.filter((item) => item.currentStatus === 0).length, 5);
  assert.equal(huaweiCloudOfficialCatalog.filter((item) => item.currentStatus === 2).length, 418);
  for (const item of huaweiCloudOfficialCatalog) {
    assert.match(item.officialUrl, new RegExp(`/competition/(?:advance|information)/${item.urlId}$`));
    assert.ok(item.name.length >= 2);
  }
});

test('Volcano Cup official overview is preserved 63/63 without hiding restricted events', () => {
  assert.equal(volcengineOfficialCatalog.length, 63);
  assert.equal(new Set(volcengineOfficialCatalog.map((item) => item.publicId)).size, 63);
  assert.equal(volcengineOfficialCatalog.filter((item) => item.stageName === '独立赛').length, 62);
  assert.equal(
    volcengineOfficialCatalog.filter((item) => item.workSubmitEndTime >= '2026-08-06').length,
    36,
  );
  for (const item of volcengineOfficialCatalog) {
    assert.match(item.publicId, /^\d+$/);
    assert.equal(item.parentPublicId, '294477791410262016');
    assert.match(item.officialUrl, new RegExp(`/competition/${item.publicId}$`));
    assert.ok(item.name.length >= 2);
  }
});
