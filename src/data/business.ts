export type ServiceId =
  | 'voice-agent'
  | 'automation-workflow'
  | 'content-system'
  | 'internal-tools';

export type WorkflowId = 'outbound-followup' | 'content-distribution' | 'operations-dashboard';

export interface ServiceOffer {
  id: ServiceId;
  number: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  summary: string;
  inputs: string[];
  deliverables: string[];
  humanFallback: string;
  fit: string[];
  notFit: string[];
}

export interface WorkflowStage {
  title: string;
  description: string;
  output: string;
}

export interface BusinessWorkflow {
  id: WorkflowId;
  number: string;
  eyebrow: string;
  title: string;
  summary: string;
  entryCondition: string;
  inputs: string[];
  stages: WorkflowStage[];
  deliverables: string[];
  humanFallback: string;
  fit: string[];
  notFit: string[];
  relatedServices: ServiceId[];
}

/**
 * 当前公开讨论的业务支撑范围。
 * 文案刻意只描述可讨论的流程、交付物和边界，不把潜在效果写成既成结果。
 */
export const services: ServiceOffer[] = [
  {
    id: 'voice-agent',
    number: '01',
    eyebrow: 'VOICE AGENT / OUTBOUND',
    title: 'AI 语音客服与外呼',
    shortTitle: 'AI 外呼 / 客服',
    summary:
      '把重复的通知、回访、初步咨询或线索确认，整理成可审核的语音流程。重点不是“替掉所有人”，而是让每一通电话有明确目的、记录和后续去向。',
    inputs: [
      '目标人群、触达时段与可用的联系人数据边界',
      '现有话术、常见问题与不能承诺的内容',
      '业务系统、结果标签与人工接管规则',
      '一位能持续确认业务判断的负责人'
    ],
    deliverables: [
      '可审核的对话路径、知识与话术版本',
      '场景配置、触达任务与测试清单',
      '通话记录、结果标签与人工跟进清单',
      '上线后的复盘项与下一轮调整依据'
    ],
    humanFallback:
      '投诉、特殊承诺、身份核验、价格或政策解释，以及无法可靠判断的意图，都应转交人工处理；系统保留记录，不替人做高风险判断。',
    fit: [
      '已有稳定的外呼、回访或客服重复场景',
      '名单来源、触达目的和业务边界可以说明白',
      '愿意先小范围测试，并安排人看结果与改话术'
    ],
    notFit: [
      '联系人数据来源或合规边界不清楚',
      '希望用机器人规避监管、投诉或人工责任',
      '没有接管规则，却要求一开始就大规模触达'
    ]
  },
  {
    id: 'automation-workflow',
    number: '02',
    eyebrow: 'PROCESS AUTOMATION',
    title: '企业流程自动化',
    shortTitle: '流程自动化',
    summary:
      '把跨表、通知、检查、分配和归档这些反复发生的动作，拆成可追溯的流程。先画清楚人、数据和例外，再决定哪些节点值得自动化。',
    inputs: [
      '现有流程、参与角色与真实的卡点例子',
      '已有表单、表格、系统权限与数据字段',
      '必须人工审批、确认或回退的节点',
      '流程负责人和异常事项的处理归属'
    ],
    deliverables: [
      '现状与目标流程图、责任边界和字段说明',
      '表单、提醒、流转或同步规则的配置方案',
      '异常处理、失败提示与人工接管约定',
      '交接说明与可持续维护的修改入口'
    ],
    humanFallback:
      '涉及付款、对外承诺、权限变更、资料缺失或规则冲突时，流程应停在可见的人工节点；自动化负责把问题送到人面前，不在后台悄悄替人决定。',
    fit: [
      '重复动作多、规则相对稳定、责任人明确',
      '跨工具搬运信息、提醒、核对或归档占用时间',
      '可以从一条具体流程开始，而不是一次替换全部系统'
    ],
    notFit: [
      '流程每天变化，且没有业务负责人可以拍板',
      '希望 AI 自行解释制度、承担审批或风险决策',
      '要直接替代核心 ERP、CRM 或复杂权限系统'
    ]
  },
  {
    id: 'content-system',
    number: '03',
    eyebrow: 'CONTENT SYSTEM',
    title: 'AI 内容生产与分发',
    shortTitle: '内容生产 / 分发',
    summary:
      '把已有的业务材料、观点和案例，整理为一条可复用的内容生产路径：选题、成稿、审核、改写、分发和回收。AI 可以提速，但事实、观点和发布责任仍由人掌握。',
    inputs: [
      '目标受众、业务目标与品牌表达边界',
      '已有资料：访谈、案例、产品信息或一手记录',
      '发布渠道、节奏与每个渠道的审核要求',
      '能确认事实、观点与最终发布的人'
    ],
    deliverables: [
      '选题、资料、成稿与审核的协作模板',
      '适配不同渠道的改写与分发检查清单',
      '可追溯的素材来源、待确认事项和版本规则',
      '便于复盘的内容台账，而不是一次性的提示词包'
    ],
    humanFallback:
      '事实核查、行业判断、敏感表述、品牌口吻和最终发布必须由人确认；AI 草稿不能替代对来源和立场的负责。',
    fit: [
      '已经有真实业务材料，却难以稳定产出和复用',
      '需要一套适合团队协作的内容节奏与审核点',
      '愿意先沉淀素材和判断，再讨论批量生产'
    ],
    notFit: [
      '只想无来源批量追热点，且不安排审核',
      '要求保证流量、转化或“爆款”结果',
      '品牌定位和可公开信息尚未确定'
    ]
  },
  {
    id: 'internal-tools',
    number: '04',
    eyebrow: 'LIGHTWEIGHT INTERNAL TOOLS',
    title: '轻量内部工具',
    shortTitle: '轻量内部工具',
    summary:
      '为一个明确、重复、当前靠手工完成的小动作做一个可用入口：少复制、少查找、少漏项。先用轻工具验证真实使用，再决定是否值得进入更重的系统。',
    inputs: [
      '一个高频、具体的工作动作和当前处理方式',
      '输入字段、判断规则、示例数据与错误情况',
      '已有表格、接口或数据来源的可用范围',
      '实际使用者、权限边界和维护负责人'
    ],
    deliverables: [
      '围绕单一任务的轻量工具原型与操作界面',
      '输入、输出、异常提示与必要的人工确认点',
      '使用说明、反馈入口与后续迭代清单',
      '是否应继续产品化的判断依据'
    ],
    humanFallback:
      '涉及关键数据修改、对外发送或不可逆操作时，工具应提供复核、取消或人工确认；它不应成为没有记录和权限控制的“影子系统”。',
    fit: [
      '一个任务足够稳定，且每天/每周都在重复发生',
      '想先验证真实使用，而不是一次做完整平台',
      '能给出清楚的输入、输出和错误边界'
    ],
    notFit: [
      '需要直接替代核心数据系统或复杂的多角色权限',
      '面向大量外部用户，却没有产品与支持安排',
      '业务规则尚未形成，先希望工具替自己想清楚'
    ]
  }
];

