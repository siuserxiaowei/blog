# 竞赛雷达第 6 轮（第 151+ 轮）汇总与实施决策 · 全平台复扫

检索快照：2026-08-04（Asia/Shanghai）。距第 5 轮（2026-08-02）两天。
本文件是第 6 轮数据落盘的**唯一事实来源**。11 条赛道并行检索（含第 5 轮 WATCH 清单 12 项复核），全部正选均追溯官方页/一手公告核对；检索过程记录见各赛道账本，本文件只保留决策与落盘字段。

## 本轮检索范围与工具实况

- 赛道：抖音/剪映/即梦+快手/可灵；小红书+B站+微博；微信公众号/政企公告；知乎/豆瓣/少数派/V2EX/掘金/即刻；国际黑客松平台（Devpost/DoraHacks/lablab/MLH/ETHGlobal/TAIKAI）；X/Reddit；游戏/卡牌；硬件/maker；数据算法平台（Kaggle/天池/Zindi/和鲸/DataFountain/Biendata/CodaBench）；设计/AIGC 平台；WATCH 复核。
- 工具实况（影响下轮策略）：Exa 共享免费额度本轮中段起 429 限流；jina 匿名读取被网络信誉封禁（部分 agent 可用、部分 401）；opencli 浏览器桥未连接（小红书/Twitter 站内搜索不可用，B站改用公开搜索 API）；微信原文直读被反爬，靠 Exa 正文抽取/媒体通稿交叉。
- 上一轮线索复核：外滩黑客松 AI Coding（bund）与 AMD AI DevMaster（amddevmaster2026）被重新"发现"，确认均已在库，不重复收录。

## 入选决策总览

- **NEW 42 条**：S 级 0、A 级 9、B 级 33（其中 Web3 降级 3、地域/身份限制标注 6、置信度中低保守标注 4）。
- **REJECT 5 类**：见「淘汰清单」。
- **CORRECTION 1 条**：mineru-mdic-2026 已结束（2026-07-19 颁奖）。
- **WATCH 10 项**：见「观察清单」。

## 入选条目字段规范（42 条）

通用说明：
- `cat` 从现有 17 类选；建议已给出。
- `deadlineISO` 取用户当前最需要行动的节点；估算/滚动日期用哨兵 + certainty 标注。
- `timeline` 每项 date 必须可被 parseCompetitionDate 解析；「待确认」写进 label/certainty，不写无法解析的字符串。
- `sources[].date` 注明是公告发布日还是核验日（2026-08-04 核验）。
- 奖励中现金/Credits/实物/投资/流量分开写。

### A 级（9 条）

1. **gauntlet-of-gods-2026** | Gauntlet of Gods（第 13 届 3D Community Challenge）
   - org: Create with Clint（Clinton Jones）；url: https://createwithclint.com/community-challenges/13
   - loc: 全球线上；cat: 游戏/设计类（OCG 强匹配）
   - timeline: 活动 2026-08-01→08-31；提交链接 2026-08-14 10:00 PDT 开放；提交截止 2026-08-31（confirmed，PDT）
   - 奖励：实物/软件包（Rokoko 动捕、XPPen、Marvelous Designer、Gnomon、KitBash3D、$400–800 渲染券）；Top100 卡牌实体印刷发行，利润捐 UNESCO IFCD
   - 资格：无国籍年龄限制，中国可参加（Google Forms 提交需自行解决访问）；**禁止生成式 AI**；一人一稿
   - 证据：官方规则页直读确认时间/奖品/规则（2026-08-04 核验）
   - fit: OCG 显式匹配（3D 角色+动画 TCG 卡牌设计，赛后做成真实卡牌游戏）；tier A；match 建议 8.5+

2. **pazhou-international-ai-2026** | 第五届琶洲算法大赛 · 国际 AI 赛（AI 产品方案赛）
   - org: 琶洲算法大赛组委会（广州海珠区）；url: https://www.aicompetition-pz.com/event_detail/120
   - cat: 算法/创业类；loc: 线上
   - timeline: 报名截止 2026-09-30（confirmed，UTC+8）
   - 奖励：非现金——超 1000 万元落地扶持、基金路演对接、招聘绿色通道、「超级个体」政策（入驻/补贴/税收）
   - 资格：国际组（海外主体）+ 国内组（须具备出海能力并在 BP 说明）；报名表+BP 即可，无需代码；领域含 AI 终端与智能硬件、具身智能
   - 证据：琶洲官网赛事页直读（2026-08-04 核验）
   - fit: 龙虾盒子显式匹配（AI 硬件+出海叙事）；tier A
   - 注意：与在库 pazhou-super-claw-2026 / pazhou-ai-application-2026 是同大赛不同赛道，desc 中注明

3. **kling-inspiration-ventures-2026** | 可灵 AI「灵感·新纪元」AIGC 创投计划 2.0
   - org: 快手磁力引擎 / 可灵 AI / 快手短剧；url: 无独立规则页，官方发布渠道为公众号「快手短剧内容研究中心」；用 https://www.klingai.com/ 或磁力引擎页作主链接，sources 注明公众号渠道
   - cat: AI 视频/内容类；loc: 中国大陆
   - timeline: rolling（2026-05-19 磁力引擎大会仍在主推 2.0）；certainty rolling
   - 奖励：现金——单项目最高 50 万元出资/保底（2.0 保底 2 万）；Credits——最高 1000 万灵感值+算力覆盖；流量最高 1 亿；分账最高 90%
   - 资格：机构/团队为主（联合出品需公司+剧本+过往作品）；个人 IP 走「联合运营」
   - 证据：新浪财经 2026-05-20、腾讯新闻 2025-09-08 通稿交叉；置信度中，desc 标注「细则以官方商务对接为准」
   - tier A（保守描述）

