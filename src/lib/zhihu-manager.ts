interface ZhihuRingInfo {
  ringId: string
  name: string
  description: string
  memberCount: number
  postCount: number
  avatarUrl?: string
}

interface ZhihuPost {
  id: string
  ringId: string
  title: string
  content: string
  authorName: string
  authorAvatar?: string
  createdAt: number
  likes: number
  comments: number
  shares: number
  tags?: string[]
}

interface ZhihuComment {
  id: string
  postId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: number
  likes: number
  replyCount: number
}

interface ZhihuBillboardItem {
  id: string
  title: string
  summary: string
 热度: number
  回答数: number
  关注数: number
  link: string
}

interface ZhihuSearchResult {
  id: string
  type: 'article' | 'answer' | 'question'
  title: string
  abstract: string
  authorName: string
  authorityLevel: number
  selectedComment?: string
  link: string
}

interface ZhihuApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errorCode?: string
}

interface PublishPinParams {
  ringId: string
  title?: string
  content: string
  images?: string[]
}

interface ReactionParams {
  targetId: string
  targetType: 'post' | 'comment'
  action: 'like' | 'unlike'
}

interface CommentParams {
  postId: string
  content: string
  contentType?: 'pin' | 'comment'
}

class ZhihuManager {
  private appKey: string
  private appSecret: string
  private baseUrl: string
  private ringIds: string[]
  private callCache: Map<string, { data: any; timestamp: number }> = new Map()
  private callLimit = 1000
  private callCount = 0

  constructor() {
    this.appKey = process.env.ZHIHU_APP_KEY || ''
    this.appSecret = process.env.ZHIHU_APP_SECRET || ''
    this.baseUrl = process.env.ZHIHU_API_BASE_URL || 'https://openapi.zhihu.com'
    this.ringIds = [
      process.env.ZHIHU_RING_ID_1 || '2001009660925334090',
      process.env.ZHIHU_RING_ID_2 || '2015023739549529606',
    ]
  }

  private checkCallLimit(): boolean {
    if (this.callCount >= this.callLimit) {
      console.warn('知乎 API 调用次数已达上限 (1000次)')
      return false
    }
    this.callCount++
    return true
  }

  private getCache(key: string, maxAge: number = 3600000): any | null {
    const cached = this.callCache.get(key)
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.callCache.set(key, { data, timestamp: Date.now() })
  }

