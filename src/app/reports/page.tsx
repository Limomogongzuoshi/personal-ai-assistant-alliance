'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Loader2, ChevronRight, TrendingUp } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'

interface WeeklyReport {
  domainId: string
  weekNumber: number
  content: string
  keyInsights: string[]
  nextWeekPlans: string[]
}

export default function ReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/collaboration/reports')
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || [])
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

  const domainColors: Record<string, string> = {
    space: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    longevity: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300',
    'ai-safety': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
    growth: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">周报汇总</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">各领域定期学习成果分享</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-6 w-6" />
            <h2 className="text-xl font-bold">定期学习成果分享</h2>
          </div>
          <p className="text-amber-100">
            每周期（7天）各领域助手汇总学习进展，促进知识共享与相互学习。
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              暂无周报记录
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              周报将在每个周期结束时自动生成
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const domain = DOMAINS.find((d) => d.id === report.domainId)
              return (
                <div
                  key={`${report.domainId}-${report.weekNumber}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-2xl transition-all"
                  onClick={() => setSelectedWeek(selectedWeek === report.weekNumber ? null : report.weekNumber)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {domain && (
                        <span className="text-3xl">{domain.icon}</span>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {domain?.name || report.domainId} - 第 {report.weekNumber} 周
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {report.keyInsights.length} 个关键洞见
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        selectedWeek === report.weekNumber ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {selectedWeek === report.weekNumber && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">本周总结</h4>
                        <p className="text-gray-600 dark:text-gray-300">{report.content}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">关键洞见</h4>
                        <ul className="space-y-1">
                          {report.keyInsights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">下周计划</h4>
                        <ul className="space-y-1">
                          {report.nextWeekPlans.map((plan, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                              <span className="text-blue-500">→</span>
                              {plan}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}