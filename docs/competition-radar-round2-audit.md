# Competition Radar 第二轮事实与时效审计

审计日期：2026-07-30（Asia/Shanghai）  
基线：184 条记录，37 urgent、89 ongoing、26 upcoming、9 unknown、23 expired  
交付：`src/data/competition-round2-corrections.js`（44 个可合并 patch）

## 结论

- 对 37 条 urgent 做了逐条 claim review，覆盖截止节点、奖项性质、资格限制、行动入口与父子关系。
- 对上一轮全部 15 条 `verified` 和 2 条 `partially-verified` 重新检查来源、时效与关键边界。两组有 4 条重叠，合计 50 条唯一记录完成 claim-level 复核。
- 对全量 184 条记录的 210 个唯一 action/source URL 做实时链接审计：193 `ok`、3 `bot_blocked`、2 `dead`、12 `uncertain`。
- 对其余 active 记录做高奖金和资格敏感抽样，重点检查腾讯游戏、Shipaton、ARC Prize 三条赛道、Astana AI Film、GOAI、Gemini XPRIZE、江西人才赛、AI Skillathon、AI Factory 等。
- 形成 44 个 sidecar patch：30 个有内容、期限、资格、入口或层级的实质修正，14 个是事实保留但补齐官方 provenance / verification。44 个 patch 内为 36 `verified`、7 `partially-verified`、1 `stale`；应用后全集合为 47 `verified`、8 `partially-verified`、1 `stale`、128 `unverified`。
- 6 个原 confirmed 日期被降为 `estimated`，不得进入倒计时或 ICS：`qingchuangopc2026`、`shundeaihack2026`、`miaoyatoy2026`、`aigcforfuture2026`、`guangdongsensor2026`、`goai`。`creatorhackathonvol1` 和 `oh` 继续保持 estimated / unknown。

## P0 / P1 修正

| 等级 | ID | 原问题 | 更正 |
|---|---|---|---|
| P0 | `fujianfinanceai2026` | 把 7/31 单位报名写成作品提交；漏掉 8/31 方案/PPT；资格过宽；奖金没有说明“三赛道分别设置” | primary 改为 7/31 `registration`，追加 8/31 `submission`；限定福建省内金融机构/地方金融组织、2026-01-01 前入职职工、2—3 人；按三个赛道分别列奖金 |
| P0 | `goai` | 官网只写 `Mid-August`，数据却硬编码 8/16 confirmed | 8/16 仅保留为 `estimated` 提醒，不进入倒计时 / ICS |
| P0 | `qingchuangopc2026` | urgent 仅由第三方聚合页支持，未找到主办方本届规则或报名页 | 8/3 降为 `estimated`、`partially-verified` |
| P0 | `shundeaihack2026` | 日期、食宿、交通和奖金仅有资讯聚合页，缺官方规则 / 表单 | 8/2 降为 `estimated`、`partially-verified` |
| P0 | `miaoyatoy2026` | action URL 是资讯页而非妙呀提交页，奖金中含积分 / 流量等非现金 | 8/10 降为 `estimated`、`partially-verified` |
| P0 | `aigcforfuture2026` | 官网时间轴写 8/31，正文仍残留 3—5 月旧赛程，站内冲突 | 8/31 降为 `estimated`，要求提交前确认表单 |
| P0 | `guangdongsensor2026` | 8/31 是预征集节点，正式赛规则与奖金尚未发布 | 改为 `estimated application`，不当正式比赛 deadline |
| P1 | `oh` | 原 action URL HTTP 404 | 改到 OpenHarmony 官网；2026 规则仍不可核验，保持 `unknown`、状态 `stale`，记录原入口 dead |
| P1 | `mp` | 原 `miraclepl.us` DNS 失效；投资条款仍写 $250K / 7% | 改到 `miracleplus.com/apply/`；更新为官网当前 $300K / 7%，明确是股权投资而非奖金 |
| P1 | `waxalasr2026` | `zindi.africa` 已 301 | 更新到 `zindi.world/competitions/google-waxal-asr-challenge` |
| P1 | `geoaiagua2026` | `zindi.africa` 已 301 | 更新到 `zindi.world/competitions/geoai-aquaculture-pond-identification-challenge` |
| P1 | Wearable AI 三条 | 只写 8/7 Validation，漏掉入围者 8/15 Test；三条没有共同 series | 追加两阶段 deadline；三条标为 `track`，共享 `wearable-ai-grand-challenge-2026` |
| P1 | FightingICE 两条 | AoE 时区缺失；两条 sibling track 未建模 | 补 `Etc/GMT+12`，标为 `track`，共享 `darefightingice-2026` |
| P1 | `pokemonagent2026` | 一个 ID 同时承载 Simulation 与 Strategy，但结构仍显示普通 competition | 标为 `series`，补两个 Kaggle 官方来源；保留 8/9、8/16、9/6、9/13 四个强制节点。Strategy 需参加 Simulation，Simulation 本身无现金奖 |

