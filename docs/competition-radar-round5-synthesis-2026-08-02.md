# 竞赛雷达第 101–150+ 轮汇总与实施决策（第 5 批 · 社交平台补漏）

检索快照：2026-08-02（Asia/Shanghai）

## 本轮特点

前 100 轮以官方站、赛事平台、政府公告为主；本轮按用户要求转向**平台分发型赛事**：公众号、知乎、抖音、小红书、B站、微博等中文社交平台，以及 X(Twitter)、Devpost、itch.io、DoraHacks、lablab.ai 等国际社区，共 10 条赛道并行，合计约 100+ 次检索（Exa 关键词、B站搜索 API、twitter-cli、平台列表页直读），并对全部正选候选用 Jina/curl 核对官方规则页。

## 赛道覆盖与主要收获

1. **抖音/剪映/即梦 + 快手/可灵**：抖音AI创作大赛（金奖 100 万，官方页已核对日期与奖金）；CapCut CRE[AI]TE 2026（$200k，大陆受限降级）。
2. **小红书/B站/微博**：B站AI创造公开赛（一等奖 100 万，「AI 造物」含硬件原型，HerClaw 适配）；微博 VibeLab；B站 UP动画剧场加码。
3. **公众号生态**：东莞工业 AI 百景大赛（25 万池 + 300 万订单直通）；SMG×商汤 AI 短片计划；山东元启东方 AI 短片赛；就『AI』台灣。
4. **知乎/豆瓣/少数派/V2EX/掘金**：千文创境 AI 漫剧赛；CSIG×华为 Camera 双赛道；纯写作类（豆瓣阅读、少数派征文）按雷达定位 REJECT。
5. **国际黑客松平台**：AI Builders（$33.9k）、VoltHacks、GPU.ai Buildathon、TechEx Amsterdam、AI GENESIS、Since AI、MunichTech、WEEX（合规降级）、Delphi Agent Arena（Web3 提示）。
6. **X(Twitter) 国际社区**：twitter search 端点失效，改为官方账号轮询 + Exa；确认 Sea×OpenAI 台湾站、和泰 AI 黑客松、TABEI 可信 AI 黑客松（均台北线下，赴台受限降级）；**核实 MiniMax $150k 为 2025 年残留页面，REJECT**。
7. **独立游戏/卡牌（OCG 方向）**：GGAC 第七届（含卡牌视觉赛道）、无畏契约×GGAC 卡面设计（严禁 AIGC）、Brackeys/LOWREZ/inkJam/Ludum Dare 60。
8. **硬件/maker（龙虾盒子方向）**：Seeed XIAO 产品化征集（NRE 6000/方案）、ADI CodeFusion、Seeed Make a Sign、Funpack 5-4、Autodesk AU 2027（中国不可参加）。
9. **数据算法平台**：天池垂直行业 Agent 赛（接受已落地项目）、小鹏 Agent、CSIG 荣旗、Zindi ×2、Mozilla Lost in Transcription、Kaggle BenchFlow Skill、MinerU（赛程待确认）。
10. **设计/AIGC 平台**：美图 Hatch Catch（最高 500 万投资）、MVLAND AIMV（30 万，8-07 紧）、LibTV Skill 激励、中关村 AI 设计赛、嘻元前变装。

## 实施决策

- **NEW 50 条** 进入 `competition-round5-additions.js`：S 级 4（B站AI创造公开赛、抖音AI创作大赛、东莞百景、美图 Hatch Catch）、A 级 14、B 级 32。
- **REJECT 7 类**：MiniMax（2025 残留）、华秋杯（报名已截止）、纯写作赛、单 IP 同人激励（守望先锋/奇迹暖暖/恋与制作人）等，详见规范文件淘汰清单。
- **WATCH 12 项**：Meshtastic（日期矛盾）、REBUILD-Z（无一手页）、ai4hack（金额自相矛盾）、DFRobot（赛程在图片）、Climate Jam/Craftpix（密度低）、妙想天开游戏卡（收费+邮寄）、CCL-Eval、Zindi Drought、MLH GHW Data 场、中国好创意 3C（10-20 开放，下轮收）、台湾 TAIA、MinerU 赛程。
- **HerClaw 预设扩充**：新增 6 条显式匹配（B站AI创造公开赛、东莞百景、天池垂直行业 Agent、Seeed XIAO、Kaggle BenchFlow、微博 VibeLab），合计 16 条。
- **新增 OCG 网站预设**：按卡牌/游戏方向受众筛选 TCG AI 赛、游戏开发 jam、卡面与游戏美术设计赛，共 20 条显式匹配。

## 事实核验记录

- MiniMax：报名页（minimax-agent-hackathon.space.minimax.io）当前渲染 Winners Announcement（2025-09），新闻页「Aug 11–25」为 2025 年旧文；判定已结束，不收录。
- 抖音AI创作大赛：即梦官方活动页确认投稿截止 2026-08-20、金奖 100 万、银奖 20 万 ×10。
- 东莞百景：100aicv.com（模聚工场 ModelHub）在线，赛事中心与需求大厅正常。
- B站AI创造公开赛：官方 opus 规则页确认一等奖 100 万、「不收纯 AIGC」、投稿前不得他平台发布、获奖须 B站独家。

## 验收标准（沿用第 4 批）

- 新记录无重复 ID、名称或规范化官方 URL。
- 所有正式新增记录有来源、复核日期、可行动主截止与显式资格边界。
- 中国资格未知时不得出现「可参加」的确定表述；明确 No-go 的项目不得进入默认推荐。
- `primaryDeadline` 必须与唯一的 `deadlines[].primary` 对齐；估算与滚动日期必须标注。
- 数据测试、雷达审计、生产构建与桌面 / 移动页面检查全部通过。
