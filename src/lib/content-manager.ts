export type Platform = 'zhihu' | 'wechat' | 'twitter' | 'community'
export type PublishStatus = 'draft' | 'pending' | 'published' | 'failed'

export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  coverImage?: string
  tags: string[]
  domainId: string
  createdAt: number
  updatedAt: number
  author: string
}

export interface PublishConfig {
  platform: Platform
  enabled: boolean
  autoPublish: boolean
  scheduledTime?: number
  titlePrefix?: string
  titleSuffix?: string
}

export interface PublishRecord {
  id: string
  articleId: string
  platform: Platform
  status: PublishStatus
  publishedAt?: number
  url?: string
  error?: string
  views?: number
  likes?: number
}

export interface ContentState {
  articles: Article[]
  drafts: Article[]
  publishQueue: PublishRecord[]
  platformConfigs: Record<Platform, PublishConfig>
}

const DEFAULT_PLATFORM_CONFIGS: Record<Platform, PublishConfig> = {
  zhihu: {
    platform: 'zhihu',
    enabled: true,
    autoPublish: false,
    titlePrefix: '',
    titleSuffix: '｜深度解读',
  },
  wechat: {
    platform: 'wechat',
    enabled: true,
    autoPublish: false,
    titlePrefix: '',
    titleSuffix: '',
  },
  twitter: {
    platform: 'twitter',
    enabled: false,
    autoPublish: false,
    titlePrefix: '🧵 ',
    titleSuffix: '',
  },
  community: {
    platform: 'community',
    enabled: true,
    autoPublish: false,
    titlePrefix: '',
    titleSuffix: '',
  },
}

export const CONTENT_TEMPLATES = [
  {
    id: 'template-1',
    name: '技术深度分析',
    description: '适合AI安全、技术趋势类文章',
    template: `【标题】

【导语】
简要介绍文章要讨论的核心问题...

【正文】
## 第一部分：背景介绍
...

## 第二部分：深度分析
...

## 第三部分：观点与建议
...

【结语】
总结全文核心观点，展望未来趋势。`,
  },
  {
    id: 'template-2',
    name: '跨领域洞见',
    description: '适合跨领域知识融合的文章',
    template: `【标题】

【背景】
为什么这两个领域的交叉值得探讨...

【跨域连接】
## 领域A的核心发现
...

## 领域B的对应洞察
...

## 融合创新点
...

【实践建议】
如何在实际中应用这些洞察...`,
  },
  {
    id: 'template-3',
    name: '学习笔记',
    description: '适合记录学习心得和知识整理',
    template: `【标题】

【学习目标】
这篇文章要解决什么问题...

【知识要点】
1. 要点一
2. 要点二
3. 要点三

【个人思考】
我对这些内容的理解和反思...

【实践应用】
如何在生活中应用这些知识...`,
  },
]

class ContentManager {
  private articles: Article[] = []
  private publishQueue: PublishRecord[] = []
  private platformConfigs: Record<Platform, PublishConfig> = { ...DEFAULT_PLATFORM_CONFIGS }

  constructor() {
    this.initializeSampleData()
  }

