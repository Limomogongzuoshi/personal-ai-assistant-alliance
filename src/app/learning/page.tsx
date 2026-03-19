'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Circle, Trophy, Flame, Target, Loader2, BookOpen, Video, FileText, Award, ChevronRight } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'
import { LEARNING_PATHS, LearningPath, LearningProgress } from '@/lib/learning-paths'

interface ProgressData {
  progress: LearningProgress[]
  totalXp: number
  leaderboard: { domainId: string; totalXp: number }[]
}

export default function LearningPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ProgressData | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>('space')

  useEffect(() => {
    fetch('/api/learning/progress')
      .then((res) => res.json())
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const currentProgress = data?.progress.find((p) => p.domainId === selectedDomain)
  const path = LEARNING_PATHS[selectedDomain]
  const domain = DOMAINS.find((d) => d.id === selectedDomain)

  const domainColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    space: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', gradient: 'from-blue-500 to-cyan-500' },
    longevity: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800', gradient: 'from-green-500 to-emerald-500' },
    'ai-safety': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', gradient: 'from-purple-500 to-pink-500' },
    growth: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', gradient: 'from-orange-500 to-amber-500' },
  }
  const colors = domainColors[selectedDomain]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">学习路径</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">系统化提升专业知识</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {DOMAINS.map((d) => {
            const dColors = domainColors[d.id]
            const dProgress = data?.progress?.find((p) => p.domainId === d.id)
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedDomain === d.id
                    ? `${dColors.border} ${dColors.bg}`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-3xl mb-2">{d.icon}</div>
                <div className="font-semibold text-gray-900 dark:text-white">{d.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{dProgress?.totalXp || 0} XP</div>
              </button>
            )
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{domain?.icon} {path?.stages[0]?.name || '学习路径'}</h2>
              <p className="text-blue-100">完成全部路径可获得 {path?.totalXp || 0} XP</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{currentProgress?.totalXp || 0}</div>
                <div className="text-sm text-blue-100">总 XP</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{currentProgress?.streak || 0}</div>
                <div className="text-sm text-blue-100">连续天数</div>
              </div>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all"
              style={{ width: `${Math.min(100, ((currentProgress?.totalXp || 0) / (path?.totalXp || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">本周目标</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentProgress?.weeklyGoal || 100} XP</p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className={`bg-amber-500 rounded-full h-3 transition-all`}
                style={{ width: `${Math.min(100, ((currentProgress?.weeklyProgress || 0) / (currentProgress?.weeklyGoal || 100)) * 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              已完成 {currentProgress?.weeklyProgress || 0} / {currentProgress?.weeklyGoal || 100} XP
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Flame className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">学习连续</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">坚持学习 {currentProgress?.streak || 0} 天</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              每天学习保持连续记录，解锁特殊奖励！
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">排行榜</h3>
              </div>
            </div>
            <div className="space-y-2">
              {data?.leaderboard.slice(0, 3).map((entry, index) => {
                const d = DOMAINS.find((domain) => domain.id === entry.domainId)
                return (
                  <div key={entry.domainId} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-amber-700 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span>{d?.icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{d?.name}</span>
                    <span className="text-sm text-gray-400 ml-auto">{entry.totalXp} XP</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">学习阶段</h2>
          {path?.stages.map((stage, stageIndex) => {
            const isCompleted = currentProgress?.completedStages.includes(stageIndex)
            const isCurrent = currentProgress?.currentStage === stageIndex
            return (
              <div
                key={stage.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border ${isCompleted ? 'border-green-200 dark:border-green-800' : isCurrent ? `${colors.border}` : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : isCurrent ? colors.bg : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {isCompleted ? (
                          <CheckCircle className={`h-6 w-6 ${colors.text}`} />
                        ) : (
                          <Circle className={`h-6 w-6 ${colors.text}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {stageIndex + 1}. {stage.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">{stage.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-400 dark:text-gray-500">⏱️ {stage.duration}</span>
                          <span className="text-gray-400 dark:text-gray-500">📚 {stage.objectives.length} 目标</span>
                          <span className="text-gray-400 dark:text-gray-500">🏆 {stage.milestones.reduce((sum, m) => sum + m.xp, 0)} XP</span>
                        </div>
                      </div>
                    </div>
                    {isCurrent && !isCompleted && (
                      <span className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm font-medium`}>
                        进行中
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                        已完成
                      </span>
                    )}
                  </div>

                  <div className="ml-16 space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">学习目标</h4>
                    <ul className="space-y-1">
                      {stage.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-blue-500">→</span> {obj}
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mt-4">里程碑</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {stage.milestones.map((milestone) => {
                        const isMilestoneCompleted = currentProgress?.completedMilestones.includes(milestone.id)
                        return (
                          <div
                            key={milestone.id}
                            className={`p-3 rounded-lg border ${
                              isMilestoneCompleted
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {milestone.title}
                              </span>
                              {isMilestoneCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <span className="text-xs text-gray-500">{milestone.xp} XP</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{milestone.description}</p>
                          </div>
                        )
                      })}
                    </div>

                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mt-4">学习资源</h4>
                    <div className="flex flex-wrap gap-2">
                      {stage.resources.map((resource, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.border} ${colors.bg}`}
                        >
                          {resource.type === 'video' && <Video className={`h-4 w-4 ${colors.text}`} />}
                          {resource.type === 'article' && <FileText className={`h-4 w-4 ${colors.text}`} />}
                          {resource.type === 'course' && <BookOpen className={`h-4 w-4 ${colors.text}`} />}
                          {resource.type === 'book' && <BookOpen className={`h-4 w-4 ${colors.text}`} />}
                          <span className={`text-sm ${colors.text}`}>{resource.title}</span>
                          {resource.duration && (
                            <span className="text-xs text-gray-400">{resource.duration}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}