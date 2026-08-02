export const ACCESS_FILTERS = Object.freeze([
  Object.freeze({ id: 'all', label: '全部' }),
  Object.freeze({ id: 'open', label: '普通大陆团队可投' }),
  Object.freeze({ id: 'special', label: '特殊资格' }),
  Object.freeze({ id: 'unknown', label: '资格待核' }),
  Object.freeze({ id: 'blocked', label: '明确不可投' }),
]);

export const ACCESS_FILTER_IDS = new Set(ACCESS_FILTERS.map(filter => filter.id));

const ACCESS_GROUPS = Object.freeze({
  open: Object.freeze({ label: '普通大陆团队可投', tone: 'open' }),
  special: Object.freeze({ label: '特殊资格', tone: 'special' }),
  unknown: Object.freeze({ label: '资格待核', tone: 'unknown' }),
  blocked: Object.freeze({ label: '明确不可投', tone: 'blocked' }),
});

const CHINA_ELIGIBILITY = Object.freeze({
  yes: Object.freeze({ label: '大陆可参加', confirmed: true }),
  no: Object.freeze({ label: '大陆不可参加', confirmed: true }),
  'yes-with-travel': Object.freeze({ label: '可参加但需出行', confirmed: true }),
  'not-stated': Object.freeze({ label: '资格待核', confirmed: false }),
  missing: Object.freeze({ label: '资格待核', confirmed: false }),
});

const SCOPE_RULES = Object.freeze({
  'age-limited': Object.freeze({ special: true }),
  'city-affiliation-required': Object.freeze({
    special: true,
    regionLabel: '城市关联',
    ageEvidence: 'explicit',
    organizationFromCons: true,
  }),
  'country-limited': Object.freeze({ special: true }),
  'global-limited': Object.freeze({ special: true }),
  'global-students': Object.freeze({ special: true }),
  'global-with-onsite-final': Object.freeze({ special: true, travel: true }),
  'institution-only': Object.freeze({ special: true }),
  'onsite-unspecified': Object.freeze({ special: true, travel: true }),
  'overseas-identity-required': Object.freeze({
    special: true,
    identityLabel: '港澳台 / 海外身份',
    regionLabel: '身份 / 落地区域',
  }),
  'referral-required': Object.freeze({ special: true }),
  'region-limited': Object.freeze({ special: true, regionLabel: '限定地区' }),
  'returnee-required': Object.freeze({
    special: true,
    identityLabel: '留学 / 海外经历',
    regionLabel: '发展 / 落地区域',
    organizationFromTeam: true,
  }),
  'students-only': Object.freeze({ special: true }),
  'track-dependent': Object.freeze({ special: true, regionLabel: '赛轨 / 地区边界' }),
  'youth-or-innovation-team': Object.freeze({
    special: true,
    ageEvidence: 'youth-boundary',
    ageLabel: '青年 / 年龄口径',
  }),
});

const STUDENT_PATTERN = /(?:仅限?|只限)[^；。]{0,32}(?:学生|研究生|本科生|专科生|在校生)|(?:须|必须|队长须|成员须)[^；。]{0,32}(?:在读|正式学籍|学生|研究生)|正式学籍|强学籍限制|学生限定|在校学生/i;
const ORGANIZATION_PATTERN = /(?:仅限?|只限)[^；。]{0,40}(?:初创企业|公司|企业|机构|高校|科研院所|企事业单位|法人)|(?:须|必须|要求)[^；。]{0,48}(?:公司主体|企业主体|机构组队|推荐渠道|工程师资格|融资证明)|初创企业；须|强机构组队|强推荐制|不接受普通自助海选|公司\s*[/／]\s*职业组织不可参赛|职业组织不可参加|技术负责人须具备工程师资格/i;
const RETURNEE_PATTERN = /留学人员|海外留学|在外留学|归国|归侨|海归|境外学习经历|海外人才|港澳台人才/i;
const OVERSEAS_IDENTITY_PATTERN = /港澳台|外籍|海外(?:身份|学习|工作)|留学|境外学习经历/i;
const AGE_PATTERN = /(?:年龄|年满|满)\s*\d+|\d+\s*(?:岁|\+)|\d+\s*[–—-]\s*\d+\s*岁|成年|未满\s*\d+/i;
const TEAM_PATTERN = /最多\s*\d+\s*人|不超过\s*\d+\s*人|\d+\s*[–—-]\s*\d+\s*人|仅个人参赛|个人参赛|solo|同校|不得跨校|队长|组队|不超过\s*\d+\s*家单位联合/i;
const TRAVEL_PATTERN = /(?:必须|须|需|入围|决赛|获选|前四名|六强|至少一名)[^；。]{0,56}(?:现场|线下|赴|参会|展示|答辩|路演|决赛|颁奖)|差旅|签证|现场参加|现场答辩|决赛落地|须到/i;
const RESTRICTED_REGION_PATTERN = /仅限|排除|受限|中国|印度|日本|美国|欧洲|境内|境外|公民|居住|国籍|赴|现场/i;
const NO_GATE_PATTERN = /未注明|未披露|未列|未写|待[^；。]{0,12}复核|待确认|未完整披露|人数上限以规则为准|人数未限制|团队未限制|不限制团队|个人\s*[/／]\s*团队未限制|preferred[^；。]{0,24}非\s*required/i;
const REWARD_ONLY_PATTERN = /奖励|奖品|奖金|RDC/i;

