'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'

interface CrossDomainInsight {
  id: string
  domains: string[]
  title: string
  content: string
  timestamp: number
  confidence: number
}

export default function CollaborationPage() {
  const [insights, setInsights] = useState<CrossDomainInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/collaboration/insights')
      .then((res) => res.json())
      .then((data) => {
        setInsights(data.insights || [])
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

  const filteredInsights = selectedDomains.length > 0
    ? insights.filter((i) => selectedDomains.some((d) => i.domains.includes(d)))
    : insights

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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">跨域协作空间</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">跨领域知识融合与创新</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-6 w-6" />
            <h2 className="text-xl font-bold">跨域洞见</h2>
          </div>
          <p className="text-indigo-100 mb-4">
            不同领域知识交汇产生的创新想法。来自太空的灵感可能解决健康问题，AI 安全的思路可能启发个人成长。
          </p>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomains(
                    selectedDomains.includes(domain.id)
                      ? selectedDomains.filter((d) => d !== domain.id)
                      : [...selectedDomains, domain.id]
                  )
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedDomains.includes(domain.id)
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {domain.icon} {domain.name}
              </button>
            ))}
            {selectedDomains.length > 0 && (
              <button
                onClick={() => setSelectedDomains([])}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredInsights.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">暂无跨域洞见，继续积累各领域知识</p>
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex gap-2">
                      {insight.domains.map((d) => {
                        const domain = DOMAINS.find((domain) => domain.id === d)
                        return domain ? (
                          <span
                            key={d}
                            className={`px-2 py-1 rounded-full text-xs ${domainColors[d]}`}
                          >
                            {domain.icon} {domain.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(insight.confidence * 100)}% 置信度
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{insight.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{insight.content}</p>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/collaboration/create?domains=${insight.domains.join(',')}`}
                    className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600"
                  >
                    深化协作 <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {new Date(insight.timestamp).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">协作框架</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">📅 定期分享机制</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                每周期（7天）各领域助手汇总学习成果，其他领域助手可提问和补充。
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">✅ 交叉验证流程</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                重要信息需至少2个领域验证，确保信息来源可靠、结论准确。
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">🤝 协作创作</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                支持跨领域知识融合，多个助手协同产出综合性学习材料和研究成果。
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">🔄 持续迭代</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                定期评估协作效果，优化信息分享和验证流程，建立明确评估指标。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}