4. **emma-hackathon-2026** | emma Hackathon
   - org: emma（多云 GPU infra 平台）；url: https://hackathon.emma.ms/
   - cat: AI 软件/开发者类；loc: 全球线上（申请制，48h–3 工作日出审核）
   - timeline: 提交截止 2026-09-20 23:59 CET（confirmed，页面标注 firm）；评审 09-21→25；公布 09-26
   - 奖励：现金 1st $25,000 / 2nd $15,000 / 3rd $7,000 / 人气 $3,000（总 $50k）；赛期免费 GPU 算力
   - 资格：全球 1–5 人（Builders）/1–2 人（Showcases），免费；需在 emma API/SDK 上构建；无地域排除条款（中国大陆个人可报）
   - 证据：官网直读（2026-08-04 核验）；tier A

5. **huaqiu-cup-ai-hardware-2026** | 2026 华秋杯 AI 开源硬件创新设计大赛
   - org: 华秋（华秋开源硬件社区）；url: https://p.eda.cn/act/hqcup2026
   - cat: 硬件/maker 类；loc: 中国线上
   - timeline: 报名/提交 2026-07-01→2026-11-20（confirmed，CST）；评审公示 11-20→12-23；颁奖 12-23→31
   - 奖励：现金 一等 ¥5,000×1 / 二等 ¥2,000×3 / 三等 ¥1,000×5（税前）；打样券 3000/1000/500；免费赞助开发板 10 款（地瓜 RDK X5 Module、MUSE Pi Pro、VisionFive 2、英飞凌 PSOC Edge 等）
   - 资格：不限地域身份；作品须 100% 开源+大赛专属首发；获奖后寄实物验证
   - 证据：官方活动页直读（2026-08-04 核验）；赛题明确鼓励具身智能/端侧 AI/桌面助手
   - fit: 龙虾盒子显式匹配；tier A

6. **lcsc-wch-riscv-2026** | 「沁恒 RISC-V MCU 杯」第 11 届立创电子设计大赛
   - org: 立创商城；url: https://diy.szlcsc.com/posts/b2b65ad17ac34080a318a5ab47a632c2
   - cat: 硬件/maker 类；loc: 中国线上
   - timeline: 报名+提交 2026-05-15→2026-10-24（confirmed，CST）；评审公布 11-20；颁奖 12 月下旬（estimated）
   - 奖励：现金 特等奖 ¥20,000 等（税前）；完成奖京东卡 50–200；人气 TOP50（第 1 名 ¥1,000）；沁恒物料 +¥1,000；优秀作品众筹+量产+资本对接
   - 资格：个人/团队；**参加过嘉立创集团其他赛事（星火计划/硬核手搓/训练营等）的作品不可再参赛**——写入资格边界
   - 证据：立创官方详情页直读（2026-08-04 核验）
   - fit: 龙虾盒子显式匹配（自由命题可 AI 硬件；复刻赛道含 MoHi AI 对话机器狗）；与在库 jlcspark/spark 是不同赛事；tier A

7. **iflytek-robot-innovation-2026** | 2026 iFLYTEK AI 开发者大赛 · 机器人创新赛
   - org: 科大讯飞 × 中国工业设计协会；url: https://challenge.xfyun.cn/robot
   - cat: 机器人/AI 硬件类；loc: 中国线上+线下答辩
   - timeline: 作品征集 2026-05-25→2026-09-10（confirmed，CST）；初赛 09-11→15；复赛 09-16→20；决赛答辩 10-23；1024 开发者节颁奖
   - 奖励：现金 至尊 ¥10,000×1 / 金奖 ¥8,000×2 / 银奖 ¥5,000×3 / 铜奖 ¥3,000×4；入围决赛实物模型制作/运输费由组委会承担；前 10 名 1024 展出+实习就业
   - 资格：国内外企业/高校/团队/个人（≤5 人）；**拒收完全由 AI 生成的作品**——写入边界
   - 证据：讯飞官方赛题页直读（2026-08-04 核验）
   - 注意：在库已有 20 条讯飞赛道但无「机器人」赛道，属不同赛道
   - fit: 龙虾盒子显式匹配（陪伴机器人/具身智能，主办方资助样机）；tier A

8. **harbin-beer-ai-hiphop-2026** | 2026 哈啤 AI 嘻哈大赛
   - org: 哈尔滨啤酒 × 即梦 AI（抖音协同）；url: https://jimeng.jianying.com/ai-tool/activity-detail/2026-720-dreamina-weekly-challenge （JS 页）；官方细则 bytedance.larkoffice.com/wiki/U1KQwJbROiW8sBkXuuQcYhBbnjd
   - cat: AI 视频/内容类
   - timeline: 投稿 2026-07-27→2026-08-25（confirmed，UTC+8）；评审 09-07→18；公示 10-08→16
   - 奖励：现金 最佳嘻哈态度 ¥24,000×2 / 最佳好运显化 ¥12,000×3 / 单项 ¥6,000×若干 / 人气 ¥5,500×8（共 22 名）；即梦积分最高 7 万+Dou+ 最高 4,000
   - 资格：免费；即梦网页端投稿+抖音同步发布（4 指定话题）+返稿问卷三步缺一不可；AI 占比 ≥50%；中国大陆
   - 证据：官方细则（飞书）+ 代言人微博官宣 + 媒体交叉（2026-08-04 核验）；tier A

