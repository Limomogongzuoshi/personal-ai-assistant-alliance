import { KnowledgeItem, KnowledgeSource, SubAssistant, DOMAINS, DEFAULT_RAG_CONFIG, DEFAULT_SYNC_CONFIG, type RAGConfig, type SyncConfig } from './collaboration'

export class KnowledgeBaseManager {
  private knowledgeStore: Map<string, KnowledgeItem[]> = new Map()
  private sourceStore: Map<string, KnowledgeSource[]> = new Map()
  private assistantStore: Map<string, SubAssistant> = new Map()
  private ragConfig: RAGConfig = DEFAULT_RAG_CONFIG
  private syncConfig: SyncConfig = DEFAULT_SYNC_CONFIG

  constructor() {
    this.initializeStores()
  }

  private initializeStores() {
    DOMAINS.forEach(domain => {
      this.knowledgeStore.set(domain.id, [])
      this.sourceStore.set(domain.id, [])
    })
  }

  async addKnowledgeItem(domainId: string, item: Omit<KnowledgeItem, 'id' | 'timestamp' | 'verified' | 'domainId'>): Promise<KnowledgeItem> {
    const knowledge = this.knowledgeStore.get(domainId) || []
    const newItem: KnowledgeItem = {
      ...item,
      domainId,
      id: `${domainId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      verified: false,
    }
    knowledge.push(newItem)
    this.knowledgeStore.set(domainId, knowledge)
    return newItem
  }

  async getKnowledgeItems(domainId: string, filters?: {
    verified?: boolean
    type?: KnowledgeItem['type']
    tags?: string[]
  }): Promise<KnowledgeItem[]> {
    let items = this.knowledgeStore.get(domainId) || []

    if (filters) {
      if (filters.verified !== undefined) {
        items = items.filter(item => item.verified === filters.verified)
      }
      if (filters.type) {
        items = items.filter(item => item.type === filters.type)
      }
      if (filters.tags && filters.tags.length > 0) {
        items = items.filter(item =>
          filters.tags!.some(tag => item.tags.includes(tag))
        )
      }
    }

    return items.sort((a, b) => b.timestamp - a.timestamp)
  }

  async verifyKnowledgeItem(domainId: string, itemId: string): Promise<boolean> {
    const knowledge = this.knowledgeStore.get(domainId) || []
    const item = knowledge.find(k => k.id === itemId)
    if (item) {
      item.verified = true
      return true
    }
    return false
  }

  async deleteKnowledgeItem(domainId: string, itemId: string): Promise<boolean> {
    const knowledge = this.knowledgeStore.get(domainId) || []
    const index = knowledge.findIndex(k => k.id === itemId)
    if (index > -1) {
      knowledge.splice(index, 1)
      this.knowledgeStore.set(domainId, knowledge)
      return true
    }
    return false
  }

  async addKnowledgeSource(domainId: string, source: Omit<KnowledgeSource, 'id' | 'status' | 'lastSync' | 'itemCount'>): Promise<KnowledgeSource> {
    const sources = this.sourceStore.get(domainId) || []
    const newSource: KnowledgeSource = {
      ...source,
      id: `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      lastSync: 0,
      itemCount: 0,
    }
    sources.push(newSource)
    this.sourceStore.set(domainId, sources)
    return newSource
  }

  async getKnowledgeSources(domainId: string): Promise<KnowledgeSource[]> {
    return this.sourceStore.get(domainId) || []
  }

  async syncSource(domainId: string, sourceId: string): Promise<{ success: boolean; itemsAdded: number }> {
    const sources = this.sourceStore.get(domainId) || []
    const source = sources.find(s => s.id === sourceId)

    if (!source) {
      return { success: false, itemsAdded: 0 }
    }

    source.status = 'processing'

    try {
      const items = await this.fetchFromSource(source)
      for (const item of items) {
        await this.addKnowledgeItem(domainId, item)
      }

      source.status = 'completed'
      source.lastSync = Date.now()
      source.itemCount = items.length

      return { success: true, itemsAdded: items.length }
    } catch (error) {
      source.status = 'failed'
      return { success: false, itemsAdded: 0 }
    }
  }

