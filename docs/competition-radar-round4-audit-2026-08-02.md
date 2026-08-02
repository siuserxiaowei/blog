# 赛事雷达增量研究与交叉审计：第 85–100 轮

> 审计日期：2026-08-02（Asia/Shanghai）
> 数据基线：210 条记录；competition 202 / series 1 / track 7
> 本轮边界：只做赛事检索、事实核验、去重与开发建议，不改赛事数据、不写公众号、不部署
> 证据规则：官方规则/主办方/政府原文优先；权威媒体和镜像只在原文不可直接读取时作有边界的佐证

## 结果

第 85–100 轮共 16 轮全部完成。本轮形成 19 个互斥处置项：**NEW 4 / UPDATE 5 / WATCH 5 / REJECT 5**。其中 **P0 2 / P1 11 / P2 6**。

最重要的结论不是“再塞更多比赛”，而是先修正两个会直接误导参赛决策的事实：

1. `agenticcinema2026` 当前规则的 5 个赛道奖金合计 **65,000 美元**，不是库内的 50,000 美元；Devpost AI 目录又显示 75,000 美元，因此规则页 65,000 美元应作为当前主事实，75,000 美元只保留为冲突线索。中国居民仍明确被排除。
2. `nanningopc2026` 找到由南宁市人社局署名、2026-07-02 公开发布的延期通知文本：报名截止调整到 **2026-08-20 24:00**。原站直接页未能稳定获取，故应由 `unknown` 升为“权威镜像支持、待原站复核”的 `partially-verified`，不能继续把仍可报名机会藏在 unknown。

新增候选中，真正值得进入待录入队列的是：人大“全球 AI 创新·治理·安全大赛”、Great Agent Hackathon、PNPL 2026 神经语音解码赛系列、广西“人工智能+有色金属及关键金属”产业创新大赛。Caspian 与 AI Builders 虽与 Agent/HerClaw 高度相关，但其官方页面内部存在截止、资格或奖金冲突，暂不应上线。

## 基线与方法

2026-08-02 本地可复现基线：

- 总记录 210；deadline certainty：confirmed 193 / estimated 11 / unknown 2 / rolling 4。
- verification：verified 74 / unverified 125 / partially-verified 10 / stale 1。
- 当日状态：urgent 46 / ongoing 93 / upcoming 24 / expired 30 / unknown 17。
- iFLYTEK 当前库内 21 个 `xfy*` 记录，加独立的星火杯记录，共 22 个机会；官方首页称应用赛聚焦 30+ 真实行业场景，说明发现覆盖仍不完整。

每个易变事实分别核验截止、资格、地区、奖金、IP/开源、提交阶段和链接语义；“页面 HTTP 200”不等于“字段仍正确”。下表每个证据均于 **2026-08-02** 访问。

## 16/16 轮验收表