9. **jimeng-effie-ad-remix-2026** | AI 广告爆改大赛 · 经典广告你来演
   - org: 即梦 AI × 抖音电商 × 艾菲奖（Effie）；url: 即梦官网活动板块（jimeng.jianying.com，App/Web 内投稿）
   - cat: AI 视频/内容类
   - timeline: 投稿 2026-07-23→2026-08-20 23:59（confirmed，UTC+8）；获奖公布 08-28
   - 奖励：现金——5 赛道（4 品牌授权赛道+1 公益）各设最佳创意 ¥20,000×1 / 最佳吸睛 ¥10,000×2 / 最具潜力 ¥1,000×10；等额即梦积分；艾菲奖证书；现金总池约 25 万
   - 资格：免费；即梦+抖音账号，投稿同步带话题发抖音并勾选 AI 声明；不得用明星肖像；中国大陆
   - 证据：北京商报/雷峰网/重庆日报 2026-07-23/24 通稿一致（2026-08-04 核验）；获奖总名额口径不一（117 vs 65）标注待确认
   - tier A

### B 级（33 条）

10. **qianwen-multimodal-reasoning-2026** | 「千问杯」千问多模态推理挑战赛（琶洲算法大赛赛题）
    - org: 阿里巴巴 ATH 千问事业部 / 琶洲算法大赛；url: https://www.aicompetition-pz.com/event_detail/118
    - timeline: 初赛 2026-07-10→08-30；决赛 09-05→09-28（confirmed，UTC+8）；报名随大赛整体至 09-30
    - 奖励：单题奖金官方页未列，待确认；大赛整体有奖金+扶持
    - 资格：全球开发者；须基于官方基线 Qwen3.5-0.8B，禁外部预训练权重
    - cat: 算法/数据类；tier B

11. **ai-info-literacy-student-2026** | 2026 大学生「AI+信息素养」大赛
    - org: 高校信息素养教育协作平台（智信数图承办，重庆大学办联赛）；url: https://csc.xxsuyang.com/
    - timeline: 报名 2026-07-03→09-17（confirmed）；校赛 09-19→21；省赛 10-17→11-02（作品提交截止 11-02 22:00）；全国联赛 11-26→27 重庆线下
    - 奖励：证书+奖品，无公开现金；资格：中国高校全日制学生，**须学校先报名**——学生限定标注
    - cat: 学生/教育类；tier B

12. **qincheng-guanghe-aigc-video-2026** | 2026「亲橙光合」首届 AIGC 视频创作大赛
    - org: 云谷中心主办；呜哩 AI、魔搭社区、阿里巴巴亲橙联合；url: https://mseo-heliora.ms.show/ （投稿 https://modelscope.cn/active/ai-video-voting）
    - timeline: 投稿 2026-06-23→08-14 14:00（点赞统计截止，confirmed，UTC+8）；终选 08-15→29；公布 08-30→31；巡展 09-01 起
    - 奖励：现金 金 ¥10,000×1 / 银 ¥5,000×2 / 铜 ¥2,500×3 / 优秀 ¥1,000×15 + 平台权益+签约机会
    - 资格：个人；需社媒带话题发布+官网投稿源文件；中国大陆
    - cat: AI 视频/内容类；tier B

13. **asus-adol-douding-2026** | 华硕 a 豆「豆叮 AI 衍生共创设计赛」终轮
    - org: 华硕 a 豆（主战场小红书）；url: https://weibo.com/5931224236/RbmjdABkg
    - timeline: 投稿 2026-08-01→08-31（confirmed，UTC+8）
    - 奖励：实物（笔记本/礼盒/键盘/音箱）+作品制官方周边+商业化授权机会；按点赞量评奖
    - cat: 设计/AIGC 类；fit: OCG 边缘（IP 衍生/周边设计可投卡牌方向）；tier B

14. **weibo-video-remix-season-2026** | 微博二创视频创作季
    - org: 微博（@微博视频）；url: 站内话题 #微博二创视频创作季#；公告 https://www.sina.cn/news/detail/5288692478643390.html
    - timeline: 基础赛道 2026-04-17→12-31（rolling/confirmed）；月度主题轮换
    - 奖励：现金池瓜分；每周 TOP500 最高 ¥200+10 万流量券
    - cat: AI 视频/内容类；tier B；置信度中（月度主题需站内复核）

15. **jimeng-weekly-challenge-2026** | 即梦 AI 每周挑战赛（Dreamina Weekly Challenge 系列）
    - org: 即梦 AI；url: https://jimeng.jianying.com/ai-tool/activity-detail/2026-289-dreamina-weekly-challenge （期号滚动）
    - timeline: rolling 周更；本期主题待确认
    - 奖励：Credits 为主（历史规则每周精选 5 人各 5000 积分；2026 当前期待确认）
    - 资格：即梦/剪映创作、≥720p、含 AI 画面、首发原创；中国大陆
    - cat: AI 视频/内容类；tier B；置信度中

16. **abb-cup-2026** | 2026 ABB 杯智能技术创新大赛
    - org: ABB（中国）× 中国自动化学会；url: https://new.abb.com/cn/innovation/2026-abb-cup-innovation-contest
    - timeline: 2026-03-12 启动，报名/提交截止**待确认**（赛程为图片，页面仍挂报名入口，unknown certainty + 哨兵）；历届决赛秋季
    - 奖励：现金——「智储优控」赛题奖金池 5 万；「轻量化语音模型」赛题证书+ABB 贝加莱实习/校招优先面试
    - 资格：中国大陆及港澳台+海外留学生，全日制在校学生（高职以上），≤3 人+导师——学生限定
    - cat: 算法/工业类；tier B；置信度中

