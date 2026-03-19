'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bot, Sparkles, Database, RefreshCw, Settings, Plus, CheckCircle, Clock, ExternalLink, Loader2, Zap, BookOpen, GitBranch, MessageCircle, AlertCircle } from 'lucide-react'
import { DOMAINS, DOMAIN_CONFIGS } from '@/lib/collaboration'

interface SubAssistant {
  id: string
  domainId: string
  name: string
  role: string
  capabilities: string[]
  status: 'active' | 'inactive' | 'training'
  createdAt: number
}

interface KnowledgeStats {
  total: number
  verified: number
  sources: number
}

interface SyncStatus {
  connected: boolean
  lastSync?: number
  itemsSynced?: number
}

export default function SubAssistantPage() {
  const [assistants, setAssistants] = useState<SubAssistant[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({})
  const [knowledgeStats, setKnowledgeStats] = useState<Record<string, KnowledgeStats>>({})

  useEffect(() => {
    fetchAssistants()
    fetchSyncStatus()
    fetchKnowledgeStats()
  }, [])

  const fetchAssistants = async () => {
    try {
      const res = await fetch('/api/sub-assistant')
      const data = await res.json()
      if (data.success) {
        setAssistants(data.assistants || [])
      }
    } catch (err) {
      console.error('Failed to fetch assistants:', err)
    }
    setLoading(false)
  }

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch('/api/sync/xiaolongxia?action=status')
      const data = await res.json()
      if (data.success) {
        const statusMap: Record<string, SyncStatus> = {}
        data.status?.forEach((s: any) => {
          statusMap[s.domainId] = { connected: false, lastSync: s.lastSync, itemsSynced: s.knowledgeCount }
        })
        setSyncStatus(statusMap)
      }
    } catch (err) {
      console.error('Failed to fetch sync status:', err)
    }
  }

  const fetchKnowledgeStats = async () => {
    const stats: Record<string, KnowledgeStats> = {}
    for (const domain of DOMAINS) {
      try {
        const res = await fetch(`/api/knowledge-base?domainId=${domain.id}`)
        const data = await res.json()
        if (data.success) {
          const knowledge = data.knowledge || []
          stats[domain.id] = {
            total: knowledge.length,
            verified: knowledge.filter((k: any) => k.verified).length,
            sources: 0,
          }
        }
      } catch (err) {
        console.error('Failed to fetch knowledge stats:', err)
      }
    }
    setKnowledgeStats(stats)
  }

  const handleGenerateAll = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/sub-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_all' }),
      })
      const data = await res.json()
      if (data.success) {
        setAssistants(data.assistants || [])
        if (data.errors && data.errors.length > 0) {
          console.warn('Some assistants failed to generate:', data.errors)
        }
      } else {
        console.error('Generate all failed:', data.error)
      }
    } catch (err) {
      console.error('Failed to generate assistants:', err)
    }
    setGenerating(false)
    await fetchKnowledgeStats()
  }

  const handleGenerateOne = async (domainId: string) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/sub-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', domainId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchAssistants()
        await fetchKnowledgeStats()
      } else {
        console.error('Generate failed:', data.error)
      }
    } catch (err) {
      console.error('Failed to generate assistant:', err)
    }
    setGenerating(false)
  }

  const handleSync = async (domainId: string, direction: 'to' | 'from' | 'bidirectional') => {
    const action = direction === 'to' ? 'sync_to' : direction === 'from' ? 'sync_from' : 'sync_bidirectional'
    try {
      await fetch('/api/sync/xiaolongxia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, domainId }),
      })
      await fetchSyncStatus()
    } catch (err) {
      console.error('Sync failed:', err)
    }
  }

  const domainColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    space: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', gradient: 'from-blue-500 to-cyan-500' },
    longevity: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800', gradient: 'from-green-500 to-emerald-500' },
    'ai-safety': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', gradient: 'from-purple-500 to-pink-500' },
    growth: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', gradient: 'from-orange-500 to-amber-500' },
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">领域子助手体系</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">四大领域专属 AI 助手管理</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                一键生成子助手
              </h2>
              <p className="text-purple-100 mb-4">
                自动完成子助手人设定义、工具权限配置、知识库绑定，无需手动设置
              </p>
            </div>
            <button
              onClick={handleGenerateAll}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
              一键生成全部
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            {DOMAINS.map((domain) => {
              const colors = domainColors[domain.id]
              const hasAssistant = assistants.some(a => a.domainId === domain.id)
              return (
                <div
                  key={domain.id}
                  className="bg-white/10 backdrop-blur rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{domain.icon}</span>
                    <span className="font-medium">{domain.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasAssistant ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-green-200">已生成</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-300" />
                        <span className="text-sm text-yellow-200">待生成</span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">知识库管理</h2>
            </div>

            <div className="space-y-3">
              {DOMAINS.map((domain) => {
                const colors = domainColors[domain.id]
                const stats = knowledgeStats[domain.id] || { total: 0, verified: 0, sources: 0 }
                return (
                  <Link
                    key={domain.id}
                    href={`/domain/${domain.id}`}
                    className={`block p-4 rounded-xl border ${colors.border} hover:${colors.bg} transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{domain.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{domain.name}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{stats.total} 条知识</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {stats.verified} 已验证
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <RefreshCw className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">小龙虾双向同步</h2>
            </div>

            <div className="space-y-3">
              {DOMAINS.map((domain) => {
                const colors = domainColors[domain.id]
                const status = syncStatus[domain.id]
                return (
                  <div
                    key={domain.id}
                    className={`p-4 rounded-xl border ${colors.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{domain.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{domain.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSync(domain.id, 'to')}
                          className={`p-2 rounded-lg ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity text-xs`}
                          title="同步到小龙虾"
                        >
                          <GitBranch className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleSync(domain.id, 'bidirectional')}
                          className={`p-2 rounded-lg ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity text-xs`}
                          title="双向同步"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {status?.connected ? '已连接' : '未连接'} · {status?.itemsSynced || 0} 条已同步
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bot className="h-5 w-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">子助手详情</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {DOMAINS.map((domain) => {
              const colors = domainColors[domain.id]
              const assistant = assistants.find(a => a.domainId === domain.id)
              const config = DOMAIN_CONFIGS[domain.id]

              return (
                <div
                  key={domain.id}
                  className={`rounded-xl border ${colors.border} overflow-hidden`}
                >
                  <div className={`bg-gradient-to-r ${colors.gradient} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{domain.icon}</span>
                        <div>
                          <h3 className="font-semibold">{config?.assistantName || domain.name}</h3>
                          <p className="text-xs text-white/80">{config?.assistantRole}</p>
                        </div>
                      </div>
                      {assistant ? (
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs">已激活</span>
                      ) : (
                        <button
                          onClick={() => handleGenerateOne(domain.id)}
                          disabled={generating}
                          className="px-3 py-1 bg-white text-sm font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                        >
                          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : '生成'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">核心知识</h4>
                      <div className="flex flex-wrap gap-1">
                        {config?.knowledgeCore.slice(0, 5).map((k) => (
                          <span key={k} className={`px-2 py-0.5 ${colors.bg} ${colors.text} rounded text-xs`}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">专属能力</h4>
                      <div className="flex flex-wrap gap-1">
                        {config?.exclusiveCapabilities.slice(0, 4).map((c) => (
                          <span key={c} className={`px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs`}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {assistant && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {assistant.capabilities.length} 项能力
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(assistant.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">功能说明</h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                <li>• <strong>一键生成</strong>：自动完成子助手的完整配置，包括人设、权限、知识库绑定</li>
                <li>• <strong>知识库管理</strong>：支持多源内容采集、智能分块、RAG检索增强</li>
                <li>• <strong>小龙虾同步</strong>：与小龙虾系统双向同步，保持多端数据一致</li>
                <li>• <strong>RAG增强</strong>：对话时实时检索知识库，显著降低幻觉发生率</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}