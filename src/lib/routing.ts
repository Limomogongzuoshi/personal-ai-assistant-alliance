import { DOMAINS } from './collaboration'

export interface RoutingResult {
  primaryDomain: string
  confidence: number
  secondaryDomains: string[]
  reasoning: string
  suggestedKeywords: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  domain?: string
  content: string
  timestamp: number
}

interface DomainKeywords {
  [key: string]: {
    keywords: string[]
    relatedTerms: string[]
    examples: string[]
  }
}

const DOMAIN_KEYWORDS: DomainKeywords = {
  space: {
    keywords: [
      '太空', '航天', '宇宙', '星星', '月亮', '太阳', '火星', '卫星', '火箭',
      'SpaceX', 'NASA', 'Space', 'rocket', 'satellite', 'mars', 'astronaut',
      '星系', '银河', '黑洞', '彗星', '小行星', '航天器', '发射', '轨道',
      '深空', '星际', 'Space', 'Orbit', 'Launch'
    ],
    relatedTerms: ['卫星', '火箭', '探测器', '空间站', '月球', '行星'],
    examples: [
      'SpaceX的星舰什么时候能登月？',
      '火星上能不能种土豆？',
      '宇宙里有没有外星人？',
      '火箭是怎么发射的？'
    ]
  },
  longevity: {
    keywords: [
      '长寿', '衰老', '抗老', '健康', '养生', '寿命', '基因', '细胞',
      'Longevity', 'aging', 'health', 'longevity', 'anti-aging',
      'NMN', '白藜芦醇', '端粒', 'Senolytics', '干细胞', '再生',
      '运动', '饮食', '睡眠', '冥想', '营养', '补充剂'
    ],
    relatedTerms: ['健康', '医疗', '生物', '医学', '保健'],
    examples: [
      '有什么抗衰老的好方法？',
      'NMN补充剂真的有效吗？',
      '如何延长寿命？',
      '间歇性禁食有什么好处？'
    ]
  },
  'ai-safety': {
    keywords: [
      'AI安全', '人工智能安全', 'AI对齐', 'AI风险', 'AI伦理',
      'AI safety', 'alignment', 'AI risk', 'AI ethics', 'AGI',
      'AI可控', 'AI治理', '可解释AI', 'AI监管', 'AI失控',
      'Constitutional AI', 'RLHF', 'AI安全研究'
    ],
    relatedTerms: ['AI', '人工智能', '机器学习', '深度学习', '神经网络'],
    examples: [
      'AI会不会取代人类？',
      '如何确保AI安全可控？',
      'AI对齐是什么意思？',
      'AI会不会产生意识？'
    ]
  },
  growth: {
    keywords: [
      '学习', '成长', '提升', '效率', '习惯', '技能', '思维',
      'Learning', 'growth', 'productivity', 'habit', 'skill', 'mindset',
      '时间管理', '目标', '专注', '记忆', '阅读', '写作',
      '元学习', '刻意练习', '费曼技巧', '知识管理'
    ],
    relatedTerms: ['教育', '培训', '职业', '发展', '自我提升'],
    examples: [
      '如何高效学习新技能？',
      '怎样改掉拖延症？',
      '时间管理有什么好方法？',
      '如何培养好习惯？'
    ]
  }
}

function calculateKeywordScore(text: string, domain: string): number {
  const domainData = DOMAIN_KEYWORDS[domain]
  if (!domainData) return 0

  const lowerText = text.toLowerCase()
  let score = 0

  for (const keyword of domainData.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 1
      if (keyword.length > 3) score += 0.5
    }
  }

  return score
}

function findBestMatch(text: string): { domain: string; score: number } {
  const scores: { domain: string; score: number }[] = []

  for (const domain of Object.keys(DOMAIN_KEYWORDS)) {
    const score = calculateKeywordScore(text, domain)
    scores.push({ domain, score })
  }

  scores.sort((a, b) => b.score - a.score)
  return scores[0]
}

function getSecondaryDomains(text: string, primaryDomain: string): string[] {
  const scores: { domain: string; score: number }[] = []

  for (const domain of Object.keys(DOMAIN_KEYWORDS)) {
    if (domain !== primaryDomain) {
      const score = calculateKeywordScore(text, domain)
      scores.push({ domain, score })
    }
  }

  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(s => s.domain)
}

function generateReasoning(text: string, primaryDomain: string, confidence: number): string {
  const domain = DOMAINS.find(d => d.id === primaryDomain)
  const matchedKeywords = DOMAIN_KEYWORDS[primaryDomain]?.keywords.filter(k =>
    text.toLowerCase().includes(k.toLowerCase())
  ) || []

  if (confidence > 0.8) {
    return `问题与"${domain?.name}"领域高度匹配，检测到关键词：${matchedKeywords.slice(0, 3).join('、')}`
  } else if (confidence > 0.5) {
    return `问题可能涉及"${domain?.name}"领域，建议由${domain?.icon}助手处理`
  } else {
    return `问题分类不确定，建议使用通用助手回答`
  }
}

export function routeQuestion(question: string): RoutingResult {
  const bestMatch = findBestMatch(question)

  if (bestMatch.score === 0) {
    return {
      primaryDomain: 'growth',
      confidence: 0.3,
      secondaryDomains: [],
      reasoning: '未检测到特定领域关键词，使用通用助手',
      suggestedKeywords: []
    }
  }

  const domain = DOMAINS.find(d => d.id === bestMatch.domain)
  const totalPossibleScore = domain ? DOMAIN_KEYWORDS[bestMatch.domain].keywords.length * 1.5 : 1
  const confidence = Math.min(1, bestMatch.score / totalPossibleScore + 0.3)

  const secondaryDomains = getSecondaryDomains(question, bestMatch.domain)

  return {
    primaryDomain: bestMatch.domain,
    confidence,
    secondaryDomains,
    reasoning: generateReasoning(question, bestMatch.domain, confidence),
    suggestedKeywords: DOMAIN_KEYWORDS[bestMatch.domain]?.examples || []
  }
}

export function getDomainInfo(domainId: string) {
  return {
    domain: DOMAINS.find(d => d.id === domainId),
    keywords: DOMAIN_KEYWORDS[domainId]
  }
}

export function getAllDomains() {
  return DOMAINS.map(d => ({
    ...d,
    keywords: DOMAIN_KEYWORDS[d.id]
  }))
}

export function getSuggestedQuestions(domainId: string): string[] {
  return DOMAIN_KEYWORDS[domainId]?.examples || []
}