17. **gba-aigc-shortdrama-2026** | 粤港澳大湾区 AIGC 短剧制作征集大赛
    - org: 妙笔华章 × 广州广播电视台；url: https://mp.weixin.qq.com/s/UshdP5-5R7ooZxE20Ye3iw
    - timeline: 提交截止 2026-12-31 24:00（confirmed）；季度滚动评审（Q3 7-01→9-30 进行中）；颁奖 2027-01-15（estimated）
    - 奖励：待确认（原文仅「奖项激励」；关联赛事「百万奖金」不可引用）
    - 资格：高校学生组+社会组织组，**大湾区主体限定**
    - cat: AI 视频/内容类；tier B（偏低）

18. **ethonline-2026** | ETHOnline 2026（ETHGlobal）【Web3 降级】
    - org: ETHGlobal；url: https://ethglobal.com/events/ethonline2026
    - timeline: 活动 2026-09-04→09-16（confirmed，异步线上）；申请截止待确认
    - 奖励：待确认（2025 参考 $100K+）
    - 资格：全球线上，免费；Web3 主赛道（接受 AI+Agent），按雷达惯例加密类降级标注
    - cat: 黑客松/国际类；tier B

19. **keeperhub-agents-onchain-2026** | KeeperHub · Agents Onchain Hackathon【Web3 降级】
    - org: KeeperHub（DoraHacks）；url: https://dorahacks.io/hackathon/agents-onchain/detail
    - timeline: 提交截止 2026-08-13 12:00 UTC+2（confirmed）；评审 08-13→20；公布 08-20
    - 奖励：现金 $5,000（$2,000/$1,200/$800）+$1,000 bounty，稳定币
    - 资格：全球 18+，线上，免费（排除 OFAC 地区）；须用 KeeperHub 作执行层
    - cat: 黑客松/国际类；tier B

20. **flare-summer-signal-2026** | Flare Summer Signal【Web3 降级】
    - org: Flare（DoraHacks）；url: https://dorahacks.io/hackathon/flaresummersignal/detail
    - timeline: 开发期 2026-06-29 起；提交截止 2026-08-14（confirmed 日期，时区待确认）；公布 08-24
    - 奖励：现金 $12,000（两 bounty 各 $6,000）；须 Flare 链上构建
    - cat: 黑客松/国际类；tier B

21. **gatewayhacks-2026** | GatewayHacks 2026 · Software & AI For Humanity
    - org: Gateway（非营利，Devpost）；url: https://gatewayhacks-2026.devpost.com/
    - timeline: 活动 2026-09-01→10-02（confirmed；提交截止 10-01 23:59 EDT）；公布 10-21
    - 奖励：名义 $11,685 绝大部分为 Momen Credits，真实现金极小（1st 仅 $50）——奖励构成必须写实
    - 资格：全球，高中生起，≤4 人，免费，允许 AI 工具；公益主题（无障碍/教育/可持续），软硬件 AI 皆可
    - cat: 黑客松/国际类；tier B

22. **btt-web-game-jam-2026** | BTT Web Game Jam · Summer 2026
    - org: BTT（Devpost）；url: https://btt-web-game-jam.devpost.com/
    - timeline: 活动 2026-08-07→08-21（confirmed，线上两周）
    - 奖励：现金 €100（Best Overall）+赞助奖品待上线
    - 资格：全球 1–4 人，免费，允许 AI 编码助手；浏览器可运行游戏，无主题限制
    - cat: 游戏/卡牌类；fit: OCG 显式匹配（网页卡牌原型）；tier B

23. **reverie-hacks-2026** | Reverie Hacks 2026
    - org: Reverie Hacks（学生组织，Devpost）；url: https://reverie-hacks-2026.devpost.com/
    - timeline: 提交截止 2026-08-17 00:00 CDT（confirmed）
    - 奖励：名义 $222k 几乎全为 credits/订阅；真实现金约 $1,000；含 Embedded Systems 赛道
    - 资格：**学生限定**（以高中生为主），≤3 人，线上免费
    - cat: 黑客松/国际类；tier B（偏低）

24. **mlh-ghw-data-2026** | MLH Global Hack Week: Data Week
    - org: Major League Hacking；url: https://ghw.mlh.io/events/data-week
    - timeline: 2026-09-11→09-17（confirmed，全球线上）
    - 奖励：无大额奖金，每日挑战+周边
    - 资格：任何人、免费；与在库 mlh-ghw-agents-2026 同系列
    - cat: 黑客松/国际类；tier B

25. **fossee-oshw-makeathon-2026** | FOSSEE OSHW Makeathon 2026
    - org: FOSSEE（IIT Bombay）；url: https://makeathon26.fossee.in/
    - timeline: 报名 2026-08-01 起；制作期 08-15→09-30；提交截止 2026-09-30 23:59 IST（confirmed）；公布 10-16
    - 奖励：现金 ₹8,000/₹5,000/₹3,500（象征性）+平台展示；硬件成本自理；须开源（CC BY-SA 4.0），IP 与 FOSSEE 共有——写入边界
    - 资格：**学生限定**，全球可报（含中国），≤5 人，免费
    - cat: 硬件/maker 类；fit: 龙虾盒子弱匹配（开源硬件+TinyML）；tier B

26. **spooktober-vn-jam-2026** | Spooktober 第 8 届视觉小说 Jam
    - org: Visual Novel Developer Network（itch.io）；url: https://itch.io/jam/spooktober-2026
    - timeline: 创作期 2026-09-01→10-01（confirmed，UTC）；评审至 10-28
    - 奖励：现金 1st $1,000/2nd $750/3rd $500+Vograce 券；单项 $100×3、Best Chatsim $500
    - 资格：全球免费；**两个硬条件：前三名评奖需购买付费 Judge Pass（Patreon）；全程禁止生成式 AI**——必须显著标注
    - cat: 游戏/卡牌类；fit: OCG 边缘（叙事向）；tier B

