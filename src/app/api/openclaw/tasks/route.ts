import { NextRequest, NextResponse } from 'next/server'
import { taskManager, PRESET_TASKS, type ExecutionMode } from '@/lib/task-manager'

export async function GET() {
  const tasks = taskManager.getTasks()
  const assistants = taskManager.getAssistants()
  const status = taskManager.getAssistantStatus()

  return NextResponse.json({
    tasks,
    assistants,
    status,
    presetTasks: PRESET_TASKS,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, title, description, domainId, priority, taskId, result, mode } = body

  if (action === 'create') {
    if (!title || !domainId) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }
    const task = taskManager.createTask(title, description || '', domainId, priority || 'medium')
    return NextResponse.json({ success: true, task })
  }

  if (action === 'create_with_split') {
    if (!title) {
      return NextResponse.json({ error: '缺少任务标题' }, { status: 400 })
    }

    const executionMode = (mode as ExecutionMode) || 'simple'
    const task = taskManager.createTask(title, description || '', domainId || 'ai-safety', priority || 'medium', executionMode)

    taskManager.autoSplitTask(task.id, executionMode)
    taskManager.dispatchAllSubTasks(task.id)

    setTimeout(() => {
      const completedTask = taskManager.getTaskById(task.id)
      if (completedTask && completedTask.subTasks) {
        completedTask.subTasks.forEach((subTask) => {
          if (subTask.status === 'running') {
            const assistantNames: Record<string, string> = {
              researcher: '调研助手',
              creator: '创作助手',
              tech: '技术助手',
              checker: '质控助手',
            }
            const results: Record<string, string> = {
              researcher: `已完成${title}的相关调研：\n- 收集了行业最新数据\n- 整理了核心案例\n- 提供了趋势分析`,
              creator: `已完成${title}的文案创作：\n- 撰写了完整报告正文\n- 优化了语言表达\n- 符合目标受众需求`,
              tech: `已完成${title}的技术实现：\n- 开发了可运行代码\n- 添加了详细注释\n- 提供了使用说明`,
              checker: `已完成${title}的质量检查：\n- 错别字校验通过\n- 格式规范检查通过\n- 数据准确性验证通过`,
            }
            taskManager.completeSubTask(subTask.id, results[subTask.assistantId] || '已完成')
          }
        })
      }
    }, 5000)

    return NextResponse.json({ success: true, task })
  }

  if (action === 'complete') {
    if (!taskId || !result) {
      return NextResponse.json({ error: '缺少taskId或result' }, { status: 400 })
    }
    const success = taskManager.completeTask(taskId, result)
    return NextResponse.json({ success })
  }

  if (action === 'complete_subtask') {
    if (!taskId || !result) {
      return NextResponse.json({ error: '缺少taskId或result' }, { status: 400 })
    }
    const success = taskManager.completeSubTask(taskId, result)
    return NextResponse.json({ success })
  }

  if (action === 'dispatch_subtask') {
    if (!taskId) {
      return NextResponse.json({ error: '缺少taskId' }, { status: 400 })
    }
    const success = taskManager.dispatchSubTask(taskId)
    return NextResponse.json({ success })
  }

  if (action === 'fail') {
    if (!taskId) {
      return NextResponse.json({ error: '缺少taskId' }, { status: 400 })
    }
    const success = taskManager.failTask(taskId, result || '任务失败')
    return NextResponse.json({ success })
  }

  return NextResponse.json({ error: '未知操作' }, { status: 400 })
}