function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function evidencePieces(record) {
  const eligibility = record?.eligibility && typeof record.eligibility === 'object'
    ? record.eligibility
    : {};
  return [
    { field: 'eligibility.team', text: clean(eligibility.team) },
    { field: 'audience', text: clean(record?.audience) },
    ...(Array.isArray(record?.cons)
      ? record.cons.map((text, index) => ({ field: `cons[${index}]`, text: clean(text) }))
      : []),
  ].filter(piece => piece.text);
}

function matchingEvidence(pieces, pattern, options = {}) {
  return pieces.find(piece => {
    if (!pattern.test(piece.text)) return false;
    if (options.excludeRewardOnly && REWARD_ONLY_PATTERN.test(piece.text)) return false;
    if (options.excludeNoGate && NO_GATE_PATTERN.test(piece.text)) return false;
    return true;
  }) ?? null;
}

function normalizeChinaEligibility(value) {
  if (value === undefined || value === null || value === '') {
    return { value: 'missing', rawValue: null, ...CHINA_ELIGIBILITY.missing };
  }
  const rawValue = clean(String(value)).toLocaleLowerCase();
  if (Object.hasOwn(CHINA_ELIGIBILITY, rawValue) && rawValue !== 'missing') {
    return { value: rawValue, rawValue, ...CHINA_ELIGIBILITY[rawValue] };
  }
  return {
    value: 'not-stated',
    rawValue,
    invalidValue: true,
    ...CHINA_ELIGIBILITY['not-stated'],
  };
}

function addGate(gates, kind, label, evidence, value = evidence?.text) {
  const text = clean(value);
  if (!evidence || !text || gates.some(gate => gate.kind === kind)) return;
  gates.push({
    kind,
    label,
    value: text,
    evidenceField: evidence.field,
  });
}

function hasSpecialTeamComposition(teamGate) {
  return Boolean(teamGate && /仅个人|个人参赛|同校|不得跨校|队长|学生|研究生|指导教师|不少于|单位联合/i.test(teamGate.value));
}