27. **godothub-festival-2026** | GodotHub Festival 2026（第四届 Godot 游戏创作节）
    - org: GodotHub 中文社区（OpenKylin/CSDN/GitCode/Tripo AI 等协办）；url: https://godothub.com/event/festival-2026
    - timeline: 报名截止 2026-08-30 23:59（confirmed，UTC+8）；提交截止 2026-09-06 23:59；评审 09-07→10-18；结果 10-30；主题「滞后 Delay」
    - 奖励：现金 最佳游戏 ¥5,000/最具创意 ¥3,000/一等 ¥1,000×3/二等 ¥500×6/三等 ¥200×12
    - 资格：中国社区赛，需手机号+实名；Web 或 Windows 可运行包；须 09-10 前在 B站/抖音/小红书发带标签视频
    - cat: 游戏/卡牌类；fit: OCG 显式匹配（Godot 卡牌原型）；tier B

28. **gbjam-14** | GBJAM 14
    - org: GBJAM（itch.io 社区）；url: https://itch.io/jam/gbjam-14
    - timeline: 提交窗口 2026-09-11 11:00→09-21 11:00 UTC（confirmed）；评审至 10-05
    - 奖励：无现金（社区 jam）；Game Boy 复古风限制，历届数千作品
    - cat: 游戏/卡牌类；fit: OCG 显式匹配；tier B

29. **godot-wild-jam-rolling** | Godot Wild Jam（月度滚动）
    - org: Godot Wild Jam 社区；url: https://itch.io/jam/godot-wild-jam-97 （当期 #97）
    - timeline: rolling（每月第二个周五开跑；#97 提交 2026-09-11→09-20 UTC，confirmed）
    - 奖励：无现金，社区评分制；须用 Godot
    - cat: 游戏/卡牌类；fit: OCG 显式匹配（练兵场）；tier B；rolling certainty

30. **meshtastic-build-off-2026** | Meshtastic Build-Off 2026（Seeed × Meshtastic）
    - org: Seeed Studio × Meshtastic；url: https://github.com/Seeed-Projects/meshtastic-build-off-2026
    - timeline: 提交截止 2026 年 8 月（仅月份，unknown certainty）；**日期矛盾标注**：README 横幅写 8-15 公布获奖、表格写 8 月下旬——desc 写明矛盾，建议尽快提交
    - 奖励：奖池 $3,000+（构成待确认）
    - 资格：全球线上免费，须开源（GitHub Issue 提交）
    - cat: 硬件/maker 类；fit: 龙虾盒子显式匹配（LoRa mesh）；tier B；置信度中

31. **robotac-quadruped-2026** | 2026 ROBOTAC（智身科技）四足机甲挑战赛
    - org: 全国大学生机器人竞赛组委会；url: https://www.robotac.cn/h-col-254.html
    - timeline: 中期检查提交截止 2026-09-11（confirmed）；总决赛 10–11 月天津线下（estimated）；**报名是否仍开放待确认**
    - 奖励：比例制奖项无现金；企业推荐；免费（差旅自理）
    - 资格：**高校学生限定**；智身科技四足平台+MATRiX
    - cat: 机器人/AI 硬件类；tier B；置信度中

32. **digikey-arduino-dream-lab-2026** | DigiKey × Arduino Dream Lab Challenge（UNO Q）【地域 No-go 标注】
    - org: DigiKey × Arduino；url: https://www.prnewswire.com/news-releases/digikey-and-arduino-unveil-challenge-to-award-20-000-in-prizes-302831534.html
    - timeline: 提交截止 2026-09-30（confirmed，美国时间）
    - 奖励：实物——4 名各价值约 $5,000 测试设备包
    - 资格：**仅限美国居民 18+**——中国大陆不可参加，No-go 标注，不进默认推荐
    - 注意：与在库 hackster（Hackster 平台 UNO Q 赛）是不同赛事
    - cat: 硬件/maker 类；tier B

33. **zindi-drought-forecast-2026** | A Step Ahead of Drought（Zindi × ITU）
    - org: ITU（AI for Good，联合 UNEP/WMO/UNCCD/ESA/ECMWF）；url: https://zindi.africa/competitions/one-step-ahead-of-drought-forecasting-global-water-storage-challenge
    - timeline: 开赛 2026-07-09；提交截止 2026-09-13 21:59 UTC（confirmed）
    - 奖励：现金 €2,000+Zindi 积分
    - 资格：Open to all，≤4 人队（俄罗斯居民无法收款）
    - cat: 算法/数据类；tier B

34. **jciiot-embodied-ai-2026** | JCIIOT 2026 · Industrial Embodied AI Challenge（Biendata）
    - org: JCIIOT（Biendata）；url: https://www.biendata.xyz/competition/jciiot/
    - timeline: 开赛 2026-07-01；队伍合并截止 07-24（已过）；比赛关闭 2026-09-01（confirmed）；**新队伍是否仍可报名待确认**
    - 奖励：现金总池 ¥94,000（拆分需登录，待确认）
    - 资格：实名制（姓名+机构）；中国平台可参加
    - cat: 算法/数据类；fit: 龙虾盒子方向相关（工业具身智能）；tier B；置信度中