## 37 条 urgent 逐条结论

“准确”表示核心截止、奖金性质和资格与当前来源一致；“更正”表示 sidecar 改了一个或多个事实 / 结构字段；“无法完全确认”会同时降级 certainty 或 verification，不把搜索摘要当官方规则。

| ID | 结果 | 第二轮结论 |
|---|---|---|
| `amddevmaster2026` | 准确 | 8/6、最多 3 人、三赛道 $30,000 保留；GPU 资源非现金 |
| `aidisability2026` | 更正 | 7/31 准确；拆清成熟产品单位赛道与个人/团队创意赛道；奖励只写“酌情物质奖励” |
| `beidouspace2026` | 更正 | 改为 8/7 18:00 `registration`；企业组限中国境内非上市法人，团队组限高校/科研院所未注册且至少 3 人 |
| `qingchuangopc2026` | 无法完全确认 | 只有第三方整理页，8/3 降 estimated |
| `autonomousagentbeta2026` | 准确 | Kaggle 当前开放，奖项为 Swag，不是现金 |
| `fujianfinanceai2026` | 更正 | 7/31 报名、8/31 方案；补入职、机构、团队和按赛道奖金边界 |
| `xfydigital2026` | 准确 | 官方动态赛题页可达；3/2/1 万元保留，具体时刻登录后复核 |
| `backblaze2026` | 准确 | Devpost 确认 8/3 和 $10,000 |
| `pokemonagent2026` | 更正 | 两个相连赛项按 series 表达；四个 deadline 均保留 |
| `waxalasr2026` | 更正 | 事实保留，入口迁到 zindi.world |
| `scriptctf2026` | 准确 | 8/10 保留；约 $7,600 是奖品价值 |
| `energytechasia2026` | 更正 | 8/10 是 startup application；须 market-ready 且有收入/traction；入围者创始人/C-level 到场 |
| `xtcai3602026` | 更正 | 7/30 保留；补 MVP+traction 及 Palo Alto 入围者自费到场 |
| `xinghuocup2026` | 准确 | 学生、1—6 人、8/13 与 25 万元奖池保留 |
| `aistudentsecurity2026` | 准确 | 限全日制本专科；未披露现金奖 |
| `geoaiagua2026` | 更正 | 事实保留，入口迁到 zindi.world |
| `talestribute2026` | 更正 | 8/10 和 $500/$300/$200 准确；标为 IEEE CoG 系列 track |
| `fightingicellm2026` | 更正 | 8/7 AoE 和奖项准确；补 series/track |
| `fightingicesound2026` | 更正 | 8/7 AoE 和奖项准确；补 series/track；自动超时不等于死链 |
| `wearableproactive2026` | 更正 | 8/7 Validation + 8/15 Test；奖项按每个 subtrack |
| `wearableconversation2026` | 更正 | 同上 |
| `wearablelongvideo2026` | 更正 | 同上 |
| `shundeaihack2026` | 无法完全确认 | 缺主办方规则/表单，8/2 降 estimated |
| `miaoyatoy2026` | 无法完全确认 | 缺妙呀提交入口，8/10 降 estimated |
| `hkust1m` | 更正 | 8/4 上海赛区申请保留；“百万奖金”不推导为单项目现金 |
| `jiangsuxiaofei2026` | 更正 | 7/31 application；10/5/2 万元是现金，最高 500 万是潜在股权投资支持 |
| `aiskillathon2026` | 更正 | 8/7 同时提交意向与 Demo；50 万+现金、100 万算力券、50 万合规券分列 |
| `aifactory2026` | 更正 | 8/10 保留；奖励是 Credits / 展示，未披露现金 |
| `jiangxitalent2026` | 更正 | 8/10 application；2000 万投资、8000 万授信不计赛事现金 |
| `westlakeagentctf2026` | 更正 | 8/10 是学生团队报名，不是作品提交 |
| `bund` | 准确 | 8/9 与 2 万/1 万/5000 元现金档位保留 |
| `datahubagent` | 准确 | Devpost 确认 8/10 与 $20,500 |
| `forestryai` | 准确 | 官网确认 8/10 与各赛道奖金档位 |
| `wmdcai` | 准确 | 7/31 与 5 万元总现金；设备和会员不计现金 |
| `pazhou-super-claw-2026` | 准确 | 8/5、最多 3 人和各赛道奖项保留 |
| `guangzhou-super-agent-2026` | 准确 | 7/31 保留；政府来源未披露统一现金奖 |
| `ifcomp-2026` | 准确 | 8/1 intent、8/28 成品；现金池随捐赠形成，不写固定总额 |