  private async fetchFromSource(source: KnowledgeSource): Promise<Omit<KnowledgeItem, 'id' | 'timestamp' | 'verified' | 'domainId'>[]> {
    if (source.type === 'url' && source.url) {
      return this.fetchFromURL(source.url, source.domainId)
    }

    return []
  }

  private async fetchFromURL(url: string, domainId: string): Promise<Omit<KnowledgeItem, 'id' | 'timestamp' | 'verified' | 'domainId'>[]> {
    try {
      const response = await fetch(`/api/content?url=${encodeURIComponent(url)}&domain=${domainId}`)
      if (!response.ok) {
        console.warn(`Failed to fetch from URL: ${url}, status: ${response.status}`)
        return []
      }
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.warn(`Error fetching from URL: ${url}`, error)
      return []
    }
  }

  async createSubAssistant(domainId: string): Promise<SubAssistant | null> {
    const domain = DOMAINS.find(d => d.id === domainId)
    if (!domain) return null

    const { createSubAssistant } = await import('./collaboration')
    const assistant = createSubAssistant(domainId)

    if (this.knowledgeStore.get(domainId)?.length === 0) {
      await this.initializeDomainKnowledge(domainId)
    }

    assistant.knowledgeBaseIds = [`kb-${domainId}`]

    this.assistantStore.set(domainId, assistant)
    return assistant
  }

  private async initializeDomainKnowledge(domainId: string): Promise<void> {
    const sampleKnowledge: Record<string, Omit<KnowledgeItem, 'id' | 'timestamp' | 'verified' | 'domainId'>[]> = {
      space: [
        {
          title: 'SpaceX 星舰最新进展',
          content: 'SpaceX 完成星舰第六次综合测试飞行，成功实现筷子捕获助推器。月球登陆计划加速推进。',
          source: 'SpaceX Official',
          tags: ['SpaceX', '星舰', '火箭回收'],
          type: 'news',
        },
        {
          title: 'NASA 阿尔忒弥斯计划',
          content: 'NASA 阿尔忒弥斯计划目标在2026年实现载人登月，并在月球轨道建立深空门户站。',
          source: 'NASA Official',
          tags: ['NASA', '月球', '阿尔忒弥斯'],
          type: 'article',
        },
      ],
      longevity: [
        {
          title: 'Senolytics 药物新突破',
          content: '最新研究表明 combination senolytics 可以显著减少老化细胞负担，延长健康寿命约25%。',
          source: 'Nature Aging',
          tags: ['Senolytics', '抗衰老', '临床试验'],
          type: 'research',
        },
        {
          title: 'NMN 研究进展',
          content: 'NMN（烟酰胺单核苷酸）在多项临床试验中显示出改善代谢功能和延缓衰老的潜力。',
          source: 'Cell Reports',
          tags: ['NMN', '抗衰老', '代谢'],
          type: 'research',
        },
      ],
      'ai-safety': [
        {
          title: 'AI 对齐研究新方向',
          content: 'Constitutional AI 方法在大型语言模型中展现出更好的行为约束效果，减少有害输出。',
          source: 'Anthropic Research',
          tags: ['对齐', 'Constitutional AI', 'RLHF'],
          type: 'research',
        },
        {
          title: 'AI 安全评估框架',
          content: 'ETHENTIC AI 提出的多维度安全评估框架涵盖能力评估、风险评估和对齐程度评估。',
          source: 'AI Safety Research',
          tags: ['安全评估', 'AI治理', '框架'],
          type: 'article',
        },
      ],
      growth: [
        {
          title: '间隔重复法学习效率',
          content: '使用间隔重复法学习新知识，记忆保持率比传统方法提高约200%，适用于语言和专业技能学习。',
          source: 'Cognitive Science Journal',
          tags: ['学习方法', '记忆', '间隔重复'],
          type: 'research',
        },
        {
          title: '刻意练习的核心原则',
          content: '刻意练习强调专注、反馈、突破舒适区，是技能提升的最有效方法之一。',
          source: 'Peak Journal',
          tags: ['刻意练习', '技能提升', '学习方法'],
          type: 'article',
        },
      ],
    }

    const domainKnowledge = sampleKnowledge[domainId] || []
    for (const item of domainKnowledge) {
      await this.addKnowledgeItem(domainId, item)
    }
  }

