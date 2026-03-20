import { KnowledgeItem, CrossDomainInsight, DOMAINS } from './collaboration'

class KnowledgeStore {
  private knowledge: Map<string, KnowledgeItem[]> = new Map()
  private insights: CrossDomainInsight[] = []
  private weeklyReports: Map<string, string> = new Map()

  constructor() {
    DOMAINS.forEach((domain) => {
      this.knowledge.set(domain.id, [])
    })
    this.initializeSampleData()
  }

  private initializeSampleData() {
    const sampleKnowledge: Omit<KnowledgeItem, 'id' | 'timestamp' | 'verified'>[] = [
      {
        domainId: 'space',
        title: 'SpaceX 星舰最新进展',
        content: 'SpaceX 完成星舰第六次综合测试飞行，成功实现筷子捕获助推器。月球登陆计划加速推进。',
        source: 'SpaceX Official',
        tags: ['SpaceX', '星舰', '火箭回收'],
        type: 'news',
      },
      {
        domainId: 'longevity',
        title: 'Senolytics 药物新突破',
        content: '最新研究表明 combination senolytics 可以显著减少老化细胞负担，延长健康寿命约25%。',
        source: 'Nature Aging',
        tags: ['Senolytics', '抗衰老', '临床试验'],
        type: 'research',
      },
      {
        domainId: 'ai-safety',
        title: 'AI 对齐研究新方向',
        content: 'Constitutional AI 方法在大型语言模型中展现出更好的行为约束效果，减少有害输出。',
        source: 'Anthropic Research',
        tags: ['对齐', 'Constitutional AI', 'RLHF'],
        type: 'research',
      },
      {
        domainId: 'growth',
        title: '间隔重复法学习效率',
        content: '使用间隔重复法学习新知识，记忆保持率比传统方法提高约200%，适用于语言和专业技能学习。',
        source: 'Cognitive Science Journal',
        tags: ['学习方法', '记忆', '间隔重复'],
        type: 'research',
      },
    ]

    sampleKnowledge.forEach((item) => {
      this.addKnowledge(item as KnowledgeItem)
    })

    const sampleInsights: Omit<CrossDomainInsight, 'id' | 'timestamp'>[] = [
      {
        domains: ['space', 'longevity'],
        title: '太空任务中的健康维护技术',
        content: 'NASA 在长期太空任务中开发的健康监测和抗衰老技术，可应用于地面远程医疗和老年护理。',
        confidence: 0.85,
      },
      {
        domains: ['ai-safety', 'growth'],
        title: 'AI 辅助个性化学习',
        content: '利用 AI 安全研究成果开发个性化学习助手，根据学习者特点调整内容难度和节奏。',
        confidence: 0.9,
      },
    ]

    sampleInsights.forEach((insight) => {
      this.addInsight(insight as CrossDomainInsight)
    })
  }

  getKnowledge(domainId: string): KnowledgeItem[] {
    return this.knowledge.get(domainId) || []
  }

  getAllKnowledge(): Map<string, KnowledgeItem[]> {
    return this.knowledge
  }

  addKnowledge(item: KnowledgeItem): void {
    const domainKnowledge = this.knowledge.get(item.domainId) || []
    domainKnowledge.unshift(item)
    this.knowledge.set(item.domainId, domainKnowledge)
  }

  verifyKnowledge(itemId: string, domainId: string): boolean {
    const domainKnowledge = this.knowledge.get(domainId) || []
    const item = domainKnowledge.find((k) => k.id === itemId)
    if (item) {
      item.verified = true
      return true
    }
    return false
  }

  getInsights(): CrossDomainInsight[] {
    return this.insights
  }

  getInsightsByDomain(domainId: string): CrossDomainInsight[] {
    return this.insights.filter((insight) => insight.domains.includes(domainId))
  }

  addInsight(insight: CrossDomainInsight): void {
    this.insights.unshift(insight)
  }

  getWeeklyReport(domainId: string): string | null {
    return this.weeklyReports.get(domainId) || null
  }

  setWeeklyReport(domainId: string, report: string): void {
    this.weeklyReports.set(domainId, report)
  }

  getCrossDomainConnections(domainId: string): { domain: string; insightCount: number }[] {
    const connections: { domain: string; insightCount: number }[] = []
    DOMAINS.forEach((domain) => {
      if (domain.id !== domainId) {
        const insights = this.insights.filter(
          (i) => i.domains.includes(domainId) && i.domains.includes(domain.id)
        )
        connections.push({ domain: domain.id, insightCount: insights.length })
      }
    })
    return connections
  }
}

export const knowledgeStore = new KnowledgeStore()