export function getCompetitionAccessSummary(record) {
  const eligibility = record?.eligibility && typeof record.eligibility === 'object'
    ? record.eligibility
    : {};
  const scope = clean(eligibility.scope).toLocaleLowerCase();
  const scopeRule = SCOPE_RULES[scope] ?? null;
  const china = normalizeChinaEligibility(eligibility.chinaEligible);
  const pieces = evidencePieces(record);
  const gates = [];

  const studentEvidence = matchingEvidence(pieces, STUDENT_PATTERN);
  if (studentEvidence || scope === 'students-only' || scope === 'global-students') {
    addGate(
      gates,
      'student',
      '学生 / 学籍',
      studentEvidence ?? { field: 'eligibility.scope', text: eligibility.scope },
    );
  }

  const regions = Array.isArray(eligibility.regions)
    ? eligibility.regions.map(clean).filter(Boolean)
    : [];
  const regionText = regions.join('；');
  const hasStrongRegionGate = RESTRICTED_REGION_PATTERN.test(regionText)
    && (!NO_GATE_PATTERN.test(regionText) || /仅限|排除|受限|须|赴|现场|中国全国|中国；|境内|境外/i.test(regionText));
  if (regionText && (hasStrongRegionGate || china.value === 'no' || china.value === 'yes-with-travel')) {
    addGate(gates, 'region', '地区 / 居住地', { field: 'eligibility.regions', text: regionText });
  }

  const organizationEvidence = matchingEvidence(pieces, ORGANIZATION_PATTERN, { excludeRewardOnly: true });
  const hasAlternativeEntrantTypes = organizationEvidence
    && /(?:个人[^；。]{0,40}(?:机构|企业|法人)|(?:机构|企业|法人)[^；。]{0,40}个人)/i.test(organizationEvidence.text);
  if ((organizationEvidence && !hasAlternativeEntrantTypes) || scope === 'institution-only' || scope === 'referral-required') {
    addGate(
      gates,
      'organization',
      '组织 / 主体',
      (organizationEvidence && !hasAlternativeEntrantTypes)
        ? organizationEvidence
        : { field: 'eligibility.scope', text: eligibility.scope },
    );
  }

  const returneeEvidence = matchingEvidence(pieces, RETURNEE_PATTERN);
  if (returneeEvidence) addGate(gates, 'returnee', '留学 / 海外身份', returneeEvidence);

  const ageEvidence = matchingEvidence(pieces, AGE_PATTERN, { excludeRewardOnly: true, excludeNoGate: true });
  if (ageEvidence || scope === 'age-limited') {
    addGate(
      gates,
      'age',
      '年龄',
      ageEvidence ?? { field: 'eligibility.scope', text: eligibility.scope },
    );
  }

  const structuredTeam = clean(eligibility.team);
  const teamEvidence = structuredTeam && !NO_GATE_PATTERN.test(structuredTeam) && TEAM_PATTERN.test(structuredTeam)
    ? { field: 'eligibility.team', text: structuredTeam }
    : matchingEvidence(pieces.filter(piece => piece.field !== 'eligibility.team'), TEAM_PATTERN, { excludeNoGate: true });
  if (teamEvidence) addGate(gates, 'team', '团队', teamEvidence);

  const travelEvidence = matchingEvidence(pieces, TRAVEL_PATTERN, { excludeNoGate: true });
  if (travelEvidence || china.value === 'yes-with-travel') {
    addGate(
      gates,
      'travel',
      '线下 / 出行',
      travelEvidence
        ?? { field: regions.length ? 'eligibility.regions' : 'eligibility.chinaEligible', text: regionText || china.label },
    );
  }

  if (scopeRule?.identityLabel) {
    const identityEvidence = matchingEvidence(pieces, OVERSEAS_IDENTITY_PATTERN);
    addGate(gates, 'returnee', scopeRule.identityLabel, identityEvidence);
  }

  if (scopeRule?.regionLabel && regionText && !NO_GATE_PATTERN.test(regionText)) {
    addGate(
      gates,
      'region',
      scopeRule.regionLabel,
      { field: 'eligibility.regions', text: regionText },
    );
  }

  const mappedAgeEvidence = scopeRule?.ageEvidence === 'explicit'
    ? AGE_PATTERN.test(structuredTeam)
    : scopeRule?.ageEvidence === 'youth-boundary'
      ? /青年|年龄/i.test(structuredTeam)
      : false;
  if (mappedAgeEvidence) {
    addGate(
      gates,
      'age',
      scopeRule.ageLabel ?? '年龄',
      { field: 'eligibility.team', text: structuredTeam },
    );
  }

  if (scopeRule?.organizationFromCons) {
    const organizationGateEvidence = pieces.find(piece =>
      piece.field.startsWith('cons[') && /单位签章|单位盖章|单位审核/i.test(piece.text));
    addGate(gates, 'organization', '单位 / 报名主体', organizationGateEvidence);
  }

  if (scopeRule?.organizationFromTeam && /组队单位|单位推荐|推荐单位/i.test(structuredTeam)) {
    addGate(
      gates,
      'organization',
      '组队 / 推荐单位',
      { field: 'eligibility.team', text: structuredTeam },
    );
  }

  if (scopeRule?.travel && travelEvidence) {
    addGate(gates, 'travel', '线下 / 出行', travelEvidence);
  }

  const identityGateKinds = new Set(['student', 'organization', 'returnee', 'age', 'travel']);
  const hasIdentityGate = gates.some(gate => identityGateKinds.has(gate.kind));
  const teamGate = gates.find(gate => gate.kind === 'team');
  const hasSpecialCondition = china.value === 'yes-with-travel'
    || scopeRule?.special === true
    || hasIdentityGate
    || hasSpecialTeamComposition(teamGate);

  let group = 'unknown';
  if (china.value === 'no') group = 'blocked';
  else if (china.value === 'yes-with-travel') group = 'special';
  else if (china.value === 'yes') group = hasSpecialCondition ? 'special' : 'open';

  const groupInfo = ACCESS_GROUPS[group];
  const displayLabel = china.value === 'yes' && group === 'special'
    ? groupInfo.label
    : china.label;

  return {
    group,
    groupLabel: groupInfo.label,
    tone: groupInfo.tone,
    displayLabel,
    chinaEligibility: china,
    gates,
    hasStructuredEligibility: Object.keys(eligibility).length > 0,
  };
}

export function accessMatchesFilter(summary, filterId = 'all') {
  if (filterId === 'all') return true;
  if (!ACCESS_FILTER_IDS.has(filterId)) return false;
  return summary?.group === filterId;
}
