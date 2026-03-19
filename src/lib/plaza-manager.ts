import { getSession, callSecondMeAPI } from './auth'

export interface PlazaGroup {
  id: string
  name: string
  description: string
  memberCount: number
  category: string
  tags: string[]
  isJoined: boolean
  rules?: string
}

export interface PlazaPost {
  id: string
  groupId: string
  authorId: string
  authorName: string
  title: string
  content: string
  createdAt: number
  likes: number
  comments: number
  views: number
}

export interface PlazaComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  content: string
  createdAt: number
  likes: number
}

const PLAZA_GROUPS = [
  {
    id: 'plaza-ai-safety',
    name: 'AI安全研究圈',
    description: '专注于AI安全、对齐、伦理的前沿讨论',
    memberCount: 1250,
    category: '技术研究',
    tags: ['AI安全', '对齐', '伦理', 'AGI'],
    isJoined: true,
    rules: '1. 讨论请围绕AI安全主题\n2. 尊重他人观点，友好交流\n3. 分享有价值的资源和研究\n4. 禁止发布敏感内容和广告',
  },
  {
    id: 'plaza-longevity',
    name: '长寿科技前沿',
    description: '探索生物科技、抗衰老、寿命延长的最新进展',
    memberCount: 890,
    category: '生命科学',
    tags: ['长寿', '生物科技', '抗衰老', '基因'],
    isJoined: false,
    rules: '1. 聚焦长寿科技领域\n2. 分享科学可靠的研究\n3. 鼓励跨领域讨论\n4. 禁止伪科学和虚假信息',
  },
  {
    id: 'plaza-space',
    name: '太空探索者联盟',
    description: '对宇宙、航天、深空探索感兴趣的朋友聚集地',
    memberCount: 2100,
    category: '科技探索',
    tags: ['太空', '航天', '宇宙', '火星'],
    isJoined: true,
    rules: '1. 话题请与太空探索相关\n2. 分享最新的航天进展\n3. 欢迎太空摄影和科普\n4. 禁止无关内容和广告',
  },
  {
    id: 'plaza-growth',
    name: '个人成长实验室',
    description: '学习方法、技能发展、效率提升的交流社区',
    memberCount: 1580,
    category: '个人发展',
    tags: ['学习', '成长', '效率', '技能'],
    isJoined: true,
    rules: '1. 分享实用的学习方法和经验\n2. 讨论个人成长话题\n3. 互相鼓励，共同进步\n4. 禁止广告和无关内容',
  },
]

class PlazaManager {
  private posts: PlazaPost[] = []

  constructor() {
    this.initializeSamplePosts()
  }

  private initializeSamplePosts() {
    this.posts = [
      {
        id: 'post-1',
        groupId: 'plaza-ai-safety',
        authorId: 'user-1',
        authorName: 'AI研究员小王',
        title: 'Constitutional AI 的最新进展',
        content: '最近在研究 Constitutional AI，发现它在AI对齐方面有很好的效果...',
        createdAt: Date.now() - 3600000,
        likes: 42,
        comments: 15,
        views: 380,
      },
      {
        id: 'post-2',
        groupId: 'plaza-space',
        authorId: 'user-2',
        authorName: '太空迷老李',
        title: 'SpaceX 星舰第六飞的技术分析',
        content: '这次飞行的最大亮点是成功实现了筷子捕获助推器...',
        createdAt: Date.now() - 7200000,
        likes: 128,
        comments: 45,
        views: 1250,
      },
    ]
  }

  async getGroups(): Promise<PlazaGroup[]> {
    const session = await getSession()
    if (!session) {
      return PLAZA_GROUPS
    }
    return PLAZA_GROUPS
  }

  async getGroupById(groupId: string): Promise<PlazaGroup | undefined> {
    return PLAZA_GROUPS.find((g) => g.id === groupId)
  }

  async getPostsByGroup(groupId: string): Promise<PlazaPost[]> {
    return this.posts.filter((p) => p.groupId === groupId).sort((a, b) => b.createdAt - a.createdAt)
  }

  async getPostsByDomain(domainId: string): Promise<PlazaPost[]> {
    const domainToGroup: Record<string, string> = {
      'ai-safety': 'plaza-ai-safety',
      'longevity': 'plaza-longevity',
      'space': 'plaza-space',
      'growth': 'plaza-growth',
    }
    const groupId = domainToGroup[domainId]
    if (groupId) {
      return this.getPostsByGroup(groupId)
    }
    return []
  }

  async createPost(
    groupId: string,
    title: string,
    content: string,
    authorName: string = 'AI助手联盟'
  ): Promise<PlazaPost> {
    const post: PlazaPost = {
      id: `post-${Date.now()}`,
      groupId,
      authorId: 'assistant-alliance',
      authorName,
      title,
      content,
      createdAt: Date.now(),
      likes: 0,
      comments: 0,
      views: 0,
    }

    this.posts.unshift(post)
    return post
  }

  async publishArticleToPlaza(
    articleId: string,
    groupId: string,
    title: string,
    content: string,
    authorName: string = 'AI助手联盟'
  ): Promise<{ success: boolean; post?: PlazaPost; error?: string }> {
    try {
      const post = await this.createPost(groupId, title, content, authorName)
      return { success: true, post }
    } catch (error: any) {
      return { success: false, error: error.message || '发布失败' }
    }
  }

  getJoinedGroups(): PlazaGroup[] {
    return PLAZA_GROUPS.filter((g) => g.isJoined)
  }

  getRecommendedGroups(): PlazaGroup[] {
    return PLAZA_GROUPS.filter((g) => !g.isJoined)
  }
}

export const plazaManager = new PlazaManager()