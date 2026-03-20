'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Plus, CheckCircle, XCircle, Clock, Loader2, Zap, Rocket, Dna, Shield, TrendingUp, User, Brain, ListTodo, Sparkles, GitBranch, ArrowRight, RefreshCw, Cpu, FileText, Code, ShieldCheck } from 'lucide-react'
import { OPENCLAW_ASSISTANTS, EXECUTION_TEMPLATES, PRESET_TASKS, type ExecutionMode, type Task, type SubTask, type Assistant } from '@/lib/task-manager'

const assistantIcons: Record<string, React.ReactNode> = {
  main: <Brain className="h-5 w-5" />,
  researcher: <Rocket className="h-5 w-5" />,
  creator: <FileText className="h-5 w-5" />,
  tech: <Code className="h-5 w-5" />,
  checker: <ShieldCheck className="h-5 w-5" />,
}

const assistantColors: Record<string, { bg: string; text: string; border: string }> = {
  main: { bg: 'bg-gradient-to-r from-blue-600 to-purple-600', text: 'text-white', border: 'border-blue-500' },
  researcher: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  creator: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  tech: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  checker: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300' },
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-300' },
}

export default function OpenClawPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [status, setStatus] = useState<{ idle: number; busy: number; offline: number }>({ idle: 0, busy: 0, offline: 0 })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedMode, setSelectedMode] = useState<ExecutionMode>('simple')
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
  const [executingTasks, setExecutingTasks] = useState<Set<string>>(new Set())
  const [showFlow, setShowFlow] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/openclaw/tasks')
      const data = await response.json()
      setTasks(data.tasks || [])
      setAssistants(data.assistants || OPENCLAW_ASSISTANTS)
      setStatus(data.status || { idle: 0, busy: 0, offline: 0 })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setAssistants(OPENCLAW_ASSISTANTS)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateTask = async () => {
    if (!newTask.title) return
    setCreating(true)

    try {
      const response = await fetch('/api/openclaw/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_with_split',
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          mode: selectedMode,
        }),
      })

      const data = await response.json()
      if (data.task) {
        setShowFlow(data.task.id)
      }

      setShowCreate(false)
      setNewTask({ title: '', description: '', priority: 'medium' })
      fetchData()

      setTimeout(() => {
        setExecutingTasks(prev => new Set([...prev, data.task?.id]))
      }, 1000)

      setTimeout(() => {
        setExecutingTasks(prev => {
          const next = new Set(prev)
          next.delete(data.task?.id)
          return next
        })
        fetchData()
      }, 8000)

    } catch (error) {
      console.error('Failed to create task:', error)
    }

    setCreating(false)
  }

  const handlePresetTask = async (preset: typeof PRESET_TASKS[0]) => {
    setCreating(true)

    try {
      const response = await fetch('/api/openclaw/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_with_split',
          title: preset.title,
          description: preset.description,
          priority: preset.priority,
          mode: preset.mode,
        }),
      })

      const data = await response.json()
      if (data.task) {
        setShowFlow(data.task.id)
      }

      fetchData()

      setTimeout(() => {
        setExecutingTasks(prev => new Set([...prev, data.task?.id]))
      }, 1000)

      setTimeout(() => {
        setExecutingTasks(prev => {
          const next = new Set(prev)
          next.delete(data.task?.id)
          return next
        })
        fetchData()
      }, 8000)

    } catch (error) {
      console.error('Failed to create task:', error)
    }

    setCreating(false)
  }

  const getSubTaskStatus = (task: Task, assistantId: string) => {
    if (!task.subTasks) return null
    return task.subTasks.find(st => st.assistantId === assistantId)
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'serial': return <RefreshCw className="h-4 w-4" />
      case 'parallel': return <Zap className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">OpenClaw 控制台</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">主头脑 + 4子助手 全自动化任务执行</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6" />
            <h2 className="text-xl font-bold">🚀 OpenClaw 主头脑指挥中心</h2>
          </div>
          <p className="text-blue-100 mb-4">
            主头脑自动拆解任务，调度4个专属子助手（调研、创作、技术、质控）协同执行，全流程无人干预。
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{status.idle}</div>
              <div className="text-sm text-blue-100">空闲</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{status.busy}</div>
              <div className="text-sm text-blue-100">执行中</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-sm text-blue-100">已完成</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'running').length}</div>
              <div className="text-sm text-blue-100">进行中</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5" /> OpenClaw 架构图
          </h3>
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2">
            <div className={`flex-shrink-0 p-4 rounded-xl ${assistantColors.main.bg} text-white text-center min-w-[140px]`}>
              <Brain className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">主头脑</div>
              <div className="text-xs opacity-80">任务调度中心</div>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-gray-400 font-medium">4个子助手</div>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />

            <div className="flex items-center gap-3 flex-shrink-0">
              {OPENCLAW_ASSISTANTS.slice(1).map((assistant) => (
                <div
                  key={assistant.id}
                  className={`p-3 rounded-xl border ${assistantColors[assistant.role].border} ${assistantColors[assistant.role].bg} text-center min-w-[100px]`}
                >
                  <div className={`mx-auto mb-1 ${assistantColors[assistant.role].text}`}>
                    {assistantIcons[assistant.role]}
                  </div>
                  <div className={`text-xs font-medium ${assistantColors[assistant.role].text}`}>
                    {assistant.name.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div><span className="font-medium">🔍 调研助手</span>：资料搜集、数据查证、行业调研、案例整理</div>
              <div><span className="font-medium">✍️ 创作助手</span>：文案撰写、内容创作、报告填充、脚本输出</div>
              <div><span className="font-medium">💻 技术助手</span>：代码开发、页面制作、数据可视化、技术方案</div>
              <div><span className="font-medium">✅ 质控助手</span>：内容审核、格式校对、数据校验、合规检查</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5" /> 执行模式选择
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {EXECUTION_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedMode(template.id as ExecutionMode)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMode === template.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{template.name}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{template.description}</p>
                <p className="text-xs text-purple-600 dark:text-purple-300">{template.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5" /> 快速任务
            </h3>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-lg text-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> 新建任务
            </button>
          </div>

          {showCreate && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">创建自动化任务</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="任务标题，如：2026年AI Agent行业发展分析报告"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="任务详细描述（可选）"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
                <div className="flex gap-2 items-center">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">低优先级</option>
                    <option value="medium">中优先级</option>
                    <option value="high">高优先级</option>
                    <option value="urgent">紧急</option>
                  </select>
                  <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                    执行模式：{EXECUTION_TEMPLATES.find(t => t.id === selectedMode)?.name}
                  </div>
                </div>
                <button
                  onClick={handleCreateTask}
                  disabled={creating || !newTask.title}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  启动自动化任务
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_TASKS.map((preset, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{preset.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{preset.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[preset.priority].bg} ${priorityColors[preset.priority].text}`}>
                      {preset.priority === 'low' ? '低' : preset.priority === 'medium' ? '中' : preset.priority === 'high' ? '高' : '紧急'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      {getModeIcon(preset.mode)}
                      {EXECUTION_TEMPLATES.find(t => t.id === preset.mode)?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePresetTask(preset)}
                    disabled={creating}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" /> 执行
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" /> 任务执行记录
          </h3>

          {showFlow && (() => {
            const task = tasks.find(t => t.id === showFlow)
            if (task && task.subTasks && task.subTasks.length > 0) {
              return (
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-6 text-white">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" /> 任务执行流程：{task.title}
                  </h4>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <div className={`flex-shrink-0 px-4 py-2 rounded-lg ${executingTasks.has(task.id) ? 'bg-white/30' : 'bg-white/10'}`}>
                      <div className="text-xs opacity-80">主头脑</div>
                      <div className="font-medium">任务拆解</div>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    {task.subTasks.sort((a, b) => a.order - b.order).map((subTask, idx) => (
                      <div key={subTask.id} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 px-4 py-2 rounded-lg ${
                          subTask.status === 'completed' ? 'bg-green-500/30' :
                          subTask.status === 'running' ? 'bg-yellow-500/30 animate-pulse' :
                          'bg-white/10'
                        }`}>
                          <div className="text-xs opacity-80">
                            {subTask.assistantId === 'researcher' ? '🔍' :
                             subTask.assistantId === 'creator' ? '✍️' :
                             subTask.assistantId === 'tech' ? '💻' : '✅'}
                          </div>
                          <div className="font-medium text-sm">{subTask.title}</div>
                        </div>
                        {idx < (task.subTasks?.length || 0) - 1 && <ArrowRight className="h-4 w-4 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          })()}

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">暂无任务执行记录</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">选择上方快速任务开始体验自动化执行</p>
              </div>
            ) : (
              tasks.slice(0, 10).map((task) => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {task.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                        {task.status === 'running' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                        {task.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{task.description || '无详细描述'}</p>

                      {task.subTasks && task.subTasks.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {task.subTasks.sort((a, b) => a.order - b.order).map((subTask) => {
                            const assistant = OPENCLAW_ASSISTANTS.find(a => a.id === subTask.assistantId)
                            return (
                              <div
                                key={subTask.id}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                  subTask.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' :
                                  subTask.status === 'running' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  subTask.status === 'failed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                }`}
                              >
                                {subTask.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                                {subTask.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                                <span>{assistant?.name.split(' ')[0] || subTask.assistantId}</span>
                                <span className="text-gray-400">·</span>
                                <span>{subTask.title}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {task.result && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {task.result}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                        {task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : task.priority === 'high' ? '高' : '紧急'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                        task.executionMode === 'serial' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' :
                        task.executionMode === 'parallel' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {getModeIcon(task.executionMode || 'simple')}
                        {task.executionMode === 'serial' ? '串行' : task.executionMode === 'parallel' ? '并行' : '极简'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}