  private initializeSampleData() {
    const sampleArticles: Article[] = [
      {
        id: 'article-1',
        title: 'AI安全的新前沿：Constitutional AI 的实践与思考',
        content: `随着人工智能技术的快速发展，AI安全问题日益受到关注。Constitutional AI（Constitutional AI）作为一种新兴的对齐技术，正在为AI安全提供新的思路...

## 什么是 Constitutional AI

Constitutional AI 是一种基于规则的AI训练方法，它让AI系统学习一套明确的行为准则（宪法），并在生成内容时遵循这些准则...

## 核心原理

Constitutional AI 的核心在于将人类的价值观和伦理原则编码成明确的规则，然后通过强化学习让AI学会在这些规则框架内行动...

## 实践应用

在实际应用中，Constitutional AI 已经被多家AI公司采用，显著提升了AI系统的安全性和可靠性...`,
        excerpt: '深入探讨Constitutional AI技术的原理、实践与未来发展',
        tags: ['AI安全', '对齐技术', 'Constitutional AI'],
        domainId: 'ai-safety',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
        author: 'AI助手联盟',
      },
      {
        id: 'article-2',
        title: '太空医学：宇航员健康管理的最新进展',
        content: `太空探索不仅挑战着我们的技术极限，也挑战着人类的生理极限。太空医学作为一门新兴学科，正在为长期太空任务保驾护航...`,
        excerpt: '探索太空医学如何保障宇航员在长期任务中的健康',
        tags: ['太空医学', '健康管理', 'NASA'],
        domainId: 'space',
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
        author: 'AI助手联盟',
      },
    ]
    this.articles = sampleArticles

    const samplePublishRecords: PublishRecord[] = [
      {
        id: 'pub-1',
        articleId: 'article-1',
        platform: 'zhihu',
        status: 'published',
        publishedAt: Date.now() - 3600000,
        url: 'https://zhihu.com/p/123456',
        views: 1250,
        likes: 89,
      },
    ]
    this.publishQueue = samplePublishRecords
  }

  getArticles(): Article[] {
    return this.articles.sort((a, b) => b.createdAt - a.createdAt)
  }

  getArticleById(id: string): Article | undefined {
    return this.articles.find((a) => a.id === id)
  }

  getArticlesByDomain(domainId: string): Article[] {
    return this.articles.filter((a) => a.domainId === domainId)
  }

  createArticle(title: string, content: string, excerpt: string, domainId: string, tags: string[]): Article {
    const article: Article = {
      id: `article-${Date.now()}`,
      title,
      content,
      excerpt,
      domainId,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: 'AI助手联盟',
    }
    this.articles.unshift(article)
    return article
  }

  updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'createdAt'>>): Article | undefined {
    const index = this.articles.findIndex((a) => a.id === id)
    if (index === -1) return undefined

    this.articles[index] = {
      ...this.articles[index],
      ...updates,
      updatedAt: Date.now(),
    }
    return this.articles[index]
  }

  deleteArticle(id: string): boolean {
    const index = this.articles.findIndex((a) => a.id === id)
    if (index === -1) return false
    this.articles.splice(index, 1)
    return true
  }

  getPublishQueue(): PublishRecord[] {
    return this.publishQueue.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
  }

  getPublishRecordsByArticle(articleId: string): PublishRecord[] {
    return this.publishQueue.filter((p) => p.articleId === articleId)
  }

  async publishToPlatform(articleId: string, platform: Platform): Promise<PublishRecord> {
    const article = this.getArticleById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    const config = this.platformConfigs[platform]
    if (!config.enabled) {
      throw new Error(`${platform} is not enabled`)
    }

    const record: PublishRecord = {
      id: `pub-${Date.now()}`,
      articleId,
      platform,
      status: 'pending',
    }

    this.publishQueue.unshift(record)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const success = Math.random() > 0.1

      if (success) {
        record.status = 'published'
        record.publishedAt = Date.now()
        record.url = this.generatePublishUrl(platform, articleId)
        record.views = Math.floor(Math.random() * 5000)
        record.likes = Math.floor(Math.random() * 500)
      } else {
        record.status = 'failed'
        record.error = '平台API调用失败，请重试'
      }
    } catch (error: any) {
      record.status = 'failed'
      record.error = error.message || 'Unknown error'
    }

    return record
  }

  private generatePublishUrl(platform: Platform, articleId: string): string {
    const baseUrls: Record<Platform, string> = {
      zhihu: 'https://zhihu.com/p/',
      wechat: 'https://mp.weixin.qq.com/s/',
      twitter: 'https://twitter.com/i/status/',
      community: 'https://community.example.com/post/',
    }
    return baseUrls[platform] + articleId.slice(-8)
  }

  getPlatformConfigs(): Record<Platform, PublishConfig> {
    return { ...this.platformConfigs }
  }

  updatePlatformConfig(platform: Platform, config: Partial<PublishConfig>): void {
    this.platformConfigs[platform] = {
      ...this.platformConfigs[platform],
      ...config,
    }
  }
}

export const contentManager = new ContentManager()