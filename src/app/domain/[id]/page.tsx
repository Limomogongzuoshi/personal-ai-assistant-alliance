'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, CheckCircle, Clock, Share2, Loader2, Dna } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'

interface KnowledgeItem {
  id: string
  domainId: string
  title: string
  content: string
  source: string
  timestamp: number
  verified: boolean
  tags: string[]
}

export default function DomainPage({ params }: { params: Promise<{ id: string }> }) {
  const [domainId, setDomainId] = useState<string | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newSource, setNewSource] = useState('')

  useEffect(() => {
    params.then((p) => {
      setDomainId(p.id)
      fetchKnowledge(p.id)
    })
  }, [params])

  const fetchKnowledge = (id: string) => {
    fetch(`/api/collaboration/knowledge/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setKnowledge(data.knowledge || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const handleAddKnowledge = async () => {
    if (!newTitle.trim() || !domainId) return

    await fetch(`/api/collaboration/knowledge/${domainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        content: newContent,
        source: newSource,
      }),
    })

    setNewTitle('')
    setNewContent('')
    setNewSource('')
    setShowAdd(false)
    fetchKnowledge(domainId)
  }

  const handleVerify = async (itemId: string) => {
    if (!domainId) return
    await fetch(`/api/collaboration/knowledge/${domainId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    fetchKnowledge(domainId)
  }

  if (loading || !domainId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const domain = DOMAINS.find((d) => d.id === domainId)
  if (!domain) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">领域不存在</p>
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-600">返回控制台</Link>
      </div>
    )
  }

  const domainColors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    space: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/50' },
    longevity: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800', hover: 'hover:bg-green-50 dark:hover:bg-green-900/50' },
    'ai-safety': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/50' },
    growth: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/50' },
  }
  const colors = domainColors[domainId]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={`bg-white dark:bg-gray-800 shadow-sm border-b ${colors.border}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{domain.icon}</span>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{domain.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{domain.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {domain.specialties.map((specialty) => (
              <span
                key={specialty}
                className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm`}
              >
                {specialty}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg font-medium transition-colors`}
          >
            <Plus className="h-4 w-4" /> 添加知识
          </button>
        </div>

        {showAdd && (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border ${colors.border} p-6`}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">添加新知识</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="知识标题"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="详细描述..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="信息来源"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddKnowledge}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {knowledge.length === 0 ? (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border ${colors.border} p-8 text-center`}>
              <p className="text-gray-500 dark:text-gray-400">暂无知识条目，点击添加开始构建</p>
            </div>
          ) : (
            knowledge.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border ${colors.border} p-6 ${colors.hover} transition-colors`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {item.verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  </div>
                  {!item.verified && (
                    <button
                      onClick={() => handleVerify(item.id)}
                      className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-xs`}
                    >
                      验证
                    </button>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{item.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>来源: {item.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(item.timestamp).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 ${colors.bg} ${colors.text} rounded text-xs`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}