### Urgent 复核汇总

- 核心事实准确、仅补 provenance：14
- 有实质字段 / 结构更正：23
- 其中无法由官方来源完整确认并已降级：3
- sidecar 应用后，上述 3 条不再进入 urgent，urgent 从 37 降为 34；`aigcforfuture2026`、`guangdongsensor2026`、`goai` 这 3 条非 urgent confirmed 占位日期也被降级

## 上一轮 17 条 verified / partially-verified 复核

| 结果 | 记录 |
|---|---|
| 保留 verified | `aiinfrasummit2026`、`agenticcinema2026`、`pazhou-super-claw-2026`、`pazhou-ai-application-2026`、`guangzhou-super-agent-2026`、`vacat-2026`、`cuhkx-2026`、`global-digital-education-2026`、`malanshan-ai-microdrama-2026`、`we-are-human-film-2026`、`world-usability-design-2026`、`ifcomp-2026`、`unu-ai-sdgs-2026`、`industrial-internet-2026` |
| verified 但结构修正 | `pokemonagent2026`：明确为两赛项聚合 series，并补 Simulation 官方页 |
| 保留 partially-verified | `stepsoftware2026`：原详情 404，主办方首页可达，9/30 仍只可作 estimated |
| partially-verified 且链接状态更新 | `creatorhackathonvol1`：飞书重定向超过审计上限；8/1 是活动日而非已证实报名截止，Token 非现金 |

上一轮 15 条 verified 没有发现需要撤销的奖金或资格结论。需要注意的是，`vacat-2026`、`malanshan-ai-microdrama-2026`、`ifcomp-2026` 等来源在自动客户端出现 TLS/timeout，浏览器或替代来源仍可复核；因此不把 `uncertain` 误判为 `dead`。

## 全量链接审计

执行：

```bash
node scripts/competition-link-audit.mjs \
  --concurrency 12 \
  --timeout-ms 12000 \
  --max-bytes 32768
```

| 状态 | URL 数 | 处理 |
|---|---:|---|
| ok | 193 | 保留 |
| bot_blocked | 3 | `geekpark`、`microchipfpga`、`jinjilakeopc`；403 只表示自动客户端被拦，不标死链 |
| dead | 2 | `oh` 原 URL 404；`mp` 原域名 DNS_NOT_FOUND；均已在 sidecar 提供官方 fallback |
| uncertain | 12 | TLS、timeout、飞书登录重定向等；逐项保留“不确定”，不等同于 404/410 |

