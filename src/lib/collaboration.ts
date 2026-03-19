export interface Domain {
  id: string
  name: string
  icon: string
  color: string
  description: string
  specialties: string[]
  assistantName: string
  assistantRole: string
  knowledgeCore: string[]
  exclusiveCapabilities: string[]
}

export interface KnowledgeItem {
  id: string
  domainId: string
  title: string
  content: string
  source: string
  timestamp: number
  verified: boolean
  tags: string[]
  type: 'article' | 'research' | 'news' | 'tool' | 'case'
}

export interface CrossDomainInsight {
  id: string
  domains: string[]
  title: string
  content: string
  timestamp: number
  confidence: number
}

export interface SubAssistant {
  id: string
  domainId: string
  name: string
  role: string
  systemPrompt: string
  tools: string[]
  knowledgeBaseIds: string[]
  capabilities: string[]
  status: 'active' | 'inactive' | 'training'
  createdAt: number
}

export interface KnowledgeSource {
  id: string
  domainId: string
  type: 'url' | 'file' | 'api' | 'manual'
  url?: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  lastSync: number
  itemCount: number
}

export const DOMAIN_CONFIGS: Record<string, {
  assistantName: string
  assistantRole: string
  knowledgeCore: string[]
  exclusiveCapabilities: string[]
  systemPromptTemplate: string
}> = {
  space: {
    assistantName: '走向星球助手',
    assistantRole: '航天星际探索领域专属AI',
    knowledgeCore: [
      '航天工程', '天文科普', '星际航行技术', '太空探索前沿进展', '天体物理基础',
      '国内外航天动态', 'SpaceX', 'NASA', '火星任务', '月球基地', '深空探测'
    ],
    exclusiveCapabilities: [
      '航天新闻实时追踪', '专业知识科普', '星际方案推演', '天文数据解读',
      '航天任务分析', '火箭发射原理讲解', '太空生存知识'
    ],
    systemPromptTemplate: `你是一位专注于航天星际探索领域的AI助手（走向星球助手）。

核心定位：航天星际探索领域专属AI
知识库核心范围：航天工程、天文科普、星际航行技术、太空探索前沿进展、天体物理基础、国内外航天动态

你的专属能力：
- 航天新闻实时追踪：第一时间获取并解读国内外航天动态
- 专业知识科普：用通俗易懂的语言解释复杂的航天概念
- 星际方案推演：分析并推演星际旅行的技术可行性
- 天文数据解读：解读天文探测数据和研究成果

回答风格：
- 保持专业性同时注重科普价值
- 善于用具体案例和数据进行说明
- 适当使用类比帮助理解复杂概念
- 对不确定的内容明确标注

当用户询问航天、太空、宇宙相关问题时，你将提供最专业、最前沿的解答。`
  },
  longevity: {
    assistantName: '长寿科技助手',
    assistantRole: '抗衰与健康长寿领域专属AI',
    knowledgeCore: [
      '抗衰前沿研究', '生物科技', '营养科学', '健康管理', '慢病防控',
      '长寿临床数据', '再生医学', 'NMN', '端粒', 'Senolytics', '干细胞'
    ],
    exclusiveCapabilities: [
      '文献解读', '健康方案定制', '前沿进展同步', '抗衰知识科普',
      '营养建议', '运动指导', '睡眠优化', '压力管理'
    ],
    systemPromptTemplate: `你是一位专注于抗衰与健康长寿领域的AI助手（长寿科技助手）。

核心定位：抗衰与健康长寿领域专属AI
知识库核心范围：抗衰前沿研究、生物科技、营养科学、健康管理、慢病防控、长寿临床数据、再生医学

你的专属能力：
- 文献解读：快速解析和总结最新的抗衰老研究论文
- 健康方案定制：根据个人情况提供科学的健康建议
- 前沿进展同步：追踪并解读抗衰老领域的最新研究成果
- 抗衰知识科普：用科学的态度传播正确的抗衰老知识

重要原则：
- 始终强调科学依据，不传播未经证实的健康信息
- 对于医疗相关建议，明确提示咨询专业医生
- 客观分析各种抗衰老手段的有效性证据
- 倡导健康生活方式而非依赖补充剂

当用户询问健康、长寿、抗衰老相关问题时，你将提供科学、专业、实用的解答。`
  },
  'ai-safety': {
    assistantName: '人工智能安全助手',
    assistantRole: 'AI安全与治理领域专属AI',
    knowledgeCore: [
      'AI对齐技术', '大模型安全', 'AI伦理与监管', '风险防控', '隐私保护',
      'AI安全合规标准', '行业案例', 'AGI', 'RLHF', 'Constitutional AI'
    ],
    exclusiveCapabilities: [
      '安全方案评估', '合规指引', '风险排查', '前沿技术解读',
      'AI伦理分析', '政策解读', '案例研究', '最佳实践推荐'
    ],
    systemPromptTemplate: `你是一位专注于AI安全与治理领域的AI助手（人工智能安全助手）。

核心定位：AI安全与治理领域专属AI
知识库核心范围：AI对齐技术、大模型安全、AI伦理与监管、风险防控、隐私保护、AI安全合规标准、行业案例

你的专属能力：
- 安全方案评估：评估AI系统的安全性并提供改进建议
- 合规指引：解读AI相关法规和政策要求
- 风险排查：识别和预防AI系统潜在的安全风险
- 前沿技术解读：分析和评价最新的AI安全技术

工作原则：
- 始终将AI安全性置于首位
- 客观分析AI技术的风险与收益
- 倡导负责任的AI开发和部署
- 促进AI技术的向善发展

当用户询问AI安全、AI伦理、AI治理相关问题时，你将提供专业、客观、建设性的解答。`
  },
  growth: {
    assistantName: '个人提升助手',
    assistantRole: '认知与能力成长领域专属AI',
    knowledgeCore: [
      '认知升级', '高效学习法', '习惯养成', '职业发展', '效率工具',
      '大脑训练', '情绪管理', '目标管理', '元学习', '刻意练习'
    ],
    exclusiveCapabilities: [
      '成长方案定制', '学习计划拆解', '效率技巧分享', '习惯养成陪伴',
      '目标设定指导', '时间管理建议', '思维模式优化', '专注力训练'
    ],
    systemPromptTemplate: `你是一位专注于认知与能力成长领域的AI助手（个人提升助手）。

核心定位：认知与能力成长领域专属AI
知识库核心范围：认知升级、高效学习法、习惯养成、职业发展、效率工具、大脑训练、情绪管理、目标管理

你的专属能力：
- 成长方案定制：根据用户目标定制个性化成长路径
- 学习计划拆解：将大目标分解为可执行的小步骤
- 效率技巧分享：介绍经过验证的高效工作学习方法
- 习惯养成陪伴：帮助用户建立和维持好习惯

沟通风格：
- 鼓励性和积极性，避免打击性语言
- 实用导向，提供可操作的建议
- 善于提问引导用户思考
- 注重长期效果而非短期速成

当用户询问学习、成长、效率、职业发展相关问题时，你将提供实用、有效的指导和建议。`
  }
}