35. **yixian-ai-create-2026** | 轻养青年 & 黟县生活 2026 AI 创作大赛
    - org: 黟县徽黄旅游集团 × 万剪师 AI；url: https://www.wanjianshi.com
    - timeline: 征集 2026-08-03→09-30（estimated）；评审 10-01→10；公示 10-11→30；颁奖 11-01
    - 奖励：现金+实物——一等 ¥3,000+大疆 Pocket 4 Pro×1 / 二等 ¥2,000+华为 nova 11×2 / 三等 ¥1,000+FreeBuds Pro 3×3 / 单项实物×3 / 优秀×5
    - 资格：免费；**70% 以上创作流程须在万剪师 AI 画布完成并公开工作流**——工具绑定写入边界；发布至抖音/快手/小红书/B站带话题
    - cat: AI 视频/内容类；tier B；置信度中（单一详源）

36. **yuandian-cup-aug-2026** | 第二届「原点杯」AIGC 创作大赛 · 8 月赛季「来，看我的城」
    - org: 东升镇党委/政府主办，海淀区委宣传部等指导；平台 Meme AIGC；url: https://www.memeaigc.cn
    - timeline: 征集 2026-08-01→08-31 23:59:59（confirmed，UTC+8）；评审 09-01→08；公示 09-09；全年 8 个主题赛季（rolling 月赛，desc 注明）
    - 奖励：现金——视频一等 ¥7,000/二等 ¥3,500×4/三等 ¥2,000×7；音乐一等 ¥3,000；图文一等 ¥2,000；入围 50×300 名+推广/引荐激励；非现金：IP 孵化、订单对接、算力补贴（企业最高 20 万）
    - 资格：免费；AI 占比视频≥70%/音乐≥60%（腾讯音乐 AI 工具）/图文≥80%；中国大陆
    - cat: AI 视频/内容类；tier B

37. **opc-anime-toy-hackathon-2026** | 超级 OPC 共创日 · 动漫潮玩 AI 黑客松（第十六届漫博会配套）
    - org: 第十六届中国国际动漫博览会配套（东莞石排），GBA OPC 联盟参与；url: https://www.actifchina.net （无独立赛页，报名经社群二维码——标注）
    - timeline: 报名截止 2026-08-06（estimated）；活动 2026-08-09 09:30–17:30 东莞线下
    - 奖励：现金总池 ¥12,000（3,000×1/2,000×2/1,000×2/1,000×3）+潮玩海外订单对接
    - 资格：免费，限 50 组，**需线下到场自备电脑**；命题：潮玩 IP 出海 / 潮玩企业 AI 智能体
    - cat: 黑客松/国内类；tier B；置信度中；时间极紧需在最紧提醒位

38. **china-red-season2-2026** | 「我心中那抹中国红·第二季」动漫作品征集大赛（第四届新疆动漫节）
    - org: 新疆社科联、党委网信办、科协；url: http://www.xjskw.org.cn （投稿邮箱 xjdmjzp@163.com）
    - timeline: 征集→2026-09-01（confirmed，UTC+8）；评选公示 09-02→07
    - 奖励：现金（含税）动画 一等 ¥20,000×1/二等 ¥10,000×3/三等 ¥2,000×5；漫插画 一等 ¥10,000×1/二等 ¥5,000×3/三等 ¥1,000×5
    - 资格：免费，全国不限年龄职业；**支持 AI 辅助但须主动标注**；动画 1–5 分钟、插画 3–10 幅
    - cat: 设计/AIGC 类；tier B

39. **tiantangzhai-ai-video-2026** | 安徽天堂寨全民 AI 短视频大赛
    - org: 安徽天堂寨风景区；url: https://mp.weixin.qq.com/s/ol2MSAO_x1ccX5a0OT2Y0A
    - timeline: 征集→2026-08-10（confirmed，UTC+8）；评审 08-11→15；公示 08-18
    - 奖励：现金总池约 ¥10,000（3,000×1/1,500×2/800×3/240×10）
    - 资格：免费；抖音发布+指定话题+景区定位；AI 加分非强制
    - cat: AI 视频/内容类；tier B；窗口极短

40. **dfrobot-xhs-maker-2026** | DFRobot × 小红书创造季
    - org: DFRobot × 小红书；url: https://mc.dfrobot.com.cn/thread-400407-1-1.html
    - timeline: 投稿截止 2026-08-24（confirmed，UTC+8）；评审 08-24→31
    - 奖励：现金（瓜分万元）+亿级流量；用 DFRobot 产品另有品牌礼包
    - 资格：免费；小红书发图文/视频带 #小红书maker创造季 #dfrobot创造分享
    - cat: 硬件/maker 类；fit: 龙虾盒子显式匹配（电子硬件 DIY 征集）；tier B

41. **climate-jam-2026** | Climate Jam 2026: Plant a Seed!（IndieCade）
    - org: IndieCade（itch.io）；url: https://itch.io/jam/climate-jam-2026
    - timeline: 提交截止 2026-08-12 23:59 PDT（confirmed）；社区投票至 08-19
    - 奖励：无现金；优秀作入选 Steam「Climate Solutions Anthology」合集
    - 资格：免费全球线上；AI 辅助允许须披露
    - cat: 游戏/卡牌类；fit: OCG 显式匹配（六周制，可做卡牌/叙事）；tier B

42. **craftpix-indie-jam-2026** | Craftpix Indie Jam #1-2026
    - org: Craftpix（itch.io）；url: https://itch.io/jam/craftpix-indie-jam-1-2026
    - timeline: Jam 2026-09-03→09-14（confirmed，UTC）；投票 09-14→25
    - 奖励：无现金；第 1 名 Craftpix Premium 12 个月+Spine Pro+Aseprite（≤4 人），2–5 名 Premium+Spine Essential
    - 资格：免费全球；**禁止 AI 生成内容**；须用至少一个 Craftpix 素材；需浏览器可玩版
    - cat: 游戏/卡牌类；fit: OCG 显式匹配（注意禁 AI 与用户工作流冲突，标注）；tier B

