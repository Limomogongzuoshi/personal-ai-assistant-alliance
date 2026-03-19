export interface LearningStage {
  id: string
  name: string
  description: string
  duration: string
  objectives: string[]
  resources: ResourceRef[]
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  type: 'quiz' | 'project' | 'reading' | 'discussion'
  xp: number
}

export interface ResourceRef {
  type: 'article' | 'video' | 'course' | 'book'
  title: string
  url?: string
  duration?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface LearningPath {
  domainId: string
  stages: LearningStage[]
  totalXp: number
}

export interface LearningProgress {
  domainId: string
  currentStage: number
  completedStages: number[]
  completedMilestones: string[]
  totalXp: number
  weeklyGoal: number
  weeklyProgress: number
  streak: number
  lastActivity: number
}

export const SPACE_LEARNING_PATH: LearningPath = {
  domainId: 'space',
  totalXp: 2500,
  stages: [
    {
      id: 'space-foundations',
      name: '太空探索基础',
      description: '了解太空探索的历史、基本概念和关键技术',
      duration: '2周',
      objectives: [
        '理解太阳系结构和八大行星',
        '掌握航天器基本原理',
        '了解太空任务发展历程',
      ],
      resources: [
        { type: 'video', title: '宇宙有多大？', url: 'https://example.com/cosmos', duration: '45分钟', difficulty: 'beginner' },
        { type: 'article', title: '太阳系漫游指南', difficulty: 'beginner' },
        { type: 'book', title: '太空全书', difficulty: 'beginner' },
      ],
      milestones: [
        { id: 'm1', title: '太阳系测验', description: '完成太阳系基础知识测验', type: 'quiz', xp: 100 },
        { id: 'm2', title: '航天器设计', description: '设计一个火星着陆器方案', type: 'project', xp: 200 },
      ],
    },
    {
      id: 'space-technology',
      name: '航天技术进阶',
      description: '深入学习火箭技术、轨道力学和太空工程',
      duration: '3周',
      objectives: [
        '掌握火箭推进原理',
        '理解轨道力学基础',
        '了解卫星技术应用',
      ],
      resources: [
        { type: 'course', title: '火箭推进原理', duration: '8小时', difficulty: 'intermediate' },
        { type: 'video', title: '猎鹰火箭回收原理', duration: '30分钟', difficulty: 'intermediate' },
        { type: 'article', title: 'SpaceX vs NASA 技术对比', difficulty: 'intermediate' },
      ],
      milestones: [
        { id: 'm3', title: '轨道计算', description: '完成轨道力学计算题', type: 'quiz', xp: 150 },
        { id: 'm4', title: '火箭设计报告', description: '撰写一份火箭推进系统分析报告', type: 'project', xp: 300 },
      ],
    },
    {
      id: 'space-exploration',
      name: '深空探索',
      description: '探索月球、火星及更远的深空任务',
      duration: '4周',
      objectives: [
        '了解月球探索历史和阿尔忒弥斯计划',
        '掌握火星殖民技术挑战',
        '探索小行星采矿可能性',
      ],
      resources: [
        { type: 'article', title: '阿尔忒弥斯计划详解', difficulty: 'advanced' },
        { type: 'video', title: '火星生存挑战', duration: '1小时', difficulty: 'advanced' },
        { type: 'course', title: '行星际旅行', duration: '12小时', difficulty: 'advanced' },
      ],
      milestones: [
        { id: 'm5', title: '火星基地设计', description: '设计一个可容纳100人的火星基地', type: 'project', xp: 500 },
        { id: 'm6', title: '深空探索讨论', description: '参与关于星际旅行的讨论', type: 'discussion', xp: 200 },
      ],
    },
    {
      id: 'space-frontier',
      name: '太空前沿',
      description: '探索太空前沿话题：系外行星、暗物质、星际旅行',
      duration: '3周',
      objectives: [
        '了解系外行星探索最新进展',
        '理解暗物质和暗能量',
        '探索曲速引擎和虫洞理论',
      ],
      resources: [
        { type: 'video', title: '韦伯望远镜新发现', duration: '45分钟', difficulty: 'advanced' },
        { type: 'article', title: '虫洞理论入门', difficulty: 'advanced' },
        { type: 'book', title: '时间简史', difficulty: 'advanced' },
      ],
      milestones: [
        { id: 'm7', title: '系外行星研究', description: '撰写一篇关于宜居星球的分析', type: 'project', xp: 400 },
        { id: 'm8', title: '前沿话题辩论', description: '参与星际旅行可能性辩论', type: 'discussion', xp: 250 },
      ],
    },
  ],
}

export const LONGEVITY_LEARNING_PATH: LearningPath = {
  domainId: 'longevity',
  totalXp: 2500,
  stages: [
    {
      id: 'longevity-foundations',
      name: '长寿科技基础',
      description: '了解衰老的生物学机制和基本概念',
      duration: '2周',
      objectives: [
        '理解细胞衰老机制',
        '掌握八大衰老标识',
        '了解寿命研究历史',
      ],
      resources: [
        { type: 'video', title: '什么是衰老？', duration: '40分钟', difficulty: 'beginner' },
        { type: 'article', title: '衰老九大标识解读', difficulty: 'beginner' },
        { type: 'book', title: '优雅老去', difficulty: 'beginner' },
      ],
      milestones: [
        { id: 'm1', title: '衰老机制测验', description: '完成细胞衰老基础测验', type: 'quiz', xp: 100 },
        { id: 'm2', title: '健康计划', description: '制定个人健康改善计划', type: 'project', xp: 200 },
      ],
    },
    {
      id: 'longevity-biotech',
      name: '生物科技应用',
      description: '学习Senolytics、基因编辑等前沿技术',
      duration: '3周',
      objectives: [
        '理解Senolytics药物原理',
        '了解CRISPR基因编辑',
        '掌握表观遗传学概念',
      ],
      resources: [
        { type: 'course', title: '基因编辑入门', duration: '10小时', difficulty: 'intermediate' },
        { type: 'article', title: 'Senolytics最新研究', difficulty: 'intermediate' },
        { type: 'video', title: '表观遗传学讲解', duration: '35分钟', difficulty: 'intermediate' },
      ],
      milestones: [
        { id: 'm3', title: '技术对比分析', description: '分析不同抗衰老技术优劣', type: 'project', xp: 300 },
        { id: 'm4', title: '生物科技测验', description: '完成基因技术知识测验', type: 'quiz', xp: 150 },
      ],
    },
    {
      id: 'longevity-medicine',
      name: '长寿医学',
      description: '探索临床应用和最新疗法',
      duration: '4周',
      objectives: [
        '了解NMN、白藜芦醇等补充剂',
        '掌握间歇性禁食原理',
        '探索再生医学前沿',
      ],
      resources: [
        { type: 'article', title: 'NMN研究综述', difficulty: 'advanced' },
        { type: 'video', title: '间歇性禁食科学', duration: '50分钟', difficulty: 'advanced' },
        { type: 'course', title: '再生医学概论', duration: '15小时', difficulty: 'advanced' },
      ],
      milestones: [
        { id: 'm5', title: '个人长寿方案', description: '设计一套个性化长寿方案', type: 'project', xp: 500 },
        { id: 'm6', title: '医学前沿讨论', description: '参与抗衰老疗法讨论', type: 'discussion', xp: 200 },
      ],
    },
    {
      id: 'longevity-future',
      name: '长寿未来学',
      description: '探索永生、意识上传等前沿话题',
      duration: '3周',
      objectives: [
        '理解奇点和技术爆炸',
        '探索数字永生可能性',
        '思考长寿伦理问题',
      ],
      resources: [
        { type: 'book', title: '奇点临近', difficulty: 'advanced' },
        { type: 'video', title: '意识上传科学吗？', duration: '45分钟', difficulty: 'advanced' },
        { type: 'article', title: '长寿伦理思考', difficulty: 'advanced' },
      ],
      milestones: [
        { id: 'm7', title: '未来预测报告', description: '撰写2050年长寿科技预测', type: 'project', xp: 400 },
        { id: 'm8', title: '伦理辩论', description: '参与长寿伦理辩论', type: 'discussion', xp: 250 },
      ],
    },
  ],
}

export const AI_SAFETY_LEARNING_PATH: LearningPath = {
  domainId: 'ai-safety',
  totalXp: 2500,
  stages: [
    {
      id: 'ai-safety-intro',
      name: 'AI安全导论',
      description: '了解AI安全的基本概念和重要性',
      duration: '2周',
      objectives: [
        '理解什么是AI安全',
        '掌握AI风险的分类',
        '了解AI发展历史',
      ],
      resources: [
        { type: 'video', title: '为什么AI安全重要？', duration: '35分钟', difficulty: 'beginner' },
        { type: 'article', title: 'AI安全入门指南', difficulty: 'beginner' },
        { type: 'book', title: 'AI新生手册', difficulty: 'beginner' },
      ],
      milestones: [
        { id: 'm1', title: 'AI风险分类', description: '完成AI风险识别练习', type: 'quiz', xp: 100 },
        { id: 'm2', title: '案例分析', description: '分析一个AI事故案例', type: 'project', xp: 200 },
      ],
    },
    {
      id: 'ai-safety-alignment',
      name: 'AI对齐技术',
      description: '学习如何确保AI目标与人类价值一致',
      duration: '3周',
      objectives: [
        '理解AI对齐问题',
        '掌握RLHF和Constitutional AI',
        '了解可解释AI概念',
      ],
      resources: [
        { type: 'course', title: 'AI对齐原理', duration: '12小时', difficulty: 'intermediate' },
        { type: 'article', title: 'Constitutional AI解析', difficulty: 'intermediate' },
        { type: 'video', title: '可解释AI讲解', duration: '40分钟', difficulty: 'intermediate' },
      ],
      milestones: [
        { id: 'm3', title: '对齐方案设计', description: '为一个AI系统设计对齐方案', type: 'project', xp: 300 },
        { id: 'm4', title: '对齐技术测验', description: '完成对齐技术知识测验', type: 'quiz', xp: 150 },
      ],
    },
    {
      id: 'ai-safety-governance',
      name: 'AI治理',
      description: '了解AI监管政策和企业责任',
      duration: '3周',
      objectives: [
        '掌握全球AI监管现状',
        '了解EU AI Act要求',
        '理解企业AI伦理实践',
      ],
      resources: [
        { type: 'article', title: 'EU AI Act深度解读', difficulty: 'advanced' },
        { type: 'video', title: 'AI治理全球视角', duration: '45分钟', difficulty: 'advanced' },
        { type: 'course', title: 'AI伦理与治理', duration: '8小时', difficulty: 'advanced' },
      ],
      milestones: [
        { id: 'm5', title: '政策分析报告', description: '撰写一份AI监管政策分析', type: 'project', xp: 400 },
        { id: 'm6', title: '治理讨论', description: '参与AI治理讨论', type: 'discussion', xp: 200 },
      ],
    },
    {
      id: 'ai-safety-frontier',
      name: 'AI安全前沿',
      description: '探索前沿安全研究话题',
      duration: '4周',
      objectives: [
        '理解涌现能力和Agent风险',
        '探索AI安全技术路线',
        '思考超级智能风险',
      ],
      resources: [
        { type: 'paper', title: 'AI Safety Fundamentals', difficulty: 'advanced' },
        { type: 'video', title: '超级智能风险讨论', duration: '1小时', difficulty: 'advanced' },
        { type: 'article', title: 'Agent系统安全', difficulty: 'advanced' },
      ],
      milestones: [
        { id: 'm7', title: '前沿研究综述', description: '撰写一篇AI安全前沿综述', type: 'project', xp: 500 },
        { id: 'm8', title: '安全路线图', description: '设计AI安全研究路线图', type: 'project', xp: 350 },
      ],
    },
  ],
}

export const GROWTH_LEARNING_PATH: LearningPath = {
  domainId: 'growth',
  totalXp: 2500,
  stages: [
    {
      id: 'growth-foundations',
      name: '个人成长基础',
      description: '建立成长型思维和基础学习方法',
      duration: '2周',
      objectives: [
        '理解成长型思维 vs 固定型思维',
        '掌握元学习基础概念',
        '建立有效学习习惯',
      ],
      resources: [
        { type: 'book', title: '终身成长', difficulty: 'beginner' },
        { type: 'video', title: '如何学习学习', duration: '40分钟', difficulty: 'beginner' },
        { type: 'article', title: '元学习入门', difficulty: 'beginner' },
      ],
      milestones: [
        { id: 'm1', title: '思维模式评估', description: '完成思维模式自评', type: 'quiz', xp: 100 },
        { id: 'm2', title: '学习计划', description: '制定21天学习计划', type: 'project', xp: 200 },
      ],
    },
    {
      id: 'growth-methods',
      name: '高效学习法',
      description: '掌握间隔重复、主动回忆等高效技术',
      duration: '3周',
      objectives: [
        '掌握间隔重复原理',
        '学会主动回忆技巧',
        '应用费曼学习法',
      ],
      resources: [
        { type: 'course', title: '学习如何学习', duration: '10小时', difficulty: 'intermediate' },
        { type: 'video', title: '间隔重复原理', duration: '30分钟', difficulty: 'intermediate' },
        { type: 'article', title: '费曼技巧实践', difficulty: 'intermediate' },
      ],
      milestones: [
        { id: 'm3', title: '学习方法实验', description: '对比不同学习方法效果', type: 'project', xp: 300 },
        { id: 'm4', title: '学习技巧测验', description: '完成学习技巧测验', type: 'quiz', xp: 150 },
      ],
    },
    {
      id: 'growth-habits',
      name: '习惯与坚持',
      description: '建立可持续的成长习惯系统',
      duration: '3周',
      objectives: [
        '理解习惯形成机制',
        '掌握习惯叠加技巧',
        '建立反馈循环',
      ],
      resources: [
        { type: 'book', title: '原子习惯', difficulty: 'intermediate' },
        { type: 'video', title: '习惯养成科学', duration: '45分钟', difficulty: 'intermediate' },
        { type: 'article', title: '习惯追踪指南', difficulty: 'intermediate' },
      ],
      milestones: [
        { id: 'm5', title: '习惯系统设计', description: '设计一个30天习惯养成系统', type: 'project', xp: 400 },
        { id: 'm6', title: '习惯追踪报告', description: '记录并分析一周习惯执行', type: 'project', xp: 200 },
      ],
    },
    {
      id: 'growth-mastery',
      name: '技能精通',
      description: '从新手到专家的技能习得之路',
      duration: '4周',
      objectives: [
        '理解刻意练习原理',
        '掌握能力圈概念',
        '建立个人知识体系',
      ],
      resources: [
        { type: 'book', title: 'Peak', difficulty: 'advanced' },
        { type: 'video', title: '刻意练习讲解', duration: '50分钟', difficulty: 'advanced' },
        { type: 'course', title: '知识管理实战', duration: '12小时', difficulty: 'advanced' },
      ],
      milestones: [
        { id: 'm7', title: '技能树规划', description: '绘制个人技能发展树', type: 'project', xp: 500 },
        { id: 'm8', title: '专家访谈', description: '采访一位领域专家', type: 'discussion', xp: 250 },
      ],
    },
  ],
}

export const LEARNING_PATHS: Record<string, LearningPath> = {
  space: SPACE_LEARNING_PATH,
  longevity: LONGEVITY_LEARNING_PATH,
  'ai-safety': AI_SAFETY_LEARNING_PATH,
  growth: GROWTH_LEARNING_PATH,
}

export function getXpForMilestone(path: LearningPath, milestoneId: string): number {
  for (const stage of path.stages) {
    const milestone = stage.milestones.find((m) => m.id === milestoneId)
    if (milestone) return milestone.xp
  }
  return 0
}

export function getNextMilestone(progress: LearningProgress, path: LearningPath): { stage: LearningStage; milestone: Milestone } | null {
  const currentStageIndex = progress.currentStage
  if (currentStageIndex >= path.stages.length) return null

  const currentStage = path.stages[currentStageIndex]
  const nextMilestone = currentStage.milestones.find((m) => !progress.completedMilestones.includes(m.id))

  if (nextMilestone) {
    return { stage: currentStage, milestone: nextMilestone }
  }

  if (currentStageIndex + 1 < path.stages.length) {
    const nextStage = path.stages[currentStageIndex + 1]
    if (nextStage.milestones.length > 0) {
      return { stage: nextStage, milestone: nextStage.milestones[0] }
    }
  }

  return null
}