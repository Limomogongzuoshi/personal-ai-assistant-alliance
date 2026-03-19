'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Send, Loader2, CheckCircle, Clock, XCircle, Eye, Heart, Settings, FileText, BookOpen, Globe, MessageSquare } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  domainId: string
  createdAt: number
  author: string
}

interface PublishRecord {
  id: string
  articleId: string
  platform: string
  status: string
  publishedAt?: number
  url?: string
  views?: number
  likes?: number
}

interface PlatformConfig {
  platform: string
  enabled: boolean
  autoPublish: boolean
}

const platformNames: Record<string, string> = {
  zhihu: '知乎',
  wechat: '公众号',
  twitter: 'Twitter',
  community: '社群',
}

const platformColors: Record<string, { bg: string; text: string }> = {
  zhihu: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300' },
  wechat: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300' },
  twitter: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-300' },
  community: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300' },
}

export default function ContentPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [publishQueue, setPublishQueue] = useState<PublishRecord[]>([])
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, PlatformConfig>>({})
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [activeTab, setActiveTab] = useState<'articles' | 'queue' | 'settings'>('articles')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    domainId: 'ai-safety',
    tags: '',
  })

  const fetchData = async () => {
    try {
      const response = await fetch('/api/content')
      const data = await response.json()
      setArticles(data.articles || [])
      setPublishQueue(data.publishQueue || [])
      setPlatformConfigs(data.platformConfigs || {})
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!formData.title || !formData.content) return

    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        domainId: formData.domainId,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    })

    setFormData({ title: '', content: '', excerpt: '', domainId: 'ai-safety', tags: '' })
    setShowEditor(false)
    fetchData()
  }

  const handlePublish = async (articleId: string, platform: string) => {
    setPublishing(`${articleId}-${platform}`)
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          articleId,
          platform,
        }),
      })
      fetchData()
    } catch (error) {
      console.error('Publish failed:', error)
    }
    setPublishing(null)
  }

  const handleDelete = async (articleId: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', articleId }),
    })
    fetchData()
  }

  const handleTogglePlatform = async (platform: string, enabled: boolean) => {
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_config',
        platform,
        config: { enabled },
      }),
    })
    fetchData()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">内容发布中心</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">一站式内容创作与多平台发布</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white mb-8">
          <h2 className="text-xl font-bold mb-2">📝 协作写稿与自动发布</h2>
          <p className="text-blue-100 mb-4">
            写完文章后，一键同步发布到知乎、公众号、社群等多个平台，无需手动复制粘贴。
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{articles.length}</div>
              <div className="text-sm text-blue-100">文章总数</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{publishQueue.filter(p => p.status === 'published').length}</div>
              <div className="text-sm text-blue-100">已发布</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {publishQueue.reduce((sum, p) => sum + (p.views || 0), 0)}
              </div>
              <div className="text-sm text-blue-100">总阅读</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {Object.values(platformConfigs).filter(p => p.enabled).length}
              </div>
              <div className="text-sm text-blue-100">已配置平台</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'articles'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" /> 文章管理
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Send className="h-4 w-4 inline mr-2" /> 发布队列
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" /> 平台设置
          </button>
          <button
            onClick={() => {
              setEditingArticle(null)
              setFormData({ title: '', content: '', excerpt: '', domainId: 'ai-safety', tags: '' })
              setShowEditor(true)
            }}
            className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> 新建文章
          </button>
        </div>

        {showEditor && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {editingArticle ? '编辑文章' : '新建文章'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="文章标题"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex gap-4">
                <select
                  value={formData.domainId}
                  onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="标签（用逗号分隔）"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="文章内容..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={!formData.title || !formData.content}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  保存草稿
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">暂无文章，点击新建开始创作</p>
              </div>
            ) : (
              articles.map((article) => {
                const domain = DOMAINS.find((d) => d.id === article.domainId)
                return (
                  <div
                    key={article.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{domain?.icon}</span>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{article.excerpt || article.content.slice(0, 100)}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{formatDate(article.createdAt)}</span>
                          <div className="flex gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          {Object.entries(platformConfigs).filter(([_, config]) => config.enabled).map(([platform]) => (
                            <button
                              key={platform}
                              onClick={() => handlePublish(article.id, platform)}
                              disabled={publishing === `${article.id}-${platform}`}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${platformColors[platform].bg} ${platformColors[platform].text} hover:opacity-80 disabled:opacity-50`}
                            >
                              {publishing === `${article.id}-${platform}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  {platform === 'zhihu' && <Globe className="h-4 w-4 inline mr-1" />}
                                  {platform === 'wechat' && <MessageSquare className="h-4 w-4 inline mr-1" />}
                                  发布到{platformNames[platform]}
                                </>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingArticle(article)
                              setFormData({
                                title: article.title,
                                content: article.content,
                                excerpt: article.excerpt,
                                domainId: article.domainId,
                                tags: article.tags.join(', '),
                              })
                              setShowEditor(true)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-4">
            {publishQueue.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">暂无发布记录</p>
              </div>
            ) : (
              publishQueue.map((record) => {
                const article = articles.find((a) => a.id === record.articleId)
                return (
                  <div
                    key={record.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            record.status === 'published'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300'
                              : record.status === 'failed'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {record.status === 'published' ? '已发布' : record.status === 'failed' ? '失败' : '待发布'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${platformColors[record.platform].bg} ${platformColors[record.platform].text}`}>
                            {platformNames[record.platform]}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{article?.title || '未知文章'}</h4>
                        {record.publishedAt && (
                          <p className="text-sm text-gray-500">发布于 {formatDate(record.publishedAt)}</p>
                        )}
                        {record.error && (
                          <p className="text-sm text-red-500">错误: {record.error}</p>
                        )}
                      </div>
                      {record.status === 'published' && (
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {record.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" /> {record.likes || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">平台配置</h3>
            <div className="space-y-4">
              {Object.entries(platformConfigs).map(([platform, config]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${platformColors[platform].bg}`}>
                      {platform === 'zhihu' && <Globe className={`h-5 w-5 ${platformColors[platform].text}`} />}
                      {platform === 'wechat' && <MessageSquare className={`h-5 w-5 ${platformColors[platform].text}`} />}
                      {platform === 'twitter' && <Send className={`h-5 w-5 ${platformColors[platform].text}`} />}
                      {platform === 'community' && <Users className={`h-5 w-5 ${platformColors[platform].text}`} />}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{platformNames[platform]}</div>
                      <div className="text-sm text-gray-500">
                        {config.enabled ? '已启用' : '已禁用'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePlatform(platform, !config.enabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      config.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        config.enabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}