| 轮次 | 检查范围与对象 | 权威证据（均访问于 2026-08-02） | 检查字段 | 当前值 → 建议值 | 确定性 | 优先级 / 处置 |
|---:|---|---|---|---|---|---|
| 85 | 当前 urgent 真值：`pazhou-super-claw-2026`、`hkust1m`、`backblaze2026`、`build-with-paritok-2026` | [超级龙虾官方页](https://www.aicompetition-pz.com/topic_detail/33)、[HKUST 上海赛区](https://ec.hkust.edu.hk/one-million-sh/2026/home)、[Backblaze Devpost](https://backblaze-generative-media.devpost.com/)、[Paritok Devpost](https://build-with-paritok.devpost.com/) | 报名状态、精确时间、资格 | 日期本身保持：8/5、8/4 12:00、8/3 17:00 EDT、8/5 00:00 PDT；数据模型从日期级升级为 `deadlineAt + timezone`，避免截止当天仍显示全天可投 | 高 | **P1 UPDATE** |
| 86 | unknown / estimated：`nanningopc2026`、`qingchuangopc2026`、`stepsoftware2026` | [延期通知文本与信息源](https://m12333.cn/policy/swfaf.html)、[最接近原发布方的完整转载](https://nnkhjq.com/nd.jsp?id=24255)、[南宁人社通知索引](https://m12333.cn/platform/wry.html)、[青创 OPC 第三方线索](https://competehub.dev/zh/competitions/urls2fd2c6fa6d1f7bf00f65d15e3f09f28b)、[新时达官网](https://www.stepelectric.com/) | 截止、原文日期、来源层级 | 南宁 `primary=null/unknown` → 8/20 24:00、`partially-verified`；青创 OPC 继续 estimated；新时达首页 200 不能替代已下线详情页，继续 WATCH | 南宁中高；其余低 | **P0 UPDATE**（南宁）；**P2 WATCH**（其余） |
| 87 | 既有 WATCH 漂移：`agenticcinema2026` | [官方规则](https://agentic-cinema.devpost.com/rules)、[Devpost AI 目录](https://devpost.com/c/artificial-intelligence) | 赛道、现金、地区、开源 | 5 轨各 5k/3k/2k、总额 50k → 当前规则为 IBM 15k、其余四轨各 12.5k，合计 65k；目录 75k 仅作冲突；中国居民仍排除 | 规则金额与地区高；目录总额冲突中 | **P0 UPDATE** |
| 88 | Devpost 增量：Great Agent、Caspian、AI Builders | [Great Agent 规则](https://the-great-agent-hackathon.devpost.com/rules)、[Great Agent 概览](https://the-great-agent-hackathon.devpost.com/)、[Caspian 规则](https://caspian.devpost.com/rules)、[Caspian 概览](https://caspian.devpost.com/)、[AI Builders 规则](https://ai-builders-hackathon-2026.devpost.com/rules)、[AI Builders 概览](https://ai-builders-hackathon-2026.devpost.com/)、[Devpost AI 目录](https://devpost.com/c/artificial-intelligence) | 截止、资格、线下、奖金 | Great Agent 新增：8/25 23:45 IST，Stage 1 全球，入围者须自费赴 Bangalore；Caspian 的截止为 8/11 23:59 vs 页头 8/13 00:00、资格为 18+ 全体 vs 学生限定、现金仅约 $200 vs 页头 $1,900 cash；AI Builders 奖金/资格也冲突 | Great Agent 中高；后两项低 | **P1 NEW**；**P1 WATCH ×2** |
| 89 | Kaggle 增量与系列：PNPL、`pokemonagent2026` | [PNPL 2026 官方总览](https://neural-processing-lab.github.io/2025-libribrain-competition/editions/2026/)、[规则](https://neural-processing-lab.github.io/2025-libribrain-competition/editions/2026/rules/)、[奖金页](https://neural-processing-lab.github.io/2025-libribrain-competition/editions/2026/prizes/)、[Pokémon Simulation](https://www.kaggle.com/competitions/pokemon-agent-competition-simulation-environment) | 截止、双轨、奖金、首个强制节点 | 新增 PNPL 父系列，Deep/Broad 为两个 track，10/15 AoE 截止；奖金金额仍未公布。Pokémon 保持系列聚合，首个强制节点仍为 8/9 接受规则/组队 | 高；PNPL 金额 unknown | **P2 NEW**；Pokémon KEEP |
| 90 | iFLYTEK 官方目录增量 | [科大讯飞赛事首页](https://challenge.xfyun.cn/h5/home) | 目录覆盖、赛题数量、发现入口 | 当前建模 22 个机会；官方首页称应用赛覆盖 30+ 真实行业场景。不能凭首页文案虚构 8+ 标题，应增加 SPA/API 目录差分器，逐条过候选审核 | 数量缺口高；具体缺项未知 | **P1 WATCH** |
| 91 | 政府/高校增量：人大新赛、`mediaaiac2026` | [人大信息学院官方通知（HTTP canonical）](http://ai.ruc.edu.cn/newslist/notice/20260623101.html)、[广电总局 MediaAIAC](https://www.nrta.gov.cn/art/2026/7/21/art_113_73728.html) | 报名、团队、三轨、奖金边界 | 新增人大赛事：6/22–8/15 报名、2–5 人、可带 1 位导师；“青年”未给年龄定义。100 万为落地北京经开区的创业扶持，不等同无条件现金奖；另称现金奖励但金额未披露。MediaAIAC 8/31 保持 | 高；“青年”定义与现金额中低 | **P1 NEW**；MediaAIAC KEEP |
| 92 | 学生/身份门槛：Paritok、Caspian、人大 | [Paritok](https://build-with-paritok.devpost.com/)、[Caspian 规则](https://caspian.devpost.com/rules)、[人大通知](http://ai.ruc.edu.cn/newslist/notice/20260623101.html) | 学生、年龄、组织、团队 | Paritok 确认仅成年学生、公司/专业组织排除；Caspian 规则与概览互相矛盾，不能推送；人大“高校学生、青年科研人员、创新团队”范围广但“青年”无年龄定义，需人工确认 | Paritok 高；Caspian 低；人大中 | **P1 UPDATE**（资格结构字段） |
| 93 | 地域、法律与推荐硬门槛 | [Agentic Cinema 规则](https://agentic-cinema.devpost.com/rules)、[Africa Deep Tech 规则](https://adtc-2026.devpost.com/rules)、[Great Agent 规则](https://the-great-agent-hackathon.devpost.com/rules) | 中国居民资格、现场与差旅 | Agentic 中国居民明确不可投；Africa Deep Tech 仅列明非洲国家居民，默认对中国团队 REJECT；Great Agent Stage 1 从任何地区可投，Stage 2 必须在 Bangalore 全程线下且差旅住宿自付 | 高 | **P1 REJECT/UPDATE** |
| 94 | 现金 / 额度 / 扶持 / 投资边界 | [Agentic 规则](https://agentic-cinema.devpost.com/rules)、[Caspian 概览](https://caspian.devpost.com/)、[人大通知](http://ai.ruc.edu.cn/newslist/notice/20260623101.html)、[南宁延期与赛事通知索引](https://m12333.cn/platform/wry.html) | cash、credits、conditional subsidy、gross | Agentic 规则现金 65k；Caspian 奖项分解仅 $200 现金、约 $1,700 额度；人大 100 万为落地扶持；南宁奖励/落地资源也须拆条件，不得都显示成“奖金” | 高至中 | **P1 UPDATE**（奖金模型） |
| 95 | IP / 开源 / 宣传许可 | [超级龙虾官方页](https://www.aicompetition-pz.com/topic_detail/33)、[Agentic 规则](https://agentic-cinema.devpost.com/rules)、[Paritok](https://build-with-paritok.devpost.com/) | IP owner、license、public repo | 超级龙虾团队保留 IP、主办方获免费宣传展示许可；Agentic 要求非专有部分以允许商用的 OSI 许可开源；Paritok 要 Apache-2.0 公共仓库。自由文本应拆成可筛字段 | 高 | **P1 UPDATE**（结构能力） |
| 96 | 报名 vs 投稿 vs 评审 | [Pokémon Simulation](https://www.kaggle.com/competitions/pokemon-agent-competition-simulation-environment)、[OpenAI Build Week 规则](https://openai-build-week.devpost.com/rules)、[Creator Hackathon 报名页](https://my.feishu.cn/share/base/shrcn0SNvOuCKHymgEfNfHYtd6c) | actionability、entry、submission、judging | Pokémon 8/9 是参赛/组队门槛，8/16 才是 Simulation 投稿；OpenAI Build Week 7/21 已停止报名投稿，后续评审不代表仍可参加；`creatorhackathonvol1` 8/1–2 活动已过，移出当前可报名候选 | 高 | **P1 UPDATE**（生命周期）；**P2 REJECT ×2** |
| 97 | 系列 / 赛道重复 | [PNPL 总览](https://neural-processing-lab.github.io/2025-libribrain-competition/editions/2026/)、[Agentic 规则](https://agentic-cinema.devpost.com/rules)、[智信杯官方通知](https://m.c2.org.cn/nd.jsp?groupId=25&id=3075&mid=371) | parent/track、机会数、截止分叉 | PNPL 是 1 series + 2 tracks；Agentic 是 1 competition + 5 prize tracks；Pokémon 是 Simulation/Strategy 聚合；智信杯创意类 8/15 与竞技类 8/31 不能共享单一 deadline。前台同时显示“赛事数/机会数” | 高 | **P1 UPDATE**（系列模型） |
| 98 | 链接、重定向、bot 与未来赛季 | 本地只读链接审计；[Square Enix](https://gc2026.jp.square-enix.com/)、[IGF](https://igf.com/submission-info/)、[SXSW Pitch](https://sxsw.com/pitch/) | link role、opening、future season | 抽查 11 个当前 URL 均可达；但新时达根首页 200 掩盖历史详情 404，人大 HTTPS 又会跳 HTTP，证明 health 必须按 action/evidence/historical 分层。Square Enix 12/15 才开放；IGF 8/3 开放；SXSW 已开放，未来赛季不能一律叫“当前可投” | 高 | **P2 WATCH/UPDATE** |
| 99 | HerClaw 重新匹配 | 上述官方规则；本地 HerClaw 产品画像 | fit、effort、eligibility gate、no-go | 最高优先仍是超级龙虾；南宁若 8/20 延期有效升至第二；Great Agent 主题高但有 Bangalore 自费门槛；人大中高；Agentic/Africa 不合资格；Paritok 仅学生 | 中高 | **P1 UPDATE**（推荐引擎） |
| 100 | 行业/地区空白与最终交叉去重 | [广西工信通知镜像](https://www.keceyun.com/policy/newsdetail/645352.html)、[中新网广西](https://www.gx.chinanews.com.cn/cj/dt/2026-07-01/detail-ihffxrfa8351823.shtml)、[报名入口](https://www.gx96368.cn/activity/detail?id=94&activitySubTypeCode=100) | 新赛、专业/高校/东盟轨、奖金、去重 | 新增“人工智能+有色金属及关键金属”候选：7/10–8/10、2–5 人、专业/高校/东盟三轨；奖金以官网为准，当前不得填现金。与 `gxspatialai2026` 主题和主办赛制均不同，不合并 | 中高 | **P1 NEW** |

## 两个 P0 的可执行修正

### 1. `agenticcinema2026`

官方规则当前列出的现金如下：

| 奖金轨 | 一等奖 | 二等奖 | 三等奖 | 小计 |
|---|---:|---:|---:|---:|
| IBM | $7,500 | $4,500 | $3,000 | $15,000 |
| Grafana | $7,500 | $3,000 | $2,000 | $12,500 |
| Parallel | $7,500 | $3,000 | $2,000 | $12,500 |
| ClickHouse | $7,500 | $3,000 | $2,000 | $12,500 |
| Replit | $7,500 | $3,000 | $2,000 | $12,500 |
| **合计** |  |  |  | **$65,000** |

建议：

- `prizeBoundary.cash` 以规则页 **$65,000** 为当前值，`verification` 暂设 `partially-verified`，说明 Devpost 目录同时显示 $75,000。
- 不用目录 $75,000 覆盖规则页，也不再保留旧的 $50,000。
- 保留截止 2026-09-07 14:00 PDT、5 个合作方轨、中国居民不可投、须公开 OSI 许可源码等规则。
- 这是“verified 记录也会漂移”的第二次实证；应对奖金、截止、资格做声明级 diff，而不是只看页面是否可达。

### 2. `nanningopc2026`

最接近原发布方的完整转载页标注“来源：广西南宁市人力资源和社会保障局网站”，正文签署“南宁市人力资源和社会保障局 2026 年 7 月 2 日（此件公开发布）”，关键原文为：

> 报名截止时间由原定日期调整至 2026 年 8 月 20 日 24:00。

证据边界：南宁人社直接详情页没有被本轮稳定检索到；[m12333 文本页](https://m12333.cn/policy/swfaf.html)标注信息来源为南宁市人社局、收录时间 2026-07-03，[南宁人社通知索引](https://m12333.cn/platform/wry.html)列出 2026-07-02 的同名延期通知，[科航金桥转载](https://nnkhjq.com/nd.jsp?id=24255)保留完整署名、日期和联系人。三者相互印证，但仍不等同于直接打开政府原文。

建议把主截止改为 `2026-08-20 24:00 Asia/Shanghai`，状态设 `partially-verified`，备注“权威镜像支持、待原站或报名小程序复核”。这比继续 `unknown` 更能反映真实行动机会，同时不把镜像冒充原站。

## NEW / WATCH / REJECT / UPDATE 总账

### NEW（4）

| 建议 ID | 关键事实 | HerClaw 适配 | 优先级 |
|---|---|---|---|
| `ruc-global-ai-governance-safety-2026` | 8/15；2–5 人；Deep Research Agent、社会模拟、AI 伦理安全治理三轨；100 万为有条件落地扶持 | 中高：可做本地 Agent 治理、权限与审计；需满足“青年/创新团队”口径 | P1 |
| `the-great-agent-hackathon-2026` | 8/25 23:45 IST；规则写 18+、1–2 人、Stage 1 可从任何地区参加，未排除中国居民；概览却写必须恰好 2 人；入围必须自费赴 Bangalore 24 小时线下；3 个命题轨但奖金页多出 Track 4 | 高主题、较高执行成本；出行不可接受则 No-go | P1 |
| `pnpl-neural-speech-decoding-2026` | 10/15 AoE；Deep/Broad 双轨；人人可参与；奖金金额尚未公布 | 低：研究算法赛，与当前硬件盒业务距离大 | P2 |
| `gx-ai-nonferrous-metals-2026` | 8/10；2–5 人；专业/高校/东盟三轨；奖金未确认 | 低到中：只有具备工业检测、运维、边缘部署场景与行业数据时再投 | P1 |

### UPDATE（5）

| 对象 | 更新 | 优先级 |
|---|---|---|
| `agenticcinema2026` | $50k → 规则页 $65k；保留目录 $75k 冲突与中国居民排除 | P0 |
| `nanningopc2026` | unknown → 8/20 24:00、partially-verified | P0 |
| `backblaze2026` | 补 `2026-08-03T17:00:00-04:00` 级精确时间 | P1 |
| `hkust1m` | 补 8/4 12:00 Asia/Shanghai，避免按全天处理 | P1 |
| `build-with-paritok-2026` | 补 8/5 00:00 PDT 与学生/组织硬门槛；推荐前先判断身份 | P1 |

### WATCH（5）

| 对象 | 不上线原因 | 优先级 |
|---|---|---|
| Caspian Buildathon | 官方规则与概览同时冲突：8/11 vs 8/13、18+ 全体 vs 学生限定、$200 现金 vs $1,900 cash 标签 | P1 |
| AI Builders Hackathon | 规则/概览/目录对资格和 $4,000 / $33,900 / TBD 奖金表述冲突 | P1 |
| iFLYTEK 目录缺口 | 官方称 30+ 场景，当前只建模 22；需拿到真实目录项再新增 | P1 |
| `qingchuangopc2026` | 仍只有第三方线索，日期不能升级 confirmed | P2 |
| `stepsoftware2026` | 原赛事详情下线；官网根页 200 不能证明 9/30 仍有效 | P2 |

### REJECT（5）

| 对象 | 仅拒绝“当前可报名候选”的原因 | 优先级 |
|---|---|---|
| [Africa Deep Tech Challenge 2026](https://adtc-2026.devpost.com/rules) | 限规则列明的非洲国家居民；HerClaw/中国团队不符合 | P1 |
| [OpenAI Build Week 2026](https://openai-build-week.devpost.com/rules) | 7/21 已停止报名与投稿；后续评审不等于开放 | P2 |
| [2025 AI 领航杯搜索结果](https://www.isc.org.cn/article/25264030169034752.html) | 官方原文明确是 2025 赛季，不能作为 2026 新增 | P2 |
| [2026 CCF 中职信息技术应用能力赛](https://www.ccf.org.cn/Media_list/zzjyfzwyh/2026-06-10/902263.shtml) | 7/5 学校预报名已关；未预报名学校不能进入后续正式报名/作品提交 | P1 |
| [`creatorhackathonvol1`](https://my.feishu.cn/share/base/shrcn0SNvOuCKHymgEfNfHYtd6c) | 8/1–2 活动期已过，且未发现独立仍开放的报名节点 | P2 |

## P0 / P1 / P2 开发队列

### P0（2）

1. 修正 Agentic Cinema 规则金额为 $65,000，保存 5 轨逐项证据，并显示目录 $75,000 冲突。
2. 把南宁 AI OPC 改为 8/20 24:00、partially-verified；前台恢复为可行动候选，同时提示需在小程序做最后确认。

### P1（11）

1. 新增人大赛事、Great Agent、广西有色/关键金属赛三个候选。
2. 引入 `deadlineAt`，先补 urgent Top 30 的时分秒与时区。
3. 引入 `actionability: not-open-yet / open-to-new / registered-only / closed`。
4. 奖励拆为 cash / credits / conditional subsidy / investment / exposure，不再用一个“总奖池”。
5. 资格硬门槛拆为地区、年龄、学生、法人、团队人数、线下、差旅承担、指定技术栈。
6. 建官方目录发现器：Devpost、Kaggle、iFLYTEK、政府通知列表分别差分。
7. 建声明级 `sourceUrl + checkedAt + contentHash + locator`，金额/日期/资格变化只告警不自动覆盖。
8. 建 parent-series/track 模型并双显“赛事数/可投机会数”。
9. 链接健康按 action/evidence/historical 三种角色分别记录。
10. 推荐引擎输出 fit、effort、hard gate、No-go reason，而非只给匹配分。
11. 对官方页面内部冲突提供“较早截止准备 + 人工确认”状态，禁止静默选一个值。

### P2（6）

1. 新增 PNPL 父系列与两个 track，奖金保持 unknown。
2. 对 `qingchuangopc2026`、`stepsoftware2026` 做低频人工复核，不重复推送。
3. 未来赛季增加 `opensAt`；Square Enix 等未开放赛事不显示“立即报名”。
4. 构建 REJECT ledger，按 canonical URL、主办方、赛季与标题指纹抑制错季/已关赛事复现。
5. 对 HTTP→HTTPS/HTTPS→HTTP、bot-blocked、root fallback 分别建语义，不把 200 当字段验证。
6. 行业空白按“有数据/有团队/有落地资源”过滤，避免为覆盖行业而推荐低适配比赛。

## HerClaw 适配复核

HerClaw 按当前真实画像处理：OpenClaw + Hermes、飞书双机器人、本地控制台、宿主机 supervisor 与远程运维方向的企业/运营 AI 盒子；不假定已有教育、传感器、量产 OTA 或工业数据能力。

| 排名 | 赛事 | 适配判断 | 必须先过的硬门槛 |
|---:|---|---|---|
| 1 | `pazhou-super-claw-2026` | **最高**：OpenClaw、本地运行、软硬件一体与真实演示完全同向 | 8/5；最多 3 人；3–5 分钟真实本地运行视频 |
| 2 | `nanningopc2026` | **高**：AI 技术/应用、超级个体和软硬件均可讲 | 先在报名小程序确认 8/20 仍可提交；准备 OPC/落地叙事 |
| 3 | Great Agent Hackathon | **高主题**：企业 Agent、MCP、技能与多 Agent 编排 | Stage 2 强制 Bangalore，差旅住宿自费；团队人数页面有冲突 |
| 4 | 人大全球 AI 创新·治理·安全大赛 | **中高**：可做本地 Agent 安全、审计与治理 | 2–5 人；“青年”范围需确认；提交更偏研究/治理表达 |
| 5 | Caspian Buildathon | **概念很高、当前不可推荐**：多渠道 Agent 与飞书/消息入口同向 | 截止、年龄/学生资格和现金三重冲突，先等主办方澄清 |
| 6 | 广西有色/关键金属赛 | **低到中**：边缘 AI/运维可迁移 | 没有行业数据、企业场景或广西落地能力就不投 |
| — | Agentic Cinema | **No-go** | 中国居民明确被排除 |
| — | Africa Deep Tech | **No-go** | 中国居民不在合资格国家列表 |
| — | Build with Paritok | **条件性 No-go** | 仅成年学生；公司/专业组织排除 |
| — | PNPL 2026 | **低** | 神经语音算法赛，机会成本高、产品复用弱 |

结论：短期资源仍应优先压在超级龙虾，南宁只要报名端确认延期就是第二优先；Great Agent 虽主题很合，但不能忽略自费赴印度的实际成本。Caspian 在页面澄清前不应进入推荐榜。

## 功能建议：按收益 / 成本排序

| 顺序 | 功能 | 收益 | 成本 | 为什么现在做 |
|---:|---|---|---|---|
| 1 | 声明级变更检测 | 极高 | 中 | Agentic 在 3 天内再次从已核验值漂移，页面可达监控完全抓不到 |
| 2 | 精确时间 + 生命周期 | 极高 | 中 | 直接避免“截止当天仍显示可投”和“评审中被误认成开放” |
| 3 | 资格硬门槛 + No-go | 高 | 中 | 中国居民、学生、团队人数、线下出行会直接改变推荐结论 |
| 4 | 奖励类型结构化 | 高 | 低到中 | Caspian、人大、南宁都证明额度/扶持不能当现金 |
| 5 | 官方目录差分发现 | 高 | 中高 | 解决 Devpost/iFLYTEK 的新增覆盖，减少依赖搜索摘要 |
| 6 | 系列/赛道父子模型 | 中高 | 中 | 防止 PNPL、Pokémon、Agentic、智信杯重复或错用截止 |
| 7 | 链接角色与失败语义 | 中 | 中 | 新时达根页 200 会掩盖证据页失效；RUC 还有协议降级 |
| 8 | REJECT/WATCH 复现抑制 | 中 | 低 | 可阻止错赛季、已关、地域不符的结果在后续检索中反复出现 |

## 重复、冲突与误报清单

- **不是重复**：广西有色/关键金属赛与 `gxspatialai2026`。前者是工业产业赛、三类参赛轨；后者是国土空间治理赛。
- **应为系列**：PNPL Deep/Broad、Pokémon Simulation/Strategy。
- **应为单赛多奖金轨**：Agentic Cinema 五个合作方轨，不应计为五场比赛。
- **截止分叉**：智信杯创意类 8/15、竞技类 8/31，不能只存一个日期。
- **官方内部冲突**：Caspian、AI Builders、Great Agent 的团队/轨道或奖金描述；必须呈现冲突，不能静默“选看起来合理的”。
- **搜索误报**：OpenAI Build Week（已关）、2025 AI 领航杯（错季）、职业院校赛（只对已登记单位开放）。
- **链接误判**：新时达根首页 200 不等于原赛事详情仍存在；HTTP 状态只能证明链接，不证明比赛事实。

## 验证

- `npm run radar:check -- --today 2026-08-02 --json`：210 条；urgent 46 / ongoing 93 / upcoming 24 / expired 30 / unknown 17；P0 0 是当前数据脚本结果，不代表本研究没有 P0 事实冲突。
- 只读定向链接审计：10 个赛事、11 个唯一 URL，结果 `ok 11 / bot_blocked 0 / dead 0 / uncertain 0`。该结果仅证明抽查 URL 可达。
- 官方证据访问日统一为 2026-08-02；南宁政府原站详情、Caspian/AI Builders 冲突、Great Agent 未解释的 Track 4、PNPL 奖金金额仍是明确的待复核项。
- 本文未修改 `src/**`、脚本、测试或包配置。

## 后续数据实施验收

```text
npm run test:data
npm run radar:check -- --today 2026-08-02 --json
npm run radar:links -- --id agenticcinema2026 --id nanningopc2026 --id pazhou-super-claw-2026
```

上线前人工补验：南宁报名小程序是否仍收件；Agentic 规则与目录冲突是否已由主办方统一；Great Agent 中国居民实际注册和 Bangalore 出行安排；Caspian/AI Builders 官方澄清。