export const workflows: BusinessWorkflow[] = [
  {
    id: 'outbound-followup',
    number: '01',
    eyebrow: 'VOICE / FOLLOW-UP LOOP',
    title: 'AI 外呼 / 回访',
    summary:
      '把一次触达变成一个可复盘的闭环：先确认要问什么、哪些不能说、谁接手，再让系统处理重复沟通与记录。',
    entryCondition: '名单来源合规、触达目的明确，并且有人负责查看结果和跟进异常。',
    inputs: ['触达名单与可用字段', '通话目标与话术素材', '结果标签和人工接管条件', '跟进人员与处理时限'],
    stages: [
      {
        title: '定义一次通话的判断题',
        description: '先写清楚这通电话要确认什么，不把所有问答都塞给机器人。',
        output: '触达目标、可问范围与禁区'
      },
      {
        title: '整理话术、知识与转人工条件',
        description: '把能直接回答、需要核实、必须转人的内容分开。',
        output: '可审核的话术与接管规则'
      },
      {
        title: '小范围执行并看记录',
        description: '根据真实对话检查标签、误解点和未覆盖问题，再调整流程。',
        output: '记录、待修订项与复盘依据'
      },
      {
        title: '由人工处理后续事项',
        description: '系统把可跟进事项排好，业务人员处理咨询、投诉和特殊情况。',
        output: '人工跟进清单与闭环状态'
      }
    ],
    deliverables: ['可审阅的通话路径和话术版本', '结果标签与通话记录结构', '人工回访/升级处理清单', '下一轮复盘问题'],
    humanFallback:
      '投诉、身份核验、报价承诺、政策解释、特殊诉求或语义不清，都应进入人工队列。',
    fit: ['有重复的通知、回访、咨询确认任务', '愿意先小范围校准流程', '有人负责处理跟进清单'],
    notFit: ['联系人来源、同意机制或合规边界不清楚', '希望系统绕开人工责任', '没有明确的通话目标'],
    relatedServices: ['voice-agent']
  },
  {
    id: 'content-distribution',
    number: '02',
    eyebrow: 'CONTENT / DISTRIBUTION LOOP',
    title: '内容生产 / 分发',
    summary:
      '不是让 AI 从空白处连续生成，而是把一手材料和业务判断做成可复用的内容流水线，并给每次发布保留人工核验点。',
    entryCondition: '已有可核对的业务材料，且有人对事实、表达和最终发布负责。',
    inputs: ['受众与内容目标', '一手资料、案例或访谈记录', '品牌边界与可公开信息', '渠道规则与审核责任人'],
    stages: [
      {
        title: '建立选题与素材台账',
        description: '先标注已有材料、待求证事项和适合表达的角度。',
        output: '可追溯的选题与资料库'
      },
      {
        title: '形成可审核的初稿',
        description: '让 AI 协助结构、改写和版本整理，不把未核实的内容当作事实。',
        output: '带来源和待确认项的草稿'
      },
      {
        title: '人工核验与渠道适配',
        description: '确认事实、语气、敏感表达和每个渠道的呈现方式。',
        output: '可发布版本与审核记录'
      },
      {
        title: '分发、回收与再利用',
        description: '按节奏发布，回收问题和反馈，为下一次内容提供材料。',
        output: '分发清单与可复用片段'
      }
    ],
    deliverables: ['选题—素材—草稿—审核的协作模板', '渠道改写与分发检查清单', '内容版本、来源和待确认项台账', '下一轮内容复用规则'],
    humanFallback:
      '事实核验、行业结论、敏感表达、品牌判断和发布动作由人确认，不把“生成完成”视作“可以发布”。',
    fit: ['有真实材料但产出节奏不稳定', '需要多人协作且不想靠口头交接', '愿意把来源和审核纳入流程'],
    notFit: ['希望无来源批量发布', '要求保证爆款或转化', '品牌和可公开范围尚未确定'],
    relatedServices: ['content-system']
  },
  {
    id: 'operations-dashboard',
    number: '03',
    eyebrow: 'OPERATIONS / DASHBOARD LOOP',
    title: '业务流程 / 看板',
    summary:
      '从一条真正卡人的业务链路开始，把数据、提醒、责任人和异常处理放到同一张可追溯的工作台上。',
    entryCondition: '流程有明确负责人、输入输出相对稳定，并愿意先梳理例外情况。',
    inputs: ['当前流程与具体卡点', '表单、表格或系统中的关键字段', '每个节点的责任人和时限', '需要被看见的异常和人工审批点'],
    stages: [
      {
        title: '画出当前流程和责任链',
        description: '识别重复输入、等待、漏提醒和无人接手的节点。',
        output: '现状流程图与问题清单'
      },
      {
        title: '确定字段、看板和自动动作',
        description: '只自动化规则清楚的环节，同时保留人工审批和回退。',
        output: '字段说明、看板结构与规则'
      },
      {
        title: '运行并暴露异常',
        description: '通过提示、状态与失败记录，让异常显性化，而不是被隐藏。',
        output: '异常队列与处理入口'
      },
      {
        title: '按固定节奏复盘',
        description: '由负责人检查积压、反复失败和规则变化，决定是否调整。',
        output: '迭代项与维护责任'
      }
    ],
    deliverables: ['流程与责任边界说明', '看板/台账字段和状态结构', '自动提醒或流转的规则与异常入口', '维护与复盘清单'],
    humanFallback:
      '付款、审批、权限、规则冲突和资料缺失等节点必须让负责人看见并确认，系统只辅助流转和提醒。',
    fit: ['重复流转、核对、同步和提醒占用时间', '有一个能负责流程的人', '愿意从最具体的一条链路开始'],
    notFit: ['没有流程负责人或数据归属', '要一次替换企业级核心系统', '希望自动化绕过审批和风控'],
    relatedServices: ['automation-workflow', 'internal-tools']
  }
];

export const businessContact = {
  email: 'hi@siuserxiaowei.com',
  briefChecklist: ['想解决的重复动作或业务问题', '目前怎么做、哪里最容易卡住', '已有的数据、系统和权限边界', '谁来确认业务判断与处理例外']
};

export const servicesById = Object.fromEntries(services.map((service) => [service.id, service])) as Record<
  ServiceId,
  ServiceOffer
>;