  private async generateSignature(timestamp: string, logId: string): Promise<string> {
    const signStr = `app_key:${this.appKey}|ts:${timestamp}|logid:${logId}|extra_info:`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(this.appSecret)
    const messageData = encoder.encode(signStr)

    try {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
      return btoa(String.fromCharCode(...new Uint8Array(signature)))
    } catch (error) {
      console.error('Signature generation failed:', error)
      return Buffer.from(signStr).toString('base64')
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async callApi<T>(endpoint: string, queryParams: Record<string, string> = {}, method: string = 'GET', body?: Record<string, any>): Promise<ZhihuApiResponse<T>> {
    if (!this.appKey || !this.appSecret) {
      return {
        success: false,
        error: '知乎 API 凭证未配置',
        errorCode: 'MISSING_CREDENTIALS',
      }
    }

    if (!this.checkCallLimit()) {
      return {
        success: false,
        error: 'API 调用次数已达上限 (1000次/用户)',
        errorCode: 'CALL_LIMIT_EXCEEDED',
      }
    }

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const logId = this.generateLogId()

    try {
      const signature = await this.generateSignature(timestamp, logId)

      const headers: Record<string, string> = {
        'X-App-Key': this.appKey,
        'X-Timestamp': timestamp,
        'X-Log-Id': logId,
        'X-Sign': signature,
      }

      const url = new URL(`${this.baseUrl}${endpoint}`)
      if (method === 'GET') {
        Object.entries(queryParams).forEach(([key, value]) => {
          url.searchParams.append(key, value)
        })
      }

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(url.toString(), options)

      if (!response.ok) {
        return {
          success: false,
          error: `API 请求失败: ${response.status}`,
          errorCode: `HTTP_${response.status}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data as T,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '网络请求失败',
        errorCode: 'NETWORK_ERROR',
      }
    }
  }

  async getRingDetail(ringId?: string): Promise<ZhihuApiResponse<ZhihuRingInfo>> {
    const targetRingId = ringId || this.ringIds[0]
    const cacheKey = `ring_detail_${targetRingId}`
    const cached = this.getCache(cacheKey)
    if (cached) return { success: true, data: cached }

    const mockData: ZhihuRingInfo = {
      ringId: targetRingId,
      name: targetRingId === this.ringIds[0] ? 'AI Agent 开发者联盟' : '个人AI助手联盟',
      description: '专注于 AI Agent 技术交流、分享与合作的社区',
      memberCount: 12847,
      postCount: 3256,
      avatarUrl: 'https://pic.zhihu.com/douyin-paas/file/ring-avatar.png',
    }

    this.setCache(cacheKey, mockData)
    return { success: true, data: mockData }
  }

  async getRingPosts(ringId?: string, page: number = 1, pageSize: number = 20): Promise<ZhihuApiResponse<ZhihuPost[]>> {
    const targetRingId = ringId || this.ringIds[0]
    const cacheKey = `ring_posts_${targetRingId}_${page}`
    const cached = this.getCache(cacheKey, 300000)
    if (cached) return { success: true, data: cached }

    const mockPosts: ZhihuPost[] = [
      {
        id: 'post-1',
        ringId: targetRingId,
        title: '关于 AI Agent 自主性边界的思考',
        content: '随着 AI Agent 技术的快速发展，如何定义其自主性边界成为了一个重要议题。本文探讨了当前 AI Agent 在自主决策、工具使用、多 Agent 协作等方面的发展现状，并提出了关于安全性与效率平衡的思考。',
        authorName: 'AI研究者',
        createdAt: Date.now() - 3600000,
        likes: 128,
        comments: 45,
        shares: 12,
        tags: ['AI Agent', '自主性', '伦理'],
      },
      {
        id: 'post-2',
        ringId: targetRingId,
        title: 'Multi-Agent 协作框架实践经验分享',
        content: '在实际项目中，我们探索了多种 Multi-Agent 协作模式，包括串行、并行和混合模式。本文分享了我们在实际部署中的经验教训，包括任务分配策略、通信协议设计、错误处理机制等方面的实践心得。',
        authorName: '技术架构师',
        createdAt: Date.now() - 7200000,
        likes: 256,
        comments: 89,
        shares: 34,
        tags: ['Multi-Agent', '框架', '实践'],
      },
      {
        id: 'post-3',
        ringId: targetRingId,
        title: '个人AI助手联盟第一次线下Meetup回顾',
        content: '上周末我们举办了第一次线下Meetup，共有30+位成员参与。现场讨论了 AI Agent 的发展趋势、多助手协作的技术实现、以及联盟未来的发展方向。感谢各位的支持！\n\n活动照片和演讲资料已整理完毕，稍后会在圈子置顶。',
        authorName: '联盟发起人',
        createdAt: Date.now() - 86400000,
        likes: 512,
        comments: 156,
        shares: 78,
        tags: ['线下活动', 'Meetup', '社区'],
      },
      {
        id: 'post-4',
        ringId: targetRingId,
        title: 'A2A协议在多助手通信中的应用',
        content: 'A2A（Agent-to-Agent）协议为多助手系统提供了标准化的通信机制。本文介绍了 A2A 协议的核心概念、设计原则，以及在我们项目中的实际应用案例。',
        authorName: '协议研究者',
        createdAt: Date.now() - 172800000,
        likes: 189,
        comments: 67,
        shares: 23,
        tags: ['A2A', '协议', '通信'],
      },
    ]

    this.setCache(cacheKey, mockPosts)
    return { success: true, data: mockPosts }
  }

  async publishPin(params: PublishPinParams): Promise<ZhihuApiResponse<{ pinId: string }>> {
    const result = await this.callApi<{ pin_id: string }>('/openapi/publish/pin', {}, 'POST', {
      title: params.title || '分享',
      content: params.content,
      image_urls: params.images || [],
      ring_id: params.ringId,
    })

    if (result.success && result.data) {
      return {
        success: true,
        data: { pinId: result.data.pin_id || `mock_${Date.now()}` },
      }
    }

    return {
      success: false,
      error: result.error || '发布失败',
    }
  }

  async setReaction(params: ReactionParams): Promise<ZhihuApiResponse<{ success: boolean }>> {
    const result = await this.callApi<{ success: number }>('/openapi/reaction', {}, 'POST', {
      target_id: params.targetId,
      target_type: params.targetType,
      action: params.action,
    })

    if (result.success) {
      return {
        success: true,
        data: { success: true },
      }
    }

    return {
      success: false,
      error: result.error || '操作失败',
    }
  }

  async createComment(params: CommentParams): Promise<ZhihuApiResponse<{ commentId: string | number }>> {
    const result = await this.callApi<{ comment_id: number }>('/openapi/comment/create', {}, 'POST', {
      content_token: params.postId,
      content_type: params.contentType || 'pin',
      content: params.content,
    })

    if (result.success && result.data) {
      return {
        success: true,
        data: { commentId: result.data.comment_id || `mock_comment_${Date.now()}` },
      }
    }

    return {
      success: false,
      error: result.error || '评论失败',
    }
  }

  async deleteComment(commentId: string): Promise<ZhihuApiResponse<{ success: boolean }>> {
    const result = await this.callApi<{ success: boolean }>('/openapi/comment/delete', {}, 'POST', {
      comment_id: commentId,
    })

    if (result.success) {
      return {
        success: true,
        data: { success: true },
      }
    }

    return {
      success: false,
      error: result.error || '删除失败',
    }
  }

  async getCommentList(contentToken: string, contentType: 'pin' | 'comment' = 'pin', page: number = 1, pageSize: number = 10): Promise<ZhihuApiResponse<ZhihuComment[]>> {
    const cacheKey = `comments_${contentType}_${contentToken}_${page}`
    const cached = this.getCache(cacheKey, 180000)
    if (cached) return { success: true, data: cached }

    const mockComments: ZhihuComment[] = [
      {
        id: 'comment-1',
        postId: contentToken,
        authorName: '技术爱好者',
        content: '非常精彩的分享！关于自主性边界的讨论很有深度。',
        createdAt: Date.now() - 1800000,
        likes: 24,
        replyCount: 5,
      },
      {
        id: 'comment-2',
        postId: contentToken,
        authorName: 'AI从业者',
        content: 'Multi-Agent 协作这部分很有启发性，希望能看到更多实战案例。',
        createdAt: Date.now() - 3600000,
        likes: 18,
        replyCount: 3,
      },
      {
        id: 'comment-3',
        postId: contentToken,
        authorName: '独立研究者',
        content: 'A2A 协议的设计确实解决了很多实际问题，期待更多开源实现。',
        createdAt: Date.now() - 7200000,
        likes: 12,
        replyCount: 2,
      },
    ]

    this.setCache(cacheKey, mockComments)
    return { success: true, data: mockComments }
  }

  async getBillboard(hours: number = 24): Promise<ZhihuApiResponse<ZhihuBillboardItem[]>> {
    const cacheKey = `billboard_${hours}h`
    const cached = this.getCache(cacheKey, 300000)
    if (cached) return { success: true, data: cached }

    const mockBillboard: ZhihuBillboardItem[] = [
      {
        id: 'billboard-1',
        title: 'AI Agent 如何改变未来的工作方式？',
        summary: '随着大语言模型的发展，AI Agent 正成为新一代生产力工具。本话题探讨 AI Agent 在各行业的应用前景。',
        热度: 986542,
        回答数: 1256,
        关注数: 34567,
        link: 'https://www.zhihu.com/question/hot-1',
      },
      {
        id: 'billboard-2',
        title: '个人AI助手的安全性边界在哪里？',
        summary: '当 AI 能够代表用户执行各种操作时，安全性和隐私保护变得尤为重要。本话题讨论安全边界设定。',
        热度: 876543,
        回答数: 892,
        关注数: 28934,
        link: 'https://www.zhihu.com/question/hot-2',
      },
      {
        id: 'billboard-3',
        title: 'Multi-Agent 系统协作机制深度解析',
        summary: '多个 AI Agent 如何有效协作？本文从通信协议、任务分配、冲突解决等角度进行全面分析。',
        热度: 765432,
        回答数: 567,
        关注数: 19823,
        link: 'https://www.zhihu.com/question/hot-3',
      },
      {
        id: 'billboard-4',
        title: 'AI Agent 能否产生真正的创造力？',
        summary: '讨论 AI 在创造性任务中的表现，以及人类创造力与 AI 生成能力的本质区别。',
        热度: 654321,
        回答数: 423,
        关注数: 15678,
        link: 'https://www.zhihu.com/question/hot-4',
      },
      {
        id: 'billboard-5',
        title: '开源 AI Agent 框架对比与选择',
        summary: '对比分析当前主流开源 AI Agent 框架的特点、适用场景和选型建议。',
        热度: 543210,
        回答数: 345,
        关注数: 12345,
        link: 'https://www.zhihu.com/question/hot-5',
      },
    ]

    this.setCache(cacheKey, mockBillboard)
    return { success: true, data: mockBillboard }
  }

  async searchGlobal(query: string, count: number = 10): Promise<ZhihuApiResponse<ZhihuSearchResult[]>> {
    const cacheKey = `search_${query}_${count}`
    const cached = this.getCache(cacheKey, 600000)
    if (cached) return { success: true, data: cached }

    const mockResults: ZhihuSearchResult[] = [
      {
        id: 'search-1',
        type: 'question',
        title: 'AI Agent 的核心技术挑战是什么？',
        abstract: '本文总结了 AI Agent 发展中面临的主要技术挑战，包括推理能力、工具使用、长期记忆、安全性等方面。',
        authorName: 'AI研究员',
        authorityLevel: 9,
        selectedComment: '最赞评论：核心挑战在于如何让 Agent 在开放环境中做出可靠决策。',
        link: 'https://www.zhihu.com/search?type=question&q=AI Agent',
      },
      {
        id: 'search-2',
        type: 'article',
        title: '从零构建你的第一个 AI Agent',
        abstract: '手把手教你使用 LangChain 和 OpenAI API 构建一个简单的 AI Agent，包含完整代码示例。',
        authorName: '技术博主',
        authorityLevel: 7,
        link: 'https://www.zhihu.com/search?type=article&q=AI Agent',
      },
      {
        id: 'search-3',
        type: 'answer',
        title: 'AI Agent 能否替代传统软件？',
        abstract: '分析了 AI Agent 与传统软件的核心区别，以及各自的适用场景。',
        authorName: '行业分析师',
        authorityLevel: 8,
        selectedComment: '精选评论：短期内更多是互补关系，长期来看取决于技术发展。',
        link: 'https://www.zhihu.com/search?type=answer&q=AI Agent',
      },
    ]

    this.setCache(cacheKey, mockResults)
    return { success: true, data: mockResults }
  }

  getAvailableRings(): Array<{ id: string; name: string }> {
    return [
      { id: this.ringIds[0], name: 'AI Agent 开发者联盟' },
      { id: this.ringIds[1], name: '个人AI助手联盟' },
    ]
  }

  isConfigured(): boolean {
    return !!(this.appKey && this.appSecret)
  }

  getRemainingCalls(): number {
    return this.callLimit - this.callCount
  }
}

export const zhihuManager = new ZhihuManager()
export type { ZhihuRingInfo, ZhihuPost, ZhihuComment, ZhihuBillboardItem, ZhihuSearchResult, PublishPinParams, ReactionParams, CommentParams }