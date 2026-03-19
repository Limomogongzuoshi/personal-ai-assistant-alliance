'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, MessageCircle, ArrowRight, Loader2, Globe } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'

interface Connection {
  id: string
  name: string
  domains: string[]
  status: 'connected' | 'pending' | 'explored'
  lastInteraction: string
  description: string
}

const sampleConnections: Connection[] = [
  {
    id: '1',
    name: '李明的 AI 助手',
    domains: ['space', 'ai-safety'],
    status: 'connected',
    lastInteraction: '2024-01-15',
    description: '专注于航天技术和 AI 安全研究',
  },
  {
    id: '2',
    name: '王华的智能团队',
    domains: ['longevity', 'growth'],
    status: 'pending',
    lastInteraction: '2024-01-14',
    description: '健康科技和个人发展专家',
  },
]

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newConnectionName, setNewConnectionName] = useState('')
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [adding, setAdding] = useState(false)

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/a2a/connections')
      const data = await res.json()
      setConnections(data.connections?.length > 0 ? data.connections : sampleConnections)
    } catch {
      setConnections(sampleConnections)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchConnections()
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

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(d => d !== domainId)
        : [...prev, domainId]
    )
  }

  const handleAddConnection = async () => {
    if (!newConnectionName.trim() || selectedDomains.length === 0) return

    setAdding(true)
    try {
      const res = await fetch('/api/a2a/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_connection',
          name: newConnectionName,
          domains: selectedDomains,
          description: '新连接的 AI 助手',
        }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchConnections()
        setNewConnectionName('')
        setSelectedDomains([])
        setShowAdd(false)
      }
    } catch (error) {
      console.error('Failed to add connection:', error)
    }
    setAdding(false)
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    connected: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300' },
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-300' },
    explored: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">A2A 连接</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assistant-to-Assistant 连接管理</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-6 w-6" />
            <h2 className="text-xl font-bold">跨个体知识网络</h2>
          </div>
          <p className="text-pink-100 mb-4">
            通过 A2A 协议连接其他 AI 助手系统，实现跨个体、跨领域的知识协作网络。
          </p>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors"
          >
            <Plus className="h-4 w-4" /> 添加连接
          </button>
        </div>

        {showAdd && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">发现并连接新 AI 助手</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="AI 助手名称或 ID"
                value={newConnectionName}
                onChange={(e) => setNewConnectionName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  共享领域
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map((domain) => (
                    <label
                      key={domain.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDomains.includes(domain.id)
                          ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(domain.id)}
                        onChange={() => handleDomainToggle(domain.id)}
                        className="rounded"
                      />
                      <span>{domain.icon} {domain.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddConnection}
                disabled={adding || !newConnectionName.trim() || selectedDomains.length === 0}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {adding ? '添加中...' : '发送连接请求'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">A2A 协议说明</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">🔍</div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">发现机制</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                自动识别拥有类似 AI 助手系统的学习者和研究人员
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">📡</div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">标准化通信</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                基于 A2A 协议实现不同助手系统间的标准化信息交换
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">协作项目</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                促进跨领域合作，实现不同知识体系的融合创新
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">已连接 AI 助手</h3>
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{conn.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{conn.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${statusColors[conn.status].bg} ${statusColors[conn.status].text}`}>
                  {conn.status === 'connected' ? '已连接' : conn.status === 'pending' ? '待确认' : '已探索'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {conn.domains.map((d) => {
                  const domain = DOMAINS.find((domain) => domain.id === d)
                  return domain ? (
                    <span key={d} className={`px-2 py-1 rounded-full text-xs ${domainColors[d]}`}>
                      {domain.icon} {domain.name}
                    </span>
                  ) : null
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  最后交互: {conn.lastInteraction}
                </span>
                <button
                  onClick={() => alert(`正在启动与 ${conn.name} 的对话...`)}
                  className="flex items-center gap-1 text-sm text-pink-500 hover:text-pink-600"
                >
                  <MessageCircle className="h-4 w-4" /> 开始对话
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}