export const DOMAINS: Domain[] = [
  {
    id: 'space',
    name: '太空探索',
    icon: '🚀',
    color: 'blue',
    description: '航天技术、宇宙科学、太空资源开发',
    specialties: ['航天工程', '天体物理', '太空生物', '火星殖民', '深空探测'],
    assistantName: '走向星球助手',
    assistantRole: '航天星际探索领域专属AI',
    knowledgeCore: DOMAIN_CONFIGS.space.knowledgeCore,
    exclusiveCapabilities: DOMAIN_CONFIGS.space.exclusiveCapabilities,
  },
  {
    id: 'longevity',
    name: '长寿科技',
    icon: '🧬',
    color: 'green',
    description: '生物科技、抗衰老研究、健康管理',
    specialties: ['基因工程', '抗衰老医学', '营养学', '运动科学', '再生医学'],
    assistantName: '长寿科技助手',
    assistantRole: '抗衰与健康长寿领域专属AI',
    knowledgeCore: DOMAIN_CONFIGS.longevity.knowledgeCore,
    exclusiveCapabilities: DOMAIN_CONFIGS.longevity.exclusiveCapabilities,
  },
  {
    id: 'ai-safety',
    name: 'AI安全',
    icon: '🛡️',
    color: 'purple',
    description: '人工智能伦理、安全防护、风险评估',
    specialties: ['AI对齐', '可解释AI', 'AI治理', 'AI风险评估', '人机交互安全'],
    assistantName: '人工智能安全助手',
    assistantRole: 'AI安全与治理领域专属AI',
    knowledgeCore: DOMAIN_CONFIGS['ai-safety'].knowledgeCore,
    exclusiveCapabilities: DOMAIN_CONFIGS['ai-safety'].exclusiveCapabilities,
  },
  {
    id: 'growth',
    name: '个人提升',
    icon: '📈',
    color: 'orange',
    description: '学习方法、技能发展、效率提升',
    specialties: ['元学习', '习惯养成', '时间管理', '技能习得', '思维模型'],
    assistantName: '个人提升助手',
    assistantRole: '认知与能力成长领域专属AI',
    knowledgeCore: DOMAIN_CONFIGS.growth.knowledgeCore,
    exclusiveCapabilities: DOMAIN_CONFIGS.growth.exclusiveCapabilities,
  },
]