（说明：CCL26-Eval 评测 ccl26-eval-2026 作为第 43 条可选——14 个任务各自时间线未逐个核实，本轮按保守原则**不入库**，转观察清单，待逐个核实后下轮收录。）

## 淘汰清单（REJECT）

- **妙想天開怪異獸遊戲卡設計比賽**（香港）：HK$250/件报名费+实体原稿寄九龙+亲子社区向，收费门槛与雷达定位不符，REJECT。
- **Herstory Hardware Hackathon**（上海 8-14→16，女性限定）：无公开网页报名入口（仅公众号/社群二维码），证据不足，REJECT 转观察。
- **Venture D Vibe Coding 黑客松**（杭州，8 月底）：仅公众号招募文、无赛制无奖励细节，REJECT 转观察。
- **TikTok TechJam 2026**：官方规则页确认仅限新加坡居民+新大学在读，中国 No-go 且地域过窄，REJECT。
- **「2026 哈佛黑客松中国挑战赛」**（杭州 8-21→23，¥10 万）：仅聚合平台单源、无官方页，真实性存疑，REJECT。
- 已结束不收录（抽样）：UiPath AgentHack（提交 2026-06-29 已截止，2026-08-04 公布获奖）、Turing Test/Mantle、CopernicusLAC、Doomlings Create-a-Card、OKX.AI Genesis、ATEC2026、GMTK/Kenney/CiGA/BOOOM 春、道通 Physical AI（2027 届蹲守）、固高杯、百雀羚、大足石刻、和鲸 C4/BDC、DataFountain 睿创杯、CSIG 金睛杯、Roblox Developer Challenge、琶洲树根杯（7-20 截止）、台湾 TAIA（7-31 截止且限台湾学生）、AFAC2026（7-20 截止）、长三角聚劲、低空产业创新大赛、数字中国·数字智造赛道。

## 修正清单（CORRECTION）

- **mineru-mdic-2026**：已于 2026-07-19 在浦江生态论坛/WAIC 期间颁奖结束（多篇主办方生态微信文章确认）。按既有 status/corrections 模式标记结束，不删除记录。

## 观察清单（WATCH，下轮复核）

1. CCL26-Eval（cips-cl.org）：14 任务逐个核实时间线后收录；大会 10-15→18 宜昌。
2. 中国好创意第 21 届 3C 赛道：预计 2026-10-20 开报（往届规律，estimated），10 月中旬复查。
3. 快手探索者 LLM-Rec 挑战赛（SIGIR 联办，全球在校生）：官网时间线 JS 未渲染，截止时间未核。
4. 道通 Physical AI 大赛 2027 届（奖金池 300 万+，具身智能，龙虾盒子高匹配）：提前蹲守。
5. Kling NextGen 全球版下一期征稿；即梦模型上新配套征集（「脑内花园」8-08 公示后盯下一期）；剪映模板赛 8 月未见新期。
6. CCW 共创世界 Game Jam 十周年正赛时间未公布；机核 BOOOM 秋季场（预计 Q4）；indiePlay 入围/颁奖节点（9–11 月）。
7. MiniMax Agent Challenge 2026 新版（2025 届已结束，有连续办赛迹象）。
8. 琶洲生态合作赛两条：「火山杯 Agent 创新大赛」「Codebuddy 杯腾讯云游戏开发挑战赛」——独立官方页未核到。
9. Reddit Devvit 下一期游戏赛（r/hackathons 已被封禁，改盯 r/hackathon、r/gamedev 与 Devvit 官方博客，OCG 网页小游戏方向契合）。
10. Funpack 第五季第 5 期（预计 9 月上线）；ETHGlobal Tokyo/Mumbai 线下（若考虑出行）；「数据要素×」大赛国家数据局正式通知；金杏奖 2026 届。

## 项目预设更新建议

- **龙虾盒子预设**（现 16 条）建议追加显式匹配：huaqiu-cup-ai-hardware-2026、lcsc-wch-riscv-2026、iflytek-robot-innovation-2026、pazhou-international-ai-2026、dfrobot-xhs-maker-2026、meshtastic-build-off-2026、fossee-oshw-makeathon-2026（学生限制写明）、jciiot-embodied-ai-2026（报名状态写明）。每条须带匹配角度/硬门槛/投入判断（沿用现有格式）。
- **OCG 网站预设**（现 21 条）建议追加：gauntlet-of-gods-2026、btt-web-game-jam-2026、godothub-festival-2026、gbjam-14、godot-wild-jam-rolling、spooktober-vn-jam-2026（Judge Pass+禁 AI 写明）、climate-jam-2026、craftpix-indie-jam-2026（禁 AI 写明）。

## 验收标准（沿用第 5 批）

- 新记录无重复 ID、名称或规范化官方 URL；与在库 271 条无冲突。
- 所有新增有来源、复核日期、可行动主截止与显式资格边界；中国资格未知不得写「可参加」；No-go 不进默认推荐。
- `primaryDeadline` 与唯一 `deadlines[].primary` 对齐；估算/滚动日期必须标注。
- 数据测试、雷达审计、生产构建、桌面/移动抽查全部通过；271 → 313 条（42 新增），各测试计数断言同步。

---

# 第 6.5 轮 · 遗留观察项逐项核实（2026-08-04 同日补扫）

对第 6 轮 19 个遗留观察项逐项回溯官方页核实（全程未用 Exa——共享额度仍 429；以官方站底层 API/JSON、GitHub、归档快照、搜索索引交叉）。结论：