  async getSubAssistant(domainId: string): Promise<SubAssistant | null> {
    return this.assistantStore.get(domainId) || null
  }

  async getAllSubAssistants(): Promise<SubAssistant[]> {
    return Array.from(this.assistantStore.values())
  }

  async updateSubAssistant(domainId: string, updates: Partial<SubAssistant>): Promise<SubAssistant | null> {
    const assistant = this.assistantStore.get(domainId)
    if (!assistant) return null

    const updated = { ...assistant, ...updates }
    this.assistantStore.set(domainId, updated)
    return updated
  }

  setRAGConfig(config: Partial<RAGConfig>) {
    this.ragConfig = { ...this.ragConfig, ...config }
  }

  getRAGConfig(): RAGConfig {
    return this.ragConfig
  }

  setSyncConfig(config: Partial<SyncConfig>) {
    this.syncConfig = { ...this.syncConfig, ...config }
  }

  getSyncConfig(): SyncConfig {
    return this.syncConfig
  }
}

export const knowledgeBaseManager = new KnowledgeBaseManager()

export class RAGService {
  private manager: KnowledgeBaseManager
  private embeddings: Map<string, number[]> = new Map()

  constructor(manager: KnowledgeBaseManager) {
    this.manager = manager
  }

  async retrieve(query: string, domainId: string, topK?: number): Promise<KnowledgeItem[]> {
    const config = this.manager.getRAGConfig()
    const items = await this.manager.getKnowledgeItems(domainId)

    if (items.length === 0) return []

    const queryEmbedding = await this.computeEmbedding(query)

    const scored = items.map(item => ({
      item,
      score: this.cosineSimilarity(queryEmbedding, this.computeTextEmbedding(item.content)),
    }))

    scored.sort((a, b) => b.score - a.score)

    const threshold = config.similarityThreshold
    const filtered = scored.filter(s => s.score >= threshold)

    if (filtered.length === 0) {
      const keywordResults = this.keywordMatch(query, items)
      if (keywordResults.length > 0) {
        return keywordResults.slice(0, topK || config.retrievalTopK)
      }
      return items.slice(0, topK || config.retrievalTopK)
    }

    return filtered.slice(0, topK || config.retrievalTopK).map(s => s.item)
  }

  private keywordMatch(query: string, items: KnowledgeItem[]): KnowledgeItem[] {
    const scored = items.map(item => {
      const titleLower = item.title.toLowerCase()
      const contentLower = item.content.toLowerCase()
      const tagsLower = item.tags.map(t => t.toLowerCase())

      let score = 0

      for (let i = 0; i < query.length; i++) {
        const char = query[i].toLowerCase()
        if (titleLower.includes(char)) score += 1
        if (contentLower.includes(char)) score += 0.3
        if (tagsLower.some(t => t.includes(char))) score += 0.5
      }

      const queryLower = query.toLowerCase()
      if (titleLower.includes(queryLower)) score += 10
      if (contentLower.includes(queryLower)) score += 3
      if (tagsLower.some(t => t.includes(queryLower) || queryLower.includes(t))) score += 5

      return { item, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.filter(s => s.score > 0).map(s => s.item)
  }

  private async computeEmbedding(text: string): Promise<number[]> {
    const cacheKey = this.hashText(text)
    if (this.embeddings.has(cacheKey)) {
      return this.embeddings.get(cacheKey)!
    }

    const embedding = this.simpleEmbedding(text)
    this.embeddings.set(cacheKey, embedding)
    return embedding
  }

  private computeTextEmbedding(text: string): number[] {
    return this.simpleEmbedding(text)
  }

  private simpleEmbedding(text: string): number[] {
    const dimension = 128
    const embedding = new Array(dimension).fill(0)

    for (let i = 0; i < text.length; i++) {
      embedding[i % dimension] += text.charCodeAt(i)
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / (magnitude || 1))
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1)
  }

  private hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }

  async enhanceResponse(query: string, domainId: string, baseResponse: string): Promise<{ response: string; sources: KnowledgeItem[] }> {
    const retrieved = await this.retrieve(query, domainId)

    if (retrieved.length === 0) {
      return { response: baseResponse, sources: [] }
    }

    let enhancedResponse = baseResponse

    if (retrieved.length > 0) {
      const sourceList = retrieved.map((item, i) => `[${i + 1}] ${item.title}`).join('\n')
      enhancedResponse += `\n\n---\n📚 参考知识库：\n${sourceList}`
    }

    return {
      response: enhancedResponse,
      sources: retrieved,
    }
  }
}

export const ragService = new RAGService(knowledgeBaseManager)

export class XiaolongxiaSync {
  private manager: KnowledgeBaseManager
  private syncInterval?: NodeJS.Timeout

