export const OFFICIAL_COVERAGE_CHECKED_AT = '2026-08-06';
export const BIG_TECH_OFFICIAL_TARGET_COUNT = 52;

function coverage(id, name, group, officialUrl, status, competitionIds, notes) {
  return Object.freeze({
    id,
    name,
    group,
    officialUrl,
    checkedAt: OFFICIAL_COVERAGE_CHECKED_AT,
    status,
    competitionIds: Object.freeze(competitionIds),
    notes,
  });
}

export const competitionOfficialCoverage = Object.freeze([
  // 国内大厂 / 官方开发者入口（24）
  coverage('hangzhou-yungu-center', '杭州云谷中心', 'china-big-tech', 'https://modelscope.cn/active/ai-video-voting', 'covered', ['qincheng-guanghe-aigc-video-2026'], '专项核验云谷中心主办的亲橙光合 AIGC 视频创作大赛；官方投票入口嵌入实际活动页。'),
  coverage('modelscope', '魔搭社区', 'china-big-tech', 'https://modelscope.cn/api/v1/competitions', 'partial', ['qincheng-guanghe-aigc-video-2026', 'ai-infinity-developer-creation-2026', 'minicpm-ascend-challenge-2026', 'production-ai-skills-2026', 'ventured-vibe-coding-hackathon-2026', 'silicon-carbon-ai-diagnosis-2026'], '8 月 9 日增量核验官方竞赛接口与详情页：接口元数据称总计 117 条，但翻页仅取得 112 条唯一记录，第 15 页重复第 14 页，故保持 partial；本轮关联 5 项当前机会，/active 动态 SPA 仍不能作为完整目录。'),
  coverage('alibaba-tianchi', '阿里云天池', 'china-big-tech', 'https://tianchi.aliyun.com/competition/gameList/activeList', 'covered', ['lorealtechathon2026', 'tianchi-industry-agent-2026', 'xpeng-agent-tianchi-2026', 'csig-rongqi-anomaly-2026', 'ccl26-eval-image-translation-2026', 'afac2026-financial-intelligence'], '检查天池官方赛事入口并与站内记录逐项对照；动态列表可能继续新增，当前关联已核验赛事。'),
  coverage('alibaba-cloud', 'Alibaba Cloud 开发者赛事', 'china-big-tech', 'https://www.alibabacloud.com/en/developer/global-ai-hackathon-series', 'covered', ['alibaba-cloud-ai-hackathon-pakistan-2026', 'qoder-hackathon-singapore-2026', 'qoder-agentic-ai-vietnam-2026'], '官方 Global AI Hackathon Series 与地区站点均已检查；地区限制和已截止状态照实保留。'),
  coverage('tencent-cloud-contests', '腾讯云赛事平台', 'china-big-tech', 'https://tch.cloud.tencent.com/contest', 'covered', ['tencent-cloud-game-dev-hackathon-2026', 'tencent-cloud-virtual-football-s13-2026', 'tencent-cloud-agent-championship-2026', 'tencent-cloud-ai-coding-singapore-2026', 'tencent-cloud-intelligent-pentest-2026', 'tencent-workbuddy-agent-singapore-2026', 'tencent-workbuddy-autism-hk-2026'], '官方接口以 pageSize=100 返回总量 11；完整原始目录另存，雷达关联当前相关及地区站项目。'),
  coverage('huawei-cloud-contests', '华为云开发者大赛平台', 'china-big-tech', 'https://developer.huaweicloud.com/competition/list', 'covered', ['huawei-cloud-embodied-intelligence-2026', 'huawei-terminal-bg-innovation-2026', 'huawei-youth-tech-challenge-2026', 'huawei-power-electronics-track1-2026', 'huawei-power-electronics-track2-2026'], '官方接口分页抓齐 423/423 条历史与当前记录；当前进行中 5 条，完整目录单独版本化保存。'),
  coverage('volcengine-contests', '火山引擎火山杯', 'china-big-tech', 'https://developer.volcengine.com/competition', 'covered', ['volcengine-huoshan-cup-agent-2026'], '官方总览接口抓齐 63/63 条：62 条独立赛和 1 条测试子赛；36 条提交截止尚未过去。'),
  coverage('iflytek-contests', '科大讯飞开发者大赛', 'china-big-tech', 'https://challenge.xfyun.cn/h5/home', 'covered', ['xfynl2wf2026', 'xfycqaskill2026', 'xfymsraskill2026', 'xfydiaskill2026', 'xfyocasskill2026', 'xfyfscicskill2026', 'xfyecgiskill2026', 'xfytmdiaskill2026', 'xfygdsskill2026', 'xfyspacemind2026', 'xinghuocup2026', 'iflytek-robot-innovation-2026'], '讯飞官方总览及当前重点赛题已检查；站内已有较完整的 Agent、Skill、星火杯与机器人赛事记录。'),
  coverage('baidu-ai-studio', '百度 AI Studio', 'china-big-tech', 'https://aistudio.baidu.com/competition', 'partial', [], '官网可达但赛事列表依赖动态渲染，当前检查未形成可证明完整性的目录；未把空结果写成确定无赛事。'),
  coverage('jd-joyinside', '京东 JoyInside', 'china-big-tech', 'https://joy-inside.jd.com/activity/', 'covered', ['jdjoyinside', 'jd-joyinside-innovation-2026'], 'JoyInside 官方活动入口已检查，关联首届黑客松与创新大赛记录；资格边界按各详情页保存。'),
  coverage('meituan', '美团技术赛事', 'china-big-tech', 'https://uav-challenge.meituan.com/', 'covered', ['meituan-lowaltitude-embodied-2026'], '美团低空经济与具身智能挑战赛官网已核验；仅全球高校在校学生且企业不得参赛。'),
  coverage('xiaomi-openvela', '小米 openvela', 'china-big-tech', 'https://openvela.com/', 'covered', ['openvela-ai-hardware-2026'], 'openvela 官方开发者入口及 AI 硬件开发者大赛已检查并关联站内记录。'),
  coverage('kuaishou', '快手 / 可灵 AI', 'china-big-tech', 'https://www.klingai.com/', 'covered', ['kuaishou-ican-ai-2026', 'kling-inspiration-ventures-2026'], '检查快手与可灵官方入口，关联 AI 未来创造者挑战赛和灵感·新纪元创投计划。'),
  coverage('bilibili', '哔哩哔哩创作活动', 'china-big-tech', 'https://www.bilibili.com/', 'partial', ['bilibili-ai-create-2026', 'bilibili-updream-animation-2026'], '官网主页可达，旧活动落地页已返回 404；站内保留已核验活动，但无法证明官方活动集合完整。'),
  coverage('ant-group', '蚂蚁集团', 'china-big-tech', 'https://www.antgroup.com/news-media', 'no-current-contest-found', [], '检查官方新闻与媒体入口，未发现可核验的当前公开开发者赛事；这只是本次入口检查结果。'),
  coverage('netease', '网易游戏学院', 'china-big-tech', 'https://game.academy.163.com/', 'no-current-contest-found', [], '网易游戏学院官方入口可达，本次未发现可核验的当前公开赛事；历史或其他业务线不在此结论内。'),
  coverage('lenovo', '联想开发者 / 活动', 'china-big-tech', 'https://www.lenovo.com/us/en/', 'no-current-contest-found', [], '原活动 URL 重定向到联想官网主页，本次未发现可核验的当前公开开发者赛事。'),
  coverage('dji', '大疆开发者', 'china-big-tech', 'https://developer.dji.com/', 'no-current-contest-found', [], '大疆开发者官网可达，本次未发现当前公开竞赛总览；不排除地区或合作方限定活动。'),
  coverage('trae', 'TRAE', 'china-big-tech', 'https://www.trae.cn/ai-creativity/', 'covered', ['trae-ai-creativity-2026', 'trae-solo-workplace-challenge-2026'], 'TRAE 官方活动入口已检查，关联 AI 创造力大赛与脉脉 SOLO 职场挑战赛。'),
  coverage('douyin', '抖音 AI 活动', 'china-big-tech', 'https://www.douyin.com/', 'partial', ['douyin-ai-create-2026'], '官网依赖动态内容与账号环境，已关联可核验的抖音 AI 创作大赛，但无法证明活动集合完整。'),
  coverage('qianwen', '通义千问', 'china-big-tech', 'https://tongyi.aliyun.com/', 'covered', ['qianwen-multimodal-reasoning-2026'], '通义千问官方入口与千问杯多模态推理挑战赛已检查并关联站内记录。'),
  coverage('huawei-developer', '华为终端开发者', 'china-big-tech', 'https://developer.huawei.com/consumer/cn/hdc/', 'covered', ['huawei', 'hwdevcomp', 'harmonyos-app-developer-incentive-2026', 'harmony-agent-tiangong-incentive-2026'], '华为终端开发者及 HDC 配套赛事入口已检查；8 月 9 日增量关联鸿蒙应用开发者激励和天工计划智能体激励，两者按 program 收录，不冒充传统比赛。'),
  coverage('tencent-game-institute', '腾讯游戏学堂', 'china-big-tech', 'https://gameinstitute.qq.com/awards2026', 'covered', ['tencentgamecreator2026', 'gwb2026'], '腾讯游戏学堂 2026 官方赛事入口已检查，区分全球游戏创作大赛与 GWB 游戏大奖。'),
  coverage('capcut', 'CapCut', 'china-big-tech', 'https://capcut.creaite26.com/', 'covered', ['capcut-creaite-2026'], 'CapCut CRE[AI]TE 2026 官方赛事站已检查并关联站内记录。'),

  // 国际大厂（20）
  coverage('openai', 'OpenAI', 'international-big-tech', 'https://openai.com/events/', 'partial', ['sea-openai-hackathon-tw-2026'], 'OpenAI 官方活动入口本次连接不稳定；已关联 Sea×OpenAI 台湾站，但不能声称覆盖 OpenAI 全部赛事。'),
  coverage('anthropic', 'Anthropic', 'international-big-tech', 'https://www.anthropic.com/events', 'no-current-contest-found', [], '官方 Events 页面可达，本次未找到可核验的当前公开竞赛条目；活动与赛事概念分开记录。'),
  coverage('google-deepmind', 'Google DeepMind', 'international-big-tech', 'https://deepmind.google/', 'partial', [], '原 events 路径重定向至 DeepMind 官网；未找到独立完整赛事索引，因此只标部分覆盖。'),
  coverage('microsoft', 'Microsoft', 'international-big-tech', 'https://developer.microsoft.com/en-us/reactor/', 'covered', ['msraivalues2026'], 'Microsoft Reactor 与 Research 官方入口已检查，关联 MSRA Global AI Values 挑战赛。'),
  coverage('aws', 'AWS', 'international-big-tech', 'https://builder.aws.com/connect/events', 'covered', ['cockroachagent'], 'AWS 开发者活动入口可达，关联 CockroachDB×AWS Agent 黑客松；未将普通活动误作竞赛。'),
  coverage('nvidia', 'NVIDIA', 'international-big-tech', 'https://developer.nvidia.com/', 'partial', ['zotac-ai-create-2026'], '指定 events 路径返回 404，开发者主页可达；关联 NVIDIA AIC 伙伴赛事，但官网赛事索引覆盖不足。'),
  coverage('meta', 'Meta AI', 'international-big-tech', 'https://ai.meta.com/', 'partial', ['wearableproactive2026', 'wearableconversation2026', 'wearablelongvideo2026'], 'Meta AI 入口连接不稳定；已关联官方研究生态的三项 Wearable AI 挑战，不能证明全量。'),
  coverage('apple', 'Apple Developer', 'international-big-tech', 'https://developer.apple.com/events/', 'covered', [], 'Apple Developer Events 页面可达并明确列出 Swift Student Challenge；本次未新增 2026 站内记录。'),
  coverage('ibm', 'IBM Developer', 'international-big-tech', 'https://developer.ibm.com/callforcode/', 'partial', ['agenticcinema2026'], 'Call for Code 入口本次超时；已关联 Google Cloud×IBM Agentic Cinema，但 IBM 官方覆盖不完整。'),
  coverage('oracle', 'Oracle Developer', 'international-big-tech', 'https://developer.oracle.com/events/', 'no-current-contest-found', [], '活动 URL 重定向至 Oracle Developer 主页，本次未发现可核验的当前公开竞赛总览。'),
  coverage('intel', 'Intel Developer', 'international-big-tech', 'https://community.intel.com/t5/Blogs/Tech-Innovation/Artificial-Intelligence-AI/bg-p/blog-ai', 'blocked', [], '官方社区入口返回 403，无法完成正文级赛事核验；明确标为访问受阻而不是无赛事。'),
  coverage('amd', 'AMD Developer', 'international-big-tech', 'https://www.amd.com/en/developer/resources/events.html', 'covered', ['amddevmaster2026'], 'AMD 开发者活动入口连接不稳定，但 AMD AI DevMaster 官方合作页和报名页已交叉核验。'),
  coverage('qualcomm', 'Qualcomm Developer', 'international-big-tech', 'https://developer.qualcomm.com/events', 'partial', ['hackster'], 'Qualcomm 活动入口本次连接失败；已关联其与 Arduino/Hackster 的官方合作挑战，但覆盖不完整。'),
  coverage('salesforce', 'Salesforce Developers', 'international-big-tech', 'https://developer.salesforce.com/events', 'no-current-contest-found', [], 'Salesforce Developers Events 可达，本次未发现可核验的当前公开竞赛条目。'),
  coverage('adobe', 'Adobe Developers', 'international-big-tech', 'https://developer.adobe.com/events/', 'no-current-contest-found', [], 'Adobe Developers Events 可达，本次未发现可核验的当前公开竞赛条目。'),
  coverage('github', 'GitHub Events', 'international-big-tech', 'https://github.com/resources/events', 'no-current-contest-found', [], 'GitHub 官方 Events 页面可达，本次未发现作为主办方的当前公开竞赛总览。'),
  coverage('hugging-face', 'Hugging Face', 'international-big-tech', 'https://huggingface.co/events', 'blocked', [], '官方 Events 入口本次返回连接错误，无法完成正文级核验；不把受阻写成没有赛事。'),
  coverage('cloudflare', 'Cloudflare', 'international-big-tech', 'https://www.cloudflare.com/events/', 'no-current-contest-found', [], 'Cloudflare Events 官网可达，本次未发现可核验的当前公开竞赛条目。'),
  coverage('databricks', 'Databricks', 'international-big-tech', 'https://www.databricks.com/dataaisummit', 'partial', [], '原 hackathon 路径返回 404，Data + AI Summit 入口仍可达；未形成完整公开竞赛目录。'),
  coverage('google-cloud', 'Google Cloud', 'international-big-tech', 'https://cloud.google.com/events', 'covered', ['agenticcinema2026', 'geminixprize', 'sanren'], 'Google Cloud 官方活动入口连接不稳定；已用赛事官方页核验 Agentic Cinema、Gemini XPRIZE 与中国侧联动黑客松。'),

  // 官方赛事平台（8）
  coverage('kaggle', 'Kaggle', 'official-platform', 'https://www.kaggle.com/competitions', 'covered', ['autonomousagentbeta2026', 'kaggleagentsecurity2026', 'arcagi3_2026', 'arcagi2_2026', 'arcpaper2026', 'pokemonagent2026', 'biohubcell2026', 'solarfilament2026', 'kaggle-benchflow-skill-lift-2026', 'kaggle-kaggriculture-2026'], 'Kaggle Competitions 官方总览可达，关联站内当前及历史重点赛事；平台会持续新增。'),
  coverage('devpost', 'Devpost', 'official-platform', 'https://devpost.com/hackathons', 'covered', ['openatlas2026', 'shipaton2026', 'backblaze2026', 'armaiopt2026', 'devnetwork2026', 'ntuinnovatex2026', 'agenticcinema2026', 'youcamapi2026', 'datahubagent', 'acesatedu', 'geminixprize', 'cockroachagent', 'calle', 'volthacks-2026', 'gatewayhacks-2026', 'btt-web-game-jam-2026', 'reverie-hacks-2026'], 'Devpost 官方 Hackathons 总览返回 202 并可访问；关联已逐项核验的站内赛事，列表仍会动态变化。'),
  coverage('dorahacks', 'DoraHacks', 'official-platform', 'https://dorahacks.io/hackathon', 'partial', ['delphi-agent-arena-2026', 'weex-ai-wars2-2026', 'munichtech-innovation-2026', 'keeperhub-agents-onchain-2026', 'flare-summer-signal-2026'], '官方入口对简单请求返回 405，详情页可用；关联已核验赛事，但平台总览覆盖不完整。'),
  coverage('lablab-ai', 'lablab.ai', 'official-platform', 'https://lablab.ai/ai-hackathons', 'blocked', ['aiinfrasummit2026', 'aifactory2026', 'techex-amsterdam-hackathon-2026', 'ai-genesis-2026'], '官方总览返回 403；已通过各赛事详情保留关联记录，但不能宣称完成平台全量抓取。'),
  coverage('zindi', 'Zindi', 'official-platform', 'https://zindi.world/competitions', 'covered', ['waxalasr2026', 'geoaiagua2026', 'zindi-road-barbados-2026', 'zindi-bias-bounty-2026', 'zindi-drought-forecast-2026'], 'Zindi 官方竞赛总览可达并已重定向到 zindi.world；关联站内核验赛事。'),
  coverage('aicrowd', 'AIcrowd', 'official-platform', 'https://www.aicrowd.com/challenges', 'covered', ['arcwhitebox2026'], 'AIcrowd 官方 Challenges 总览可达，关联站内 ARC White-Box 赛事记录。'),
  coverage('drivendata', 'DrivenData', 'official-platform', 'https://www.drivendata.org/competitions/', 'covered', ['datparkinsons2026'], 'DrivenData 官方 Competitions 总览可达，关联站内 DaT 帕金森影像挑战。'),
  coverage('hackster', 'Hackster.io', 'official-platform', 'https://www.hackster.io/contests', 'covered', ['hackster', 'autodesk-au-2027-product'], 'Hackster 官方 Contests 总览可达，关联 Arduino UNO Q 与 Autodesk AU 产品设计挑战。'),
]);

if (competitionOfficialCoverage.length !== BIG_TECH_OFFICIAL_TARGET_COUNT) {
  throw new Error(`Official coverage ledger must contain ${BIG_TECH_OFFICIAL_TARGET_COUNT} entries`);
}

export default competitionOfficialCoverage;
