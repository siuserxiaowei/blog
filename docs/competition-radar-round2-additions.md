# Competition Radar 第二轮新增调研（2026-07-30）

## 结论

- 基线：现有 `competitions` 精确为 184 条。
- 候选池：46 项，其中采纳 18 项、待复核 13 项、排除 15 项。
- 交付：18 条均有可访问的官方赛事页、确认的主截止日、明确的地域资格描述和拆分后的现金/非现金边界。
- 去重：18 个新增 ID 与现有 184 个 ID 零重叠；另识别出 GOAI、AI Factory、AI Infra Summit、OpenAtlas 等重复项。
- 时间口径：检索与链接复核日均为 2026-07-30。官方只给日期而未给时区时，保留“官方未注明”，不自行推算。
- 来源口径：不把媒体稿、聚合站或搜索摘要写入数据。18 条中，12 条来自赛事/主办方自有域名，1 条来自政府官网，1 条来自高校公共项目官网，4 条来自主办方正式使用的 HackerEarth、Festhome 或 Devpost 活动页。

## 采纳标准

同时满足以下条件才写入 `competitionRound2Additions`：

1. 截至 2026-07-30 仍可报名/提交，或已官方公布未来开放日。
2. 官方页面给出可行动的硬截止日期；只有“rolling”“八月开放”“九月举行”的不进入正式新增集。
3. 赛事主体、提交任务、地域/身份资格能从官方页面确认；页面未写的字段明确标注“未注明”。
4. 现金、平台 credits、硬件、差旅、会员、投资机会分别记录，不把名义 prize value 当现金。
5. 与现有 184 条按 ID、名称、组织方、官方 URL 和赛道语义交叉去重。

## 已采纳：18 项