## 6.5 新增入库（2 条，313 → 315）

43. **ccl26-eval-image-translation-2026** | CCL26-Eval 任务十三 · 第一届跨境电商图像文本翻译大赛【A】
    - org: 中国中文信息学会 CCL 2026 评测组委会（任务组织：李海军/尚姿芙/梁杰/徐昭/骆卫华，阿里云赞助，天池承办）
    - url: https://tianchi.aliyun.com/competition/entrance/532463 ；系列入口 http://cips-cl.org/static/CCL2026/cclEval/taskEvaluation/index.html
    - timeline（UTC+8，confirmed，天池官方 API raceId 532463）：报名截止 2026-08-14 17:59:59；初赛提交 2026-07-13 10:00 → 08-14 18:00（每队全程限 2 次）；复赛 08-17 10:00 → 09-30 18:00；颁奖/研讨于 CCL 2026 大会（2026-10-15→18 宜昌）
    - 奖励：现金——天池页：一等 ¥20,000×1 / 二等 ¥5,500×2 / 三等 ¥3,000×3（总池 4 万，API bonus 字段吻合）；⚠️ CCL 入口页写 20000/10000/5000×2，名次分布两页不一致（总额同 4 万），以天池页为准并标注待确认；另发 CIPS 荣誉证书，总结论文可入 CCL/ACL Anthology
    - 资格：每队 ≤3 人、每人限一队；天池实名认证（支付宝）；无国籍限制，中国可参加；已 294 队
    - 注意：CCL 页描述（训练图翻质量自动评分系统）与天池实际赛题（500 张中文电商原图 ×5 语向直接产出 2500 张译后图）不一致，**以天池页为准**；CCL26-Eval 其余 13 个任务参赛/提交均已截止（最晚任务十四 7-23），故只单收任务十三，desc 注明隶属 series
    - cat: 算法/数据类；tier A；龙虾盒子/OCG 均不适配（通用算法赛）；置信度高

44. **volcengine-huoshan-cup-agent-2026** | 2026 火山杯 Agent 创新大赛（全年系列赛）【B】
    - org: 火山引擎（字节跳动）；指定开发平台：扣子/HiAgent/Trae/AgentKit/ArkClaw
    - url: https://developer.volcengine.com/competition （伞赛事总入口，recordType: series）
    - timeline: rolling——当前 10 个独立子赛，进行中且可提交的截止分布 2026-08-21 ~ 09-15（南京银行 8-31、福建高校 8-21、青农大 8-31、陕西师大 9-11、南京大学 9-7、深圳燃气 9-15、临平站 9-15、艺云 9-10；林氏家居 8-10 启动、外交学院 9-21 启动）
    - 奖励：各独立赛自定（参考实例：闽都站一等奖 ¥10,000/赛道 + Trae 企业版账号）；伞赛事统一奖金未公布——待确认
    - 资格：企业开发者/高校师生/个人；**多数子赛限本校/本企内部**（写入资格边界）；中国可参加
    - 生态绑定：「琶洲算法大赛×火山杯 Agent 创新大赛生态合作赛」为第五届琶洲算法大赛官方生态合作赛事（三大赛题：企业级知识库/多源文档综述/内容创作品牌传播），报名页 https://www.aicompetition-pz.com/topic_detail/35 （截止与奖金未公布，待确认）——写入 sources
    - cat: AI 软件类；tier B；partially-verified；与龙虾盒子仅内容创作赛道边缘相关，不进预设

## 6.5 核实结论（不入库项）

- **重复确认**：lablab.ai「AI Factory — native.builder Hackathon」与在库 aifactory2026 同 URL/同主办/同档期（8-03→10），不重复收录。
- **报名已截止**：快手探索者 LLM-Rec 挑战赛（¥100 万池、SIGIR 联办、全球在校生，报名 6-13→29 已截止，当前复赛阶段；下届 6 月蹲守，高价值）；REBUILD-Z×GEIA 深圳黑客松（报名 6-14→8-01 已截止，现处录取期，9-08→11 举办；奖池未公布，维持「无一手页」判断）。
- **已结束**：Kaggle Omnilex 法律 Agentic Retrieval（$10k，2026-05-24 关窗，库内本无条目）；第七届粤港澳大湾区文创大赛 AI 主题赛道「智汇湾区」（2025-11-20 已截止，旧文）。
- **无新进展/无法确认**：Meshtastic Build-Off 日期矛盾无官方澄清（README 自 2026-05-27 未更新，在库条目维持 unknown+矛盾标注，按最早口径 8-15 准备）；ai4hack 无 2026–27 新赛季（站点陈旧，WATCH 降权）；MiniMax Agent Challenge 无 2026 新版迹象（2025 旧站已下线，维持蹲守）；Vidu「100 个 AI 视频创意挑战赛」页面存活但 JS 挑战墙无法核实详情（与在库 vidu-ai-film-hackathon-2026 非同一赛事，WATCH）；CodeBuddy 杯腾讯云游戏开发挑战赛证实存在（琶洲生态合作赛道，小红花游戏/文化表达/叙事三赛道）但无独立官方页与截止信息（WATCH，注意与在库 tencentgamecreator2026 非同一赛事）；蛋仔派对社媒创作赛 8 月期未见开放（官网无公告，下轮走公众号渠道）；CCW 共创世界十周年正赛时间未公布（接口需登录，下轮用 B站登录态看官方号 8-04 视频）。
- **文档勘误**：第 6 轮淘汰清单中 UiPath AgentHack 的表述修正为「提交 2026-06-29 已截止、2026-08-04 公布获奖」（非 8-04 当天关窗），不收录决定不变。