  constructor(manager: KnowledgeBaseManager) {
    this.manager = manager
  }

  async syncToXiaolongxia(domainId: string): Promise<{ success: boolean; itemsSynced: number }> {
    const config = this.manager.getSyncConfig()
    const items = await this.manager.getKnowledgeItems(domainId, { verified: true })

    try {
      const response = await fetch(`${config.xiaolongxiaEndpoint}/api/sync/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, items }),
      })

      if (!response.ok) {
        return { success: false, itemsSynced: 0 }
      }

      return { success: true, itemsSynced: items.length }
    } catch {
      return { success: false, itemsSynced: 0 }
    }
  }

  async syncFromXiaolongxia(domainId: string): Promise<{ success: boolean; itemsReceived: number }> {
    const config = this.manager.getSyncConfig()

    try {
      const response = await fetch(`${config.xiaolongxiaEndpoint}/api/knowledge?domain=${domainId}`)

      if (!response.ok) {
        return { success: false, itemsReceived: 0 }
      }

      const data = await response.json()
      const items = data.items || []

      for (const item of items) {
        await this.manager.addKnowledgeItem(domainId, {
          title: item.title,
          content: item.content,
          source: item.source || 'xiaolongxia',
          tags: item.tags || [],
          type: item.type || 'article',
        })
      }

      return { success: true, itemsReceived: items.length }
    } catch {
      return { success: false, itemsReceived: 0 }
    }
  }

  async bidirectionalSync(domainId: string): Promise<{
    toXiaolongxia: { success: boolean; itemsSynced: number }
    fromXiaolongxia: { success: boolean; itemsReceived: number }
  }> {
    const toResult = await this.syncToXiaolongxia(domainId)
    const fromResult = await this.syncFromXiaolongxia(domainId)

    return {
      toXiaolongxia: toResult,
      fromXiaolongxia: fromResult,
    }
  }

  startAutoSync(interval?: number) {
    const config = this.manager.getSyncConfig()
    const intervalMs = interval || config.syncInterval

    this.syncInterval = setInterval(async () => {
      for (const domain of DOMAINS) {
        await this.bidirectionalSync(domain.id)
      }
    }, intervalMs)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }
}

export const xiaolongxiaSync = new XiaolongxiaSync(knowledgeBaseManager)

export function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []
  const words = text.split(/\s+/)
  let currentChunk = ''
  let startIndex = 0

  while (startIndex < words.length) {
    currentChunk = words.slice(startIndex, startIndex + chunkSize).join(' ')
    chunks.push(currentChunk)
    startIndex += chunkSize - overlap
  }

  return chunks
}

export function extractKeywords(text: string, topN: number = 10): string[] {
  const stopWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    '自己', '这', '那', '它', '他', '她', '们', '吗', '呢', '吧', '啊', '哦', '嗯',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'and', 'or', 'but', 'if', 'then', 'so', 'because', 'as', 'until', 'while', 'of',
  ])

  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w))

  const frequency: Record<string, number> = {}
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}