两条 Zindi URL 虽被审计器跟随为 200，但存在稳定 301，sidecar 已直接使用最终 `zindi.world` 地址，减少一次跳转。

## 其余 active 高风险抽样

| 记录/组 | 关注点 | 结论 |
|---|---|---|
| `tencentgamecreator2026` | 401.1 万现金与 100 万 Credits 是否混淆 | 数据已分列；保留 |
| `shipaton2026` | $685,000+ 奖池、上架与变现要求、地区排除 | Devpost 可达，抽样未发现需立即更正；上线前仍应从 rules 页生成地区清单 |
| ARC Prize 三条 | $850K / $700K / $450K 与 deadline | Kaggle 当前列表与详情可达，金额分属三赛道，不能合并成单条奖金 |
| `aaiff2026` | $1M 高额奖池 | 官网可达，抽样保留；建议上线前保存 rules 快照，避免营销页后改 |
| `goai` | 500 万、8/16 | 奖池与资源需分列；8/16 被证据否定为精确日，已降 estimated |
| `geminixprize` | $2M、资格、真实收入 | 规则确认总现金 $2M；补少于 25 人组织、赛期内新项目、真实用户/收入、13:00 PDT |
| `jiangxitalent2026` | 2400 万奖补、投资、授信 | 三类资金不得混算，已在 notes 和 rewards 语义中切开 |
| `aiskillathon2026` | 现金、算力券、服务券 | 三类价值明确分列 |
| `aifactory2026` | 美元额度是否现金 | 均为 Credits，补“未披露现金奖” |

## 无法确认与残余风险

1. `qingchuangopc2026`、`shundeaihack2026`、`miaoyatoy2026` 仍缺本届主办方规则或真正的行动表单。sidecar 只做保守降级，不编造替代入口。
2. `aigcforfuture2026` 官网自身日期冲突；只有表单状态能最终确认 8/31 是否有效。
3. `guangdongsensor2026` 尚处预征集，正式规则可能改变资格、奖金和时间。
4. `goai` 只发布 “Mid-August”；8/16 是展示层估算，不是官方日历日。
5. 自动链接结果是 2026-07-30 的点时快照。`bot_blocked`、TLS 和 timeout 不证明 URL 失效。
6. `pokemonagent2026` 当前一个 series 记录承载两个 Kaggle 赛项。更理想的集成是新增 Simulation 与 Strategy 两个 child ID；本 sidecar 不能凭空创建原集合不存在的 ID，只先修正 `recordType/seriesId` 与来源。
7. Wearable AI 与 FightingICE 也只有 child tracks，没有独立 parent 记录。若页面要提供 series 落地页，应在主数据增加 parent，再给这些 track 设置 `parentId`。

## 合并方式

sidecar 不修改 `competitions.js` 或上一轮 overrides。共享集成点应由主线显式决定：

```js
import { competitionRound2Corrections } from './competition-round2-corrections.js';

const normalized = normalizeCompetitionCollection(
  rawCompetitions,
  {
    ...competitionV2Overrides,
    ...competitionRound2Corrections,
  },
  { updatedAt: RADAR_UPDATED_AT },
);
```

合并次序必须让 round-two corrections 最后覆盖。上线前应同时更新会锁死旧结论的回归测试，尤其是 urgent 数量、GOAI certainty、Zindi 域名和 series/track 断言。

## 验证

```bash
node --test \
  tests/competition-round2-corrections.test.mjs \
  tests/competitions-data.test.mjs \
  tests/competition-radar.test.mjs \
  scripts/competition-link-audit.test.mjs
```

结果：27 tests，27 pass，0 fail。

新增回归检查覆盖：

- correction ID 均存在于原 184 条集合；
- patch 合并后 V2 schema 无 error；
- 每个 patch 都有 `verification.checkedAt/sourceKind/linkHealth/notes`；
- 所有来源均为 HTTP(S)，并标 `official` 或 `reported`；
- uncertain deadline 不进入 urgent；
- 福建双 deadline、Zindi 最终域名、series/track、现金/credits/投资区分和 dead-link fallback。