| ID | 类型 | 主截止日 | 地域与关键资格 | 奖励边界 | 官方来源 | 关键风险 |
|---|---|---:|---|---|---|---|
| `roblox-inspire-2026` | 游戏创作 | 2026-08-03 10:00 PT | 全球线上；1–5 人；需 DevForum 良好状态；RDC 奖仅 18+ | 未公布现金；RDC 差旅住宿和礼品卡均为非现金 | [Roblox Creator Programs](https://create.roblox.com/docs/creator-programs/inspire) | 仅 72 小时；奖品受地区可用性限制 |
| `zerve-data-challenge-2026` | 数据算法 | 2026-09-13 23:59，时区未注明 | 官方页未列地区、年龄和团队限制 | $10,000 现金；300 Zerve credits 非现金 | [Zerve × HackerEarth](https://zerve.hackerearth.com/) | 必须在 Zerve 运行/部署；截止时区未写 |
| `futureeval-summer-2026` | Agent / 预测 | 2026-09-06，时区未注明 | 官方参与页未列地区限制；需部署 Metaculus API Bot | $50,000 本赛季现金；赞助模型推理成本非现金 | [赛事页](https://www.metaculus.com/tournament/summer-futureeval-2026/) · [参与指南](https://www.metaculus.com/futureeval/participate/) | 需要长期在线运行和概率校准 |
| `scilab-guiverse-2026` | 开源开发 | 2026-08-15，时区未注明 | 个人参赛；官方页未列国籍限制 | ₹8,000 / ₹5,000 / ₹3,500 现金；实习为可能性 | [IIT Bombay FOSSEE](https://scilab-gui-hackathon.fossee.in/) | 只能用 Scilab GUI，至少三个组件 |
| `global-excellent-engineer-innovation-2026` | 创业/工程 | 2026-08-31 | 境内外；核心团队 2–3 人、全员 18+；技术负责人须有工程师证明 | 各专业组金/银/铜/优胜奖 20/10/5/3 万元；不把不同组奖金重复合并 | [重庆市人社局](https://rlsbj.cq.gov.cn/zwxx_182/tzgg/202607/t20260709_15812188.html) | 要求已有成果/产品和知识产权 |
| `supernova-0x-2026` | 创业路演 | 2026-11-02，时区未注明 | 全球初创；按 Pre-seed / Seed / Series A 核验融资区间 | $200,000 equity-free 现金；导师、云与软件服务非现金 | [Expand North Star](https://expandnorthstar.com/supernova-0X) | 六强/入围需赴迪拜；展位/Pod 相关成本未披露完整 |
| `supabase-select-hackathon-2026` | SaaS / AI 软件 | 2026-10-02 19:00 UTC | 官方未列地区资格；必须到旧金山现场 | 未公布现金、奖品或投资 | [Supabase](https://hackathon.supabase.com/) | 差旅/签证成本高；团队细则未列 |
| `hyperspectral-tracking-2026` | 视觉算法 | 2026-09-10，时区未注明 | 官方未列地区限制；前四名须投稿并参与 WHISPERS | €1,500 / €1,000 / €500 现金 | [HSI Tracking Challenge](https://www.hsitracking.com/) | 前四名有论文和会议展示义务 |
| `ai-film-frontiers-2026` | 创意 AI | 2026-08-23，时区未注明 | 全球；必须同时交 AI 影片和四页 ACM 格式报告 | 展映与论文集，未公布现金 | [SIGGRAPH Asia workshop](https://cveu.github.io/) | 录用后至少一名代表须购买 Enhanced Access |
| `festiav-valencia-2026` | AI 电影 | 2026-10-04 23:59 GMT+1（按规则原文） | 全球成年创作者；作品最长 15 分钟 | €2,250 现金总额 | [FESTIAV official listing](https://filmmakers.festhome.com/en/festival/9934) | 费用 €5–€20；规则对入围文件日出现 10/15 与 10/20 冲突，未写入次级截止 |
| `konstloop-film-festival-2026` | AI 电影 | 2026-08-15，时区未注明 | 全球；AI 类 5–20 分钟；2024-01-01 后作品 | 奖杯、桂冠、证书和展示，非现金 | [Konstloop](https://konstloop.com/) | 首届赛事，品牌与兑现历史有限 |
| `square-enix-game-contest-2026` | 游戏创作 | 2027-03-15 23:59 JST；2026-12-15 开放 | **仅日本居住者**；个人、团体或法人 | 大奖 3 亿日元，另有名作/优秀奖；发行与版税须另签协议 | [Square Enix](https://gc2026.jp.square-enix.com/) | 中国大陆居住者不符合；AI 内容须披露并保证权利 |
| `innofuture-bridge-pitch-2026` | 创业路演 | 2026-09-17，时区未注明 | 官方 PDF 未列注册地、成立年限和融资限制；六强赴 Slovenia | CES Las Vegas 2027 行程和 AmCham 会员，非现金 | [Official call PDF](https://innofuture.si/InnoFuture_Razpis_StartUp_Pitch_EN.pdf) | 地域资格与差旅承担方式须在申请前确认 |
| `indehub-hackathon-2026` | 地区限定 / App | **注册 2026-07-31 23:59 IST**；提交 8/7 | **仅印度公民**；1–3 人；未成年需监护同意 | 页面称 ₹200,000 prize pool，但细项为硬件与 credits，现金记为 0 | [IndeHub guide](https://indehub.org/hackathon/2026/guide) | 决赛差旅自理；必须 Apple 原生，不能 Flutter/RN/Web |
| `build-with-paritok-2026` | Agent / 开源 | 2026-08-05 00:00 PDT | 全球标准受限地区除外；仅达到法定成年年龄的学生 | $630 现金；托管 GPU 和展示非现金 | [Official Devpost](https://build-with-paritok.devpost.com/) | Apache-2.0 公共仓库；必须使用 Paritok 托管服务 |
| `includai-neurodiversity-2026` | 学生 / 无障碍 AI | 2026-08-08 23:59 PT | 全球标准受限地区除外；仅达到法定成年年龄的学生 | $3,000 现金；Summit 展示机会非现金 | [Official Devpost](https://includai-2026.devpost.com/) | 必须让真实神经多样性用户参与设计/测试，需严守隐私与安全 |
| `hong-kong-aigc-culture-2026` | AIGC 创作 | 2026-08-30，时区未注明 | 公开组接受高校学生和不限年龄的社会人士；官网未列地域限制 | 未公布现金；证书与 Music China 展示非现金 | [赛程](https://aigc.eduhk.org/schedule/) · [组别/费用](https://aigc.eduhk.org/division-2/) | 选拔免费但证书另收费；决赛强制缴费 280–880 元；`eduhk.org` 版权主体是香港教育促进会，并非香港教育大学 |
| `aicomp-agent-development-2026` | 学生 Agent | 2026-08-31 23:59 | 全球高校/科研机构正式学籍学生；2–3 名同校学生，不得跨校 | 复赛/总决赛等级奖证书，无现金说明 | [AIC 大赛组委会通知](https://www.aicomp.cn/notice/notice-3/3640.html) | 初赛免费，复赛每队 500 元；需学校组队与现场答辩 |

## 待复核：13 项

这些项目存在真实官方页面，但至少一个决定是否能报名的字段冲突或缺失，因此没有进入新增数组。

| 候选 | 官方来源 | 暂缓原因 | 解除条件 |
|---|---|---|---|
| Africa Deep Tech Challenge 2026 | [Devpost rules](https://adtc-2026.devpost.com/rules) | 页面顶部为 8/24 23:45 PDT，赛程表将 Gate 1 写成 8/25；两者可能是时区显示，也可能是配置冲突 | 主办方更新为一个一致的 Gate 1 时间；奖金应拆为 $16,500 现金与 $3,500 GPU credits |
| OneAquaHealth–IEEE Global Hackathon | [项目公告](https://www.oneaquahealth.eu/2026/05/08/oneaquahealth%E2%80%91ieee-global-hackathon-igniting-innovation-for-urban-aquatic-ecosystems/) · [Devpost rules](https://oneaquahealth-ieee-hackathon.devpost.com/rules) | 活动开始日为 9/14 或 9/16；“仅学生/必须组队”与“个人或团队”冲突；奖金为 $3,000+ 或 $5,000 cash/in-kind TBD | 官方统一日程、资格和现金口径 |
| eBay University ML Competition – Canada | [EvalAI](https://eval.ai/web/challenges/challenge-page/2680/overview) | 同一官方页出现最多 2 人和最多 5 人两种队伍上限 | eBay/EvalAI 修正规则；即使修正，也仅加拿大（魁北克除外）学生可报 |
| Siemens AI & Robotics Hackathon 2026 | [Siemens ecosystem](https://ecosystem.siemens.com/mucl/ai-and-robotics-hackathon-2026/overview) | 公开帖称 8/15 截止，但 Siemens 页面把活动列入 Archive / Expired | 官方页面恢复为开放状态并明确申请入口 |
| BenchFlow – Agent Skill Lift | [Kaggle competitions](https://www.kaggle.com/competitions?group=all) | Kaggle 列表显示仍在进行，但可检索到的官方宣传截止日与当前倒计时不一致，尚未取得可固定引用的正式规则页 URL | 找到正式 competition rules/schedule 页并核实当前截止 |
| Caspian Buildathon | [Caspian](https://www.trycaspianai.com/) | 产品官网可验证，但未发现可访问的正式赛事规则页，无法核实 8/12、资格和约 $1.7k 奖项 | 主办方发布正式规则/报名页 |
| Orange Summer Challenge | [Official site](https://osc.gos.orange.com/) | 官方页有活动与 AI 主题，但未找到精确申请截止 | 发布硬截止与地区资格 |
| HumanX Amsterdam startup pitch | [Official application](https://www.humanx.co/europe/pitch-application) | “rolling until spots filled”，8/18 是首轮评审而非保证开放到该日的硬截止 | 给出最终申请截止或明确席位仍开放 |
| Slush 100 | [Slush startups](https://slush.org/audience/startups/startups) | 仅称八月开放，尚无关闭日和 2026 资格细则 | 正式规则上线后再入库 |
| Web Summit PITCH | [Web Summit](https://websummit.com/startups/pitch/) | 可确认 ALPHA/BETA 展商和融资少于 €5m 等资格，但未公布硬申请截止 | 正式日历给出截止日 |
| AI Hack for Freedom III | [Official site](https://www.aihackforfreedom.org/) | 可确认华盛顿活动与 $50k BTC pool，但申请截止未公布 | 发布硬截止和完整地区规则 |
| 2026 第三届教育信息技术应用创新大赛 | [Official site](https://eic.caet.org.cn/portal/) | 官网可确认赛事和延期通知，但 JS 页面未在本轮核实到当前报名关闭日、对象和费用的完整同页证据 | 取得官方通知 PDF 或可引用的详情页 |
| I’Mpossible Film Festival | [Official site](https://impossiblefilmfest.com/) | 截止日和 AI 类别可见，但首届赛事、奖品为证书/有限奖杯，费用金额未在公开页列明；优先级低于本轮 18 项 | 补齐费用、评审和兑现细节后可作为 B 级候选 |

## 排除：15 项

| 候选 | 官方来源 | 排除原因 |
|---|---|---|
| GOAI 2026 | [Official site](https://goai.ltd/) | 现有 184 条已收录 `goai`，重复 |
| AI Factory 2026 | [lablab.ai](https://lablab.ai/ai-hackathons/nativebuilder-build-without-limits) | 现有 184 条已收录 `aifactory2026`，重复 |
| AI Infra Summit Hackathon | [lablab.ai](https://lablab.ai/ai-hackathons/ai-infra-summit-hackathon?enroll=true) | 现有 184 条已收录 `aiinfrasummit2026`，重复 |
| OpenAtlas Challenge | [OpenAtlas](https://open-atlas.ai/) | 主线已确认现有集收录，重复 |
| Best AI Awards 2026 | [Fu Jen official rules PDF](https://www.startup.fju.edu.tw/upload/news/9631240756794289j82.pdf) | 2026-03-16 已截止，且中国大陆、香港、澳门明确不符合 |
| Adria Future Hackathon 2026 | [Official call PDF](https://adriafuturesummit.org/wp-content/uploads/PDF/Adria_Future_Hackathon-Call_for_Applications.pdf) | 2026-04-04 已截止；仅西巴尔干地区 35 岁以下 |
| SEDIC26 | [Official site](https://sedichackathon.my/) | 2026-07-30 当日截止，调研时已无可靠准备窗口；仅马来西亚大学生且收 MYR 50 |
| Perception Test Challenge “2025” | [EvalAI](https://eval.ai/) | 页面配置延到 2026，但标题与成果展示仍指向 ICCV 2025，属于陈旧配置 |
| Neural MMO challenge | [AIcrowd](https://www.aicrowd.com/) | 官方规则只有 6/30–11/30 而无年份，无法证明为 2026 当前赛事 |
| 成都大学校内 Agent 竞赛 | [成都大学](https://news.cdu.edu.cn/info/1112/49353.htm) | 仅成都大学全日制学生，无法作为默认公开机会 |
| 某“全球”AI 数据创新赛 | [赛事页](https://aicxfx.taisaiwang.com/) | 主体仅写“组委会/协会”，页面出现“2026年2026年”等错误，组织与日期可信度不足 |
| Bitkom Deeptech Pitch 2026 | [Official rules PDF](https://www.bitkom.org/sites/main/files/2026-04/Teilnahmebedingungen-AIDAQ-Deeptech-en-US_0.pdf) | 规则真实，但 7/31 截止、仅德国注册且 3–50 名社保员工的初创；本轮价值低于已采纳 18 项 |
| Reverie Hacks 2026 | [Official Devpost](https://reverie-hacks-2026.devpost.com/) | 实际现金为 $650，而非第三方线索的 $112.8k；学生小型赛事且赞助权益仍有“details finalized later”，本轮不采纳 |
| Agentic AI Build Week 2026 | [Devpost updates](https://agentic-ai-build-week-2026.devpost.com/updates) | 2026-07-12 已截止 |
| Casper Agentic Buildathon 2026 | [Casper announcement](https://www.casper.network/news/casper-x-space-recap-may-20-2026-casper-manifest-rwas-and-the-agentic-buildathon) | 资格轮 2026-06-30 已截止 |

## 关键事实校正

1. **IndeHub 的 ₹200,000 不是已确认现金。** 明细是 Bambu Lab P2S、赛道硬件与 ElevenLabs credits，因此 `prizeBoundary.cash` 为空。
2. **Africa Deep Tech 的 $20,000 总值不能写成 $20,000 现金。** 官方明细只有 $16,500 现金，其余是 GPU credits；且 Gate 1 日期仍冲突，所以整体暂缓。
3. **Reverie 的当前现金是 $650。** 过往/第三方页面的大额 subscription 估值不能并入现金。
4. **香港 AIGC 赛事域名不是香港教育大学的机构域名证据。** 页面版权主体显示“香港教育促进会”，因此数据没有写“香港教育大学主办”。
5. **Supernova 的 $200,000 是 equity-free prize pool，不是承诺投资。** 展位、Pod、差旅和参与成本也没有从奖金中抵销或假定免费。
6. **未写时区不等于 UTC 或北京时间。** Zerve、FutureEval、Scilab、Hyperspectral 等均保留“官方未注明”。

## 集成说明

- 新数组：`competitionRound2Additions`
- 默认导出：同一数组，方便主线按需要 import。
- 检查日期：`ROUND2_ADDITIONS_CHECKED_AT = '2026-07-30'`
- 合并建议：主线可在确认展示策略后使用 `[...competitions, ...competitionRound2Additions]`；本分支按任务边界没有修改 `src/data/competitions.js`。
- 主截止日是“下一项不可错过的行动”：例如 IndeHub 使用 7/31 注册截止，而非 8/7 最终作品提交；Square Enix 保留 2026-12-15 未来开放节点，但主截止为 2027-03-15。
- 对 `chinaEligible: not-stated` 的项目，含义是“官方未列地区规则”，不是替用户保证中国参赛者一定能领奖；提交前仍需读平台完整条款。

## 已知风险与复核节奏

- 7/31–8/8 的短截止项目应在主线合并后立即做一次链接和开放状态复查。
- Devpost/HackerEarth/Kaggle 等平台可能按浏览器时区渲染日期；数据以官方明确写出的时区为准。
- 首届小型电影节（Konstloop、FESTIAV）虽然规则可核，但品牌与兑现历史弱于大型主办方，故评级不高于 A/B。
- 对需要付费、差旅或现场注册的项目，费用只记录已公开部分；“未注明”不表示免费。
- 任何官方页面若后续修正规则，应同时更新 `verification.checkedAt`、`sources[].date` 和相应测试断言。
