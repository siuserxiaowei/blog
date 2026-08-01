# 赛事雷达研究质量审计：第 35–50 轮

> 审计日期：2026-08-02（Asia/Shanghai）
>
> 范围：当前 202 条记录、来源链、状态算法、系列/类型口径与 HerClaw 匹配
>
> 边界：本轮只交研究结论和开发修正清单，不修改赛事数据或代码

## 结果

35–50 共 16 轮均已完成。当前最严重的问题不是赛事覆盖不足，而是：状态审计固定在旧日期、已经标成 verified 的字段仍会漂移、类型与系列口径混杂，以及推荐策略仍沿用不真实的“教育产品”画像。

- 按 2026-08-02 重算，202 条应为 `urgent 44 / ongoing 88 / upcoming 24 / expired 30 / unknown 16`。现有 `radar:check` 固定使用 2026-07-30，仍报告 `urgent 38 / expired 22`。
- 202 条中 `verified 65 / unverified 128 / partially-verified 8 / stale 1`；所有记录的 `checkedAt` 都是 2026-07-30，不能证明每个声明均在当天逐项核验。
- 仅 9 条有 `seriesId`；现有映射只把 202 条压缩为 198 个系列。讯飞 22 个赛题、ARC Prize 3 个赛道仍缺完整父子关系。
- 两次 232 个唯一 URL 的全量审计分别得到 `212 ok / 15 uncertain / 5 bot_blocked / 0 dead` 与 `214 / 13 / 5 / 0`，证明瞬时失败不能直接等同死链。
- 优先级：**P0 3 项、P1 12 项、P2 8 项**。

## 方法与事实基线

易变声明以官方规则、主办方页面和政府通知为优先证据；聚合页和搜索缓存只用作冲突线索。日期、资格、奖金、IP/开源、地域限制分别核验，不用“页面可打开”代替“字段正确”。

HerClaw 基线来自本地 README 与架构总览：N100 级静态工控机、Ubuntu 24.04、OpenClaw + Hermes 双容器、宿主机 supervisor、飞书双机器人、本地控制台、NetBird 远程运维、Uptime Kuma，以及 Token/JWT/License 与 Registry/OTA 设计。它是**企业/运营 AI 一体机**，不是教育产品；部分规格和容器化、OTA 能力仍在验证或设计阶段。

## 16 轮验收表

| 轮次 | 检查范围 | 证据 / 命令 | 结论与冲突 | 动作 |
|---|---|---|---|---|
| 35 | 新开放赛事 | [Hack for Humanity](https://hack-for-humanity-summer-26.devpost.com/rules)、[Win4AISafety](https://win4aisafety-sain-utrecht.devpost.com/)、[HCLTech AMPlified](https://amplified.hackerearth.com/) | Hack for Humanity 8/7–9/4、13+、最多 4 人、须开赛后新建项目，当前库缺失。Win4 已关报名且限荷兰学生；HCL 已关报名且限合作院校名册 | **update**：新增 Hack for Humanity 候选；**reject**：Win4、HCL 本季不录入 |
| 36 | 截止日期变化 | Backblaze、AMD、Roblox、GWB、[CALL-E](https://call-e.devpost.com/rules) 官方页 | Backblaze 8/3、AMD 8/6、Roblox 8/3、GWB 延至 8/15，现值可保留；CALL-E 页头为 9/14 23:45 SGT、规则正文出现 11:45 SGT | **keep**：四项日期；**watch**：CALL-E 标官方内冲突，按较早时间准备 |
| 37 | expired / active 状态 | 本地 `statusOf` 以 2026-08-02 重算；对照 `scripts/competition-audit.mjs` | 脚本固定 `TODAY = 2026-07-30`，少报 8 条 expired、少报 6 条 urgent；部分报名已关但已报名者仍可交稿 | **update P0**：动态时钟；新增 `open-to-new / registered-only / closed` |
| 38 | 链接健康 | `npm run radar:links -- --concurrency 12 --timeout-ms 12000 --max-bytes 32768`，运行两次 | 结果在 212/15 与 214/13（ok/uncertain）间波动；两次 bot-blocked 均 5、dead 均 0。政府站 TLS、Feishu 302、403、超时不能直接判死链 | **watch**：非 ok 入人工复核；三次失败且人工失败才转 dead |
| 39 | 重复与系列 | `seriesId || id` 统计；[讯飞赛事主页](https://challenge.xfyun.cn/h5/home)、[ARC Prize](https://www.kaggle.com/competitions/arc-prize-2026) | 当前只归并到 198 系列；讯飞 22 条、ARC 3 条缺父记录。腾讯游戏创作大赛与 GWB 经各自官方页核对为不同赛事 | **update**：建父子系列并双显“机会数/系列数”；**keep**：腾讯两项不合并 |
| 40 | estimated / unknown / rolling | 逐条检查 11 estimated、1 unknown、4 rolling；[广东传感器预征集](https://www.zc.gov.cn/zx/bmdt/qrsj/content/post_10912548.html)、[GOAI](https://www.goaihz.com/en) | GOAI 官方只写 8 月中旬，8/16 是估计；广东传感器为预征集、8/31 17:00；`creatorhackathonvol1` 估计日已过；`qingchuangopc2026` 仅第三方来源 | **update**：不确定日不进 urgent，估计日过期自动转 review；**keep**：`oh` unknown |
| 41 | 中国资格与支付 | [Agentic Cinema](https://agentic-cinema.devpost.com/rules)、[YouCam](https://youcam-api.devpost.com/rules)，并抽查 Shipaton、Backblaze、DataHub、CALL-E、Arm 规则 | Agentic、YouCam 明确排除中国；其余规则未将中国列入排除项，但 API、商店、汇款和税务仍可能阻断 | **keep**：两项排除；**update**：拆 `rulesEligibility / platformAvailability / prizePaymentRisk` |
| 42 | 身份、年龄、组织资格 | [UNESCO Youth Hackathon](https://www.unesco.org/en/articles/unesco-youth-hackathon-2026)、[香港 AIGC 公开组](https://aigc.eduhk.org/division-2/) | UNESCO 是全球 18–30 岁青年、2–6 人，不要求学生，但当前分类为“学生限定”；香港公开组允许社会人士但决赛收费 | **update**：UNESCO 改青年限定；资格改为多维字段 |
| 43 | 报名费、IP、开源 | [超级龙虾](https://www.aicompetition-pz.com/topic_detail/33)、[DataHub](https://datahub.devpost.com/rules)、[Shipaton](https://revenuecat-shipaton-2026.devpost.com/rules)、Agentic 规则 | 超级龙虾团队保留 IP、主办方获宣传展示许可、须披露开源许可；DataHub 参赛者保留 IP；Agentic 要 OSI 许可；Shipaton 仅特定学生奖强制公开仓库 | **update**：增加费用、IP、主办方许可、开源与税务字段 |
| 44 | 类型边界 | [HAX](https://hax.co/)、[奇绩创坛](https://www.miracleplus.com/apply/)，以及华为聚合页、Maker Faire、极客公园/WISE | HAX 是投资型加速器；奇绩是加速项目；华为页是活动聚合；Maker Faire 是 call-for-maker；部分条目是活动或榜单 | **update**：引入 competition/hackathon/award/accelerator/event/listing；投资额不当奖金 |
| 45 | 现金与非现金奖 | Agentic、[Roblox](https://devforum.roblox.com/t/roblox-inspire-2026/4670208)、超级龙虾、Shipaton 官方页 | Agentic 当前规则为 5 个奖金轨、每轨 5,000/3,000/2,000 美元，总计 50,000 美元；数据仍写 4 轨/60,000。Roblox 礼品卡金额已公开；超级龙虾奖金是“拟、税前”；Shipaton 页仍提示正式规则待发布 | **update P0**：Agentic；**update**：其余奖金边界 |
| 46 | 来源新鲜度与置信度 | 本地统计：128 unverified、132 reported、134 条无显式 official source、全部 checkedAt=7/30 | `verified` 不能防止内容漂移，Agentic 是明确反例；“可访问/官方/新鲜/已核字段”被压成单状态 | **update**：声明级 URL、checkedAt、contentHash 与字段状态 |
| 47 | HerClaw Top 10 | 本地 HerClaw 材料；候选资格、截止、提交物交叉核对 | 现有 GOAI 策略仍写教育产品/教师用户；Shipaton 9.8 需新上架 App 和变现；AMD/Arm 硬件栈不匹配 | **update P0**：改用企业运营一体机画像，排名见下表 |
| 48 | 筛选字段覆盖 | 本地计数：`eligibility 18/202`、`prizeBoundary 18/202`、`seriesId 9/202` | 地区、年龄、学生/法人、费用、开源、线下和硬件栈大多藏在自由文本 | **watch**：先补 Top 30，覆盖率达 90% 后再开放强筛选 |
| 49 | 发现与更新源 | [Devpost 列表](https://devpost.com/hackathons)、[Kaggle 列表](https://www.kaggle.com/competitions)、讯飞主页、政府通知列表 | 本轮未确认稳定且覆盖目标赛事的统一官方 RSS | **update**：做官方列表差分与详情页 hash；**reject**：不虚构 RSS、不靠搜索摘要证明“最新” |
| 50 | 汇总与优先级 | 汇总第 35–49 轮证据 | 风险集中于时钟、verified 漂移、产品画像、类型/系列、资格/奖金结构 | **update**：按 P0 → 活跃 P1 → 结构 P1 → P2 执行；无新证据条目保持原值 |

## 可直接交给数据开发的精确修正清单

### P0（3）

| 对象 | 当前值 | 目标值 / 验收 |
|---|---|---|
| `scripts/competition-audit.mjs` | `TODAY = 2026-07-30`；expired 22 / urgent 38 | 默认系统日期并接受 `--today YYYY-MM-DD`；`--today 2026-08-02` 必须得到 expired 30 / urgent 44 |
| `agenticcinema2026` | verified；4 轨、现金 60,000 美元；各轨 7,500/4,500/3,000 | 5 个奖金轨；各轨 5,000/3,000/2,000；现金总额 50,000；保留“中国居民不可投”；刷新来源日期与验证注记 |
| HerClaw 匹配基线 | 多条策略假设教育产品/教师用户；Shipaton 9.8 | 产品类型改“企业/运营 AI 一体机”；版本化已实现/设计中能力；按本报告 Top 10 重算并给出 No-go 原因 |

### P1（12）

| 对象 | 当前值 | 目标值 / 验收 |
|---|---|---|
| `unescohack2026` | `cat: 学生限定` | 青年限定标签；年龄 18–30、2–6 人、不要求学生 |
| `robloxinspire2026` | 礼品卡金额未披露 | 每成员类别奖 600/400/200 美元 GoGift，荣誉奖 100；总冠军 RDC 行程或 1,000 美元 GoGift 替代；仍标非现金 |
| CALL-E | 只有日期 | Asia/Singapore；记录官方页 23:45 与正文 11:45 冲突；`partially-verified` |
| `shipaton2026` | 奖池按确定值、匹配 9.8 | 正式规则发布前奖金/资格 provisional；HerClaw 降级，记录新 App、RevenueCat、真实变现门槛 |
| `pazhou-super-claw-2026` | 8/5 confirmed，无冲突历史 | **仍保留 8/5**；备注搜索缓存 7/15 vs 当前官方原页 8/5；保存页面 hash/快照；奖金标拟、税前 |
| 生命周期 | 单 primary deadline | 增加 `actionability: open-to-new / registered-only / closed`，保留报名、投稿、决赛节点 |
| `hax`、`mp`、`hwdevcomp` 等 | 全部 competition | HAX/奇绩为 accelerator/program；华为为 series/listing；活动/榜单另建类型 |
| 讯飞 / ARC | 赛题/赛道独立计数 | 讯飞 22 条建父系列；ARC 3 条建父系列；同时展示 opportunities 与 series |
| 来源分类 | 132 reported；统一 checkedAt | 官方 URL 标 official；高风险声明分别记录 URL、checkedAt、contentHash |
| 16 条不确定日期 | 与确认日期同列 | 不进入 urgent；估计日已过自动转 review；无官方来源降权 |
| 奖金/IP/费用 | 大量自由文本 | 增加 cash/noncash/currency/gross/provisional/entryFee/ipOwner/organizerLicense/openSourceRequired/tax |
| 新候选 | 无 Hack for Humanity | 候选 ID `hack-for-humanity-summer-2026`；8/7–9/4 EDT；13+；最多 4 人；健康主题；开赛后新建；GitHub + ≤4 分钟视频；13 项非现金奖 |

### P2（8）

| 范围 | 开发动作 | 验收 |
|---|---|---|
| 18 个非 ok URL | bot-blocked 与 uncertain 分开，浏览器/人工复核 | 连续 3 次失败且人工失败才 dead |
| Win4AISafety | 本季不新增，记录关闭与荷兰学生限制 | 新一季开放时再发现 |
| HCLTech AMPlified | 本季不新增，记录关闭与合作院校名册限制 | 新一季规则开放时再录入 |
| 资格筛选 | 补 Top 30 的年龄、身份、法人、地区、线下、技术栈 | 覆盖率 ≥90% 后开放强筛选 |
| 官方列表发现 | Devpost/Kaggle/讯飞日差分，政府通知周差分 | 新增、截止、资格/奖金变化分别建任务 |
| 链接语义 | 拆 `actionLinkHealth / evidenceLinkHealth / historicalSourceHealth` | fallback 可用不掩盖原证据页失效 |
| 声明级溯源 | 保存字段来源、抓取时间、hash 与定位 | 变更能回溯到字段与页面版本 |
| 自动归档 | confirmed 过期按 actionability 归档；estimated 过期转复核 | 默认活跃列表不再保留过期估计项 |

## Top 5 数据修正

1. `agenticcinema2026`：4 轨/60,000 美元改为 5 轨/50,000 美元。
2. `unescohack2026`：学生限定改为 18–30 岁青年限定。
3. `robloxinspire2026`：补齐已披露的 GoGift 金额，但保持非现金性质。
4. HAX、奇绩、华为活动聚合页从 competition 口径拆出。
5. 讯飞 22 赛题与 ARC 3 赛道建立父子系列，不删机会但双显机会数/系列数。

时钟与 HerClaw 画像也属于 P0，但它们是跨记录基础设施，不应伪装成单条数据修正。

## “超级龙虾”截止冲突决定

- 搜索缓存曾显示“报名及初赛作品征集：2026-06-01 至 2026-07-15”，可能是旧页面、历史版本或未刷新摘要。
- 2026-08-02 直接访问[当前官方原页](https://www.aicompetition-pz.com/topic_detail/33)，正文明确为“2026-06-01 至 2026-08-05”；本地直接请求得到的当前正文也是 8/5。

因此本轮**以当前官方原页 8/5 为准，不改回 7/15**。验证状态应表达为“当前官方确认 + 观察到历史冲突”，并保存页面快照/哈希。提交前仍应登录报名端或联系主办方做最后确认。页面还明确：最多 3 人、OpenClaw 核心、PPT 与 3–5 分钟真实本地演示、三条赛道、奖金“拟且税前”、团队保留 IP、主办方获宣传展示许可。

## HerClaw Top 10 重算

| 排名 | 记录 | 推荐作品 / 赛道 | 核心门槛 | 截止 |
|---:|---|---|---|---|
| 1 | `pazhou-super-claw-2026` | 智能办公：飞书入口 + OpenClaw 工作流 + Hermes 执行 + 本地运维台 | 3–5 分钟真实本地运行视频；时间极紧 | 08-05 |
| 2 | `xfyocasskill2026` | 办公协同 Skill：消息到任务、执行、回执、异常升级 | 原创 Skill；ZIP + SKILL.md；同步 SkillHub | 08-27 17:00 |
| 3 | `xfynl2wf2026` | 自然语言生成可执行运维/办公流程 | 指定结构；获奖需可复现代码 | 09-04 17:00 |
| 4 | `goai` | Agent Infra：双 Agent 编排、权限、健康检查、可恢复执行 | 官方只写 8 月中旬；先确认开源边界 | 08 月中旬（估计） |
| 5 | `pazhou-ai-application-2026` | AI+软件应用：企业本地 AI 一体机；备选智能硬件 | 需真实用户/商业验证；扶持不等于现金 | 09-15 |
| 6 | `aiskillathon2026` | 工业制造/安全可信：本地诊断、远程恢复、审计 | 8/7 交 Demo；长沙决赛 | 08-07 |
| 7 | `xfyrisk2026` | 企业运维风险 Agent：License、Token、服务健康与人工复核 | 须补规则证据链，不能只包装监控 | 09-04 |
| 8 | `global-excellent-engineer-innovation-2026` | AI/软件组：可部署、可远维的一体机 | 2–3 人、18+、技术负责人工程师证明、IP 材料 | 08-31 |
| 9 | `xfyspacemind2026` | 空间 Agent：本地隐私、双机器人、远程守护 | 需补家庭/空间、多设备与权限场景 | 08-14 17:00 |
| 10 | `datahubagent` | Fleet metadata / 运维知识 Agent | 必须深用 DataHub；时间紧；复核开源许可 | 08-10 |

明确降级或排除：Shipaton（新 App + RevenueCat + 真实变现）、AMD DevMaster（AMD/ROCm）、Arm AI Optimization（Arm 平台）、Agentic Cinema（中国居民不可投）、默认教育赛（HerClaw 不是教育产品）。`xfyihome2026` 只有在补出真实传感器和设备联动后再上调。

## 自动化建议

1. 动态日期与 `--today` 可复现审计。
2. 官方页内容 hash 与日期/奖金/资格字段 diff；只报警，不自动覆盖。
3. HEAD/GET/浏览器三级链接检测，连续失败后再人工确认。
4. 多 deadline 推导 actionability，而非只看一个 primary deadline。
5. organizer + canonical URL + title cluster 生成系列归并建议，不自动合并。
6. 从官方规则抽取资格、现金/非现金、税、IP、开源，并保留来源定位。
7. 对 Devpost、Kaggle、讯飞、政府通知列表做差分发现；新项先进入 candidate。
8. 版本化 HerClaw 产品画像，匹配输出 fit、effort、eligibility gate 与 No-go。

每日报告只推送 `new candidate`、`deadline changed`、`eligibility/prize changed`、`became inactive`；无变化不重复推送。

## 覆盖与限制

- 已覆盖 35–50 共 16 轮，每轮均有范围、证据/命令、结论和 update/keep/watch/reject 动作。
- 官方证据访问日为 2026-08-02；Shipaton、CALL-E、超级龙虾及 estimated 日期仍可能继续变化。
- 当前代码可确定为 198 个已映射系列；完整归并后约 175 只能作为待建模估计，本报告不把它当事实。
- 本轮未修改任何赛事数据；修正清单需后续单独实现与审阅。

## 验收命令

```text
npm run test:data
npm run radar:check
npm run radar:links -- --concurrency 12 --timeout-ms 12000 --max-bytes 32768
git diff --no-index /dev/null docs/competition-radar-research-quality-2026-08-02.md --check
```

`radar:check` 的旧日期输出本身是本报告识别出的 P0；不能用其 `p0Count: 0` 证明研究数据无风险。