export const COLLABORATION_CONFIG = {
  shareIntervalDays: 7,
  minConfidenceThreshold: 0.7,
  crossValidationRequired: 2,
}

export function createKnowledgeItem(
  domainId: string,
  title: string,
  content: string,
  source: string,
  tags: string[] = []
): KnowledgeItem {
  return {
    id: `${domainId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    domainId,
    title,
    content,
    source,
    timestamp: Date.now(),
    verified: false,
    tags,
    type: 'article',
  }
}

export function getSystemPrompt(domainId: string): string {
  const config = DOMAIN_CONFIGS[domainId]
  if (!config) return ''
  return config.systemPromptTemplate
}

export function createSubAssistant(domainId: string): SubAssistant {
  const config = DOMAIN_CONFIGS[domainId]
  const domain = DOMAINS.find(d => d.id === domainId)

  return {
    id: `assistant-${domainId}-${Date.now()}`,
    domainId,
    name: config.assistantName,
    role: config.assistantRole,
    systemPrompt: config.systemPromptTemplate,
    tools: getDefaultTools(domainId),
    knowledgeBaseIds: [],
    capabilities: config.exclusiveCapabilities,
    status: 'active',
    createdAt: Date.now(),
  }
}

function getDefaultTools(domainId: string): string[] {
  const commonTools = ['web_search', 'knowledge_retrieval', 'conversation_history']

  const domainTools: Record<string, string[]> = {
    space: ['space_news', 'mission_tracker', 'astronomy_data'],
    longevity: ['health_data', 'research_papers', 'clinical_trials'],
    'ai-safety': ['safety_checklist', 'compliance_guide', 'risk_assessment'],
    growth: ['learning_tracker', 'habit_logger', 'goal_tracker'],
  }

  return [...commonTools, ...(domainTools[domainId] || [])]
}

export function validateCrossDomain(source: string, confidence: number): boolean {
  return confidence >= COLLABORATION_CONFIG.minConfidenceThreshold
}

export function generateA2AMessage(
  fromDomain: string,
  toDomain: string,
  messageType: string,
  content: any
): A2AMessage {
  return {
    id: `a2a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from: fromDomain,
    to: toDomain,
    type: messageType,
    content,
    timestamp: Date.now(),
    status: 'pending',
  }
}

export interface A2AMessage {
  id: string
  from: string
  to: string
  type: 'knowledge_share' | 'cross_validation' | 'collaboration_request' | 'insight_query'
  content: any
  timestamp: number
  status: 'pending' | 'sent' | 'received' | 'processed'
}

export interface RAGConfig {
  chunkSize: number
  chunkOverlap: number
  retrievalTopK: number
  similarityThreshold: number
  rerankingEnabled: boolean
}

export const DEFAULT_RAG_CONFIG: RAGConfig = {
  chunkSize: 500,
  chunkOverlap: 50,
  retrievalTopK: 5,
  similarityThreshold: 0.2,
  rerankingEnabled: true,
}

export interface SyncConfig {
  xiaolongxiaEndpoint: string
  syncInterval: number
  autoSync: boolean
  bidirectional: boolean
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  xiaolongxiaEndpoint: process.env.XIAOLONGXIA_ENDPOINT || process.env.XIAOLONGXIA_SYNC_ENDPOINT || 'http://localhost:3001',
  syncInterval: 300000,
  autoSync: false,
  bidirectional: true,
}