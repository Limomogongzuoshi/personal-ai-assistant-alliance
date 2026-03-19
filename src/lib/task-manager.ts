import { DOMAINS } from './collaboration'

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ExecutionMode = 'serial' | 'parallel' | 'simple'

export interface Task {
  id: string
  title: string
  description: string
  domainId: string
  priority: TaskPriority
  status: TaskStatus
  result?: string
  createdAt: number
  startedAt?: number
  completedAt?: number
  assignedTo?: string
  executionMode?: ExecutionMode
  subTasks?: SubTask[]
}

export interface SubTask {
  id: string
  taskId: string
  assistantId: string
  title: string
  description: string
  status: TaskStatus
  result?: string
  startedAt?: number
  completedAt?: number
  order: number
}

export interface Assistant {
  id: string
  domainId: string
  name: string
  role: 'main' | 'researcher' | 'creator' | 'tech' | 'checker'
  status: 'idle' | 'busy' | 'offline'
  currentTask?: string
  specialty: string[]
  capabilities: string[]
}

export interface TaskAssignment {
  taskId: string
  assistantId: string
  domainId: string
}

export const OPENCLAW_ASSISTANTS: Assistant[] = [
  {
    id: 'main',
    domainId: 'all',
    role: 'main',
    name: '🧠 OpenClaw 主头脑',
    status: 'idle',
    specialty: ['任务调度', '流程编排', '结果整合', '质量把控'],
    capabilities: ['智能拆解', '并行派发', '进度追踪', '交付整合'],
  },
  {
    id: 'researcher',
    domainId: 'research',
    role: 'researcher',
    name: '🔍 调研助手',
    status: 'idle',
    specialty: ['资料搜集', '数据查证', '行业调研', '案例整理'],
    capabilities: ['信息检索', '竞品分析', '文献综述', '素材整理'],
  },
  {
    id: 'creator',
    domainId: 'content',
    role: 'creator',
    name: '✍️ 创作助手',
    status: 'idle',
    specialty: ['文案撰写', '内容创作', '报告填充', '脚本输出'],
    capabilities: ['文章写作', '报告生成', '话术润色', '大纲填充'],
  },
  {
    id: 'tech',
    domainId: 'technology',
    role: 'tech',
    name: '💻 技术助手',
    status: 'idle',
    specialty: ['代码开发', '页面制作', '数据可视化', '技术方案'],
    capabilities: ['前端开发', '图表制作', 'API设计', '代码审核'],
  },
  {
    id: 'checker',
    domainId: 'quality',
    role: 'checker',
    name: '✅ 质控助手',
    status: 'idle',
    specialty: ['内容审核', '格式校对', '数据校验', '合规检查'],
    capabilities: ['错别字检查', '格式规范', 'bug测试', '风险提示'],
  },
]

const LEGACY_ASSISTANTS: Assistant[] = [
  {
    id: 'space-assistant',
    domainId: 'space',
    role: 'main',
    name: '🚀 太空探索助手',
    status: 'idle',
    specialty: ['航天工程', '天体物理', '火星殖民', '深空探测'],
    capabilities: ['知识问答', '研究报告', '数据分析', '趋势预测'],
  },
  {
    id: 'longevity-assistant',
    domainId: 'longevity',
    role: 'main',
    name: '🧬 长寿科技助手',
    status: 'idle',
    specialty: ['基因工程', '抗衰老医学', '营养学', '再生医学'],
    capabilities: ['健康咨询', '研究报告', '方案设计', '趋势分析'],
  },
  {
    id: 'ai-safety-assistant',
    domainId: 'ai-safety',
    role: 'main',
    name: '🛡️ AI安全助手',
    status: 'idle',
    specialty: ['AI对齐', '可解释AI', 'AI治理', '风险评估'],
    capabilities: ['安全分析', '伦理咨询', '政策解读', '趋势研究'],
  },
  {
    id: 'growth-assistant',
    domainId: 'growth',
    role: 'main',
    name: '📈 个人提升助手',
    status: 'idle',
    specialty: ['元学习', '习惯养成', '时间管理', '技能习得'],
    capabilities: ['学习规划', '习惯追踪', '效率优化', '技能指导'],
  },
]

class TaskManager {
  private tasks: Map<string, Task> = new Map()
  private assistants: Map<string, Assistant> = new Map(OPENCLAW_ASSISTANTS.map(a => [a.id, a]))
  private taskQueue: string[] = []
  private subTasks: Map<string, SubTask> = new Map()

  createTask(title: string, description: string, domainId: string, priority: TaskPriority = 'medium', executionMode: ExecutionMode = 'simple'): Task {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      domainId,
      priority,
      status: 'pending',
      createdAt: Date.now(),
      executionMode,
      subTasks: [],
    }
    this.tasks.set(task.id, task)
    this.taskQueue.push(task.id)
    this.assignTaskToAssistant(task.id)
    return task
  }

  createSubTask(taskId: string, assistantId: string, title: string, description: string, order: number): SubTask | null {
    const task = this.tasks.get(taskId)
    if (!task) return null

    const subTask: SubTask = {
      id: `subtask-${Date.now()}-${order}`,
      taskId,
      assistantId,
      title,
      description,
      status: 'pending',
      order,
    }

    this.subTasks.set(subTask.id, subTask)
    if (!task.subTasks) task.subTasks = []
    task.subTasks.push(subTask)
    return subTask
  }

  dispatchSubTask(subTaskId: string): boolean {
    const subTask = this.subTasks.get(subTaskId)
    if (!subTask) return false

    subTask.status = 'running'
    subTask.startedAt = Date.now()

    const assistant = this.assistants.get(subTask.assistantId)
    if (assistant) {
      assistant.status = 'busy'
      assistant.currentTask = subTask.taskId
    }

    const task = this.tasks.get(subTask.taskId)
    if (task) {
      task.status = 'running'
      task.startedAt = task.startedAt || Date.now()
    }

    return true
  }

  completeSubTask(subTaskId: string, result: string): boolean {
    const subTask = this.subTasks.get(subTaskId)
    if (!subTask) return false

    subTask.status = 'completed'
    subTask.result = result
    subTask.completedAt = Date.now()

    const assistant = this.assistants.get(subTask.assistantId)
    if (assistant) {
      assistant.status = 'idle'
      assistant.currentTask = undefined
    }

    this.checkTaskCompletion(subTask.taskId)
    return true
  }

  private checkTaskCompletion(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task || !task.subTasks) return

    const allCompleted = task.subTasks.every(st => st.status === 'completed')
    const anyFailed = task.subTasks.some(st => st.status === 'failed')

    if (anyFailed) {
      task.status = 'failed'
      task.completedAt = Date.now()
    } else if (allCompleted) {
      task.status = 'completed'
      task.completedAt = Date.now()
      task.result = this.aggregateResults(task)
    }
  }

  private aggregateResults(task: Task): string {
    if (!task.subTasks) return ''

    const results: string[] = []
    for (const subTask of task.subTasks.sort((a, b) => a.order - b.order)) {
      const assistant = this.assistants.get(subTask.assistantId)
      results.push(`\n=== ${assistant?.name || subTask.assistantId} ===\n${subTask.result || '无结果'}`)
    }

    return `✅ 任务已完成\n\n${results.join('\n')}`
  }

  private assignTaskToAssistant(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) return false

    const mainAssistant = this.assistants.get('main')
    if (mainAssistant && mainAssistant.status === 'idle') {
      mainAssistant.status = 'busy'
      mainAssistant.currentTask = taskId
      task.status = 'running'
      task.startedAt = Date.now()
      task.assignedTo = 'main'
      return true
    }

    return false
  }

  completeTask(taskId: string, result: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) return false

    task.status = 'completed'
    task.result = result
    task.completedAt = Date.now()

    if (task.assignedTo) {
      const assistant = this.assistants.get(task.assignedTo)
      if (assistant) {
        assistant.status = 'idle'
        assistant.currentTask = undefined
      }
    }

    this.processNextTask()
    return true
  }

  failTask(taskId: string, error: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) return false

    task.status = 'failed'
    task.result = error
    task.completedAt = Date.now()

    if (task.assignedTo) {
      const assistant = this.assistants.get(task.assignedTo)
      if (assistant) {
        assistant.status = 'idle'
        assistant.currentTask = undefined
      }
    }

    this.processNextTask()
    return true
  }

  private processNextTask(): void {
    for (const taskId of this.taskQueue) {
      const task = this.tasks.get(taskId)
      if (task && task.status === 'pending') {
        if (this.assignTaskToAssistant(taskId)) {
          return
        }
      }
    }
  }

  getTasks(): Task[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt)
  }

  getTaskById(taskId: string): Task | undefined {
    return this.tasks.get(taskId)
  }

  getTasksByDomain(domainId: string): Task[] {
    return this.getTasks().filter(t => t.domainId === domainId)
  }

  getActiveTasks(): Task[] {
    return this.getTasks().filter(t => t.status === 'running')
  }

  getPendingTasks(): Task[] {
    return this.getTasks().filter(t => t.status === 'pending')
  }

  getCompletedTasks(): Task[] {
    return this.getTasks().filter(t => t.status === 'completed')
  }

  getAssistants(): Assistant[] {
    return Array.from(this.assistants.values())
  }

  getOpenClawAssistants(): Assistant[] {
    return OPENCLAW_ASSISTANTS
  }

  getAssistantByDomain(domainId: string): Assistant | undefined {
    return Array.from(this.assistants.values()).find(a => a.domainId === domainId)
  }

  getAssistantStatus(): { idle: number; busy: number; offline: number } {
    const assistants = this.getAssistants()
    return {
      idle: assistants.filter(a => a.status === 'idle').length,
      busy: assistants.filter(a => a.status === 'busy').length,
      offline: assistants.filter(a => a.status === 'offline').length,
    }
  }

  autoSplitTask(taskId: string, mode: ExecutionMode): boolean {
    const task = this.tasks.get(taskId)
    if (!task) return false

    const subTaskConfigs = {
      serial: [
        { assistantId: 'researcher', title: '调研阶段', description: `搜集${task.title}相关的资料和数据` },
        { assistantId: 'creator', title: '创作阶段', description: `基于调研结果创作${task.title}的完整内容` },
        { assistantId: 'tech', title: '技术实现', description: `为内容制作可视化图表和配套代码` },
        { assistantId: 'checker', title: '质量把控', description: `审核内容准确性、格式规范、代码可运行性` },
      ],
      parallel: [
        { assistantId: 'researcher', title: '并行调研', description: `搜集${task.title}的相关素材` },
        { assistantId: 'creator', title: '并行创作', description: `撰写${task.title}的文案内容` },
        { assistantId: 'tech', title: '并行开发', description: `开发${task.title}的技术实现` },
        { assistantId: 'checker', title: '并行校验', description: `制定${task.title}的校验标准` },
      ],
      simple: [
        { assistantId: 'researcher', title: '调研分析', description: task.description },
        { assistantId: 'creator', title: '内容创作', description: task.description },
        { assistantId: 'tech', title: '技术实现', description: task.description },
        { assistantId: 'checker', title: '质量检查', description: task.description },
      ],
    }

    const configs = subTaskConfigs[mode]
    configs.forEach((config, index) => {
      this.createSubTask(task.id, config.assistantId, config.title, config.description, index)
    })

    return true
  }

  dispatchAllSubTasks(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || !task.subTasks) return false

    task.subTasks
      .sort((a, b) => a.order - b.order)
      .forEach(subTask => {
        setTimeout(() => {
          this.dispatchSubTask(subTask.id)
        }, 500)
      })

    return true
  }
}

export const taskManager = new TaskManager()

export const PRESET_TASKS = [
  {
    title: '本周研究进展汇总',
    description: '收集并整理本周在指定领域的重要研究进展，生成简洁的摘要报告',
    domainId: 'ai-safety',
    priority: 'medium' as TaskPriority,
    mode: 'serial' as ExecutionMode,
  },
  {
    title: '跨领域洞见分析',
    description: '分析长寿科技与AI安全的交叉点，寻找创新机会',
    domainId: 'longevity',
    priority: 'high' as TaskPriority,
    mode: 'simple' as ExecutionMode,
  },
  {
    title: '最新太空任务追踪',
    description: '跟踪SpaceX和NASA的最新任务动态，准备简报',
    domainId: 'space',
    priority: 'low' as TaskPriority,
    mode: 'parallel' as ExecutionMode,
  },
  {
    title: '个人提升策略制定',
    description: '根据当前学习目标，制定21天习惯养成计划',
    domainId: 'growth',
    priority: 'medium' as TaskPriority,
    mode: 'simple' as ExecutionMode,
  },
  {
    title: '行业趋势报告',
    description: '生成指定领域的月度趋势分析报告',
    domainId: 'ai-safety',
    priority: 'high' as TaskPriority,
    mode: 'serial' as ExecutionMode,
  },
]

export const EXECUTION_TEMPLATES = [
  {
    id: 'serial',
    name: '串行闭环模式',
    icon: '🔄',
    description: '适合报告、内容创作等有先后依赖的任务',
    hint: '调研→创作→技术→质控，依次执行',
  },
  {
    id: 'parallel',
    name: '并行协同模式',
    icon: '⚡',
    description: '适合网站开发、多模块项目等可同步推进的任务',
    hint: '四个助手同时工作，同步完成',
  },
  {
    id: 'simple',
    name: '极简通用模式',
    icon: '🎯',
    description: '适合日常轻量任务，快速完成',
    hint: '智能拆解，自动派发',
  },
]