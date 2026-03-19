'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Users, FileText, Heart, MessageCircle, Share2, RefreshCw, ExternalLink, CheckCircle, Send, TrendingUp, Search, ThumbsUp, ThumbsDown, SendHorizonal, Clock, Eye, AlertTriangle } from 'lucide-react'

interface ZhihuRing {
  id: string
  name: string
}

interface ZhihuPost {
  id: string
  ringId: string
  title: string
  content: string
  authorName: string
  createdAt: number
  likes: number
  comments: number
  shares: number
  tags?: string[]
  liked?: boolean
}

interface ZhihuComment {
  id: string
  postId: string
  authorName: string
  content: string
  createdAt: number
  likes: number
  replyCount: number
}

interface ZhihuRingInfo {
  ringId: string
  name: string
  description: string
  memberCount: number
  postCount: number
}

interface ZhihuBillboardItem {
  id: string
  title: string
  summary: string
  热度: number
  回答数: number
  关注数: number
  link: string
}

interface ZhihuSearchResult {
  id: string
  type: 'article' | 'answer' | 'question'
  title: string
  abstract: string
  authorName: string
  authorityLevel: number
  selectedComment?: string
  link: string
}

type TabType = 'posts' | 'publish' | 'billboard' | 'search' | 'detail'

export default function ZhihuPage() {
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [rings, setRings] = useState<ZhihuRing[]>([])
  const [selectedRing, setSelectedRing] = useState<string | null>(null)
  const [ringInfo, setRingInfo] = useState<ZhihuRingInfo | null>(null)
  const [posts, setPosts] = useState<ZhihuPost[]>([])
  const [comments, setComments] = useState<ZhihuComment[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [selectedPost, setSelectedPost] = useState<ZhihuPost | null>(null)
  const [configured, setConfigured] = useState(true)
  const [remainingCalls, setRemainingCalls] = useState(1000)
  const [publishContent, setPublishContent] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [billboard, setBillboard] = useState<ZhihuBillboardItem[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<ZhihuSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const checkRes = await fetch('/api/zhihu?action=check')
      const checkData = await checkRes.json()
      setConfigured(checkData.configured)
      setRemainingCalls(checkData.remainingCalls || 1000)

      const ringsRes = await fetch('/api/zhihu?action=rings')
      const ringsData = await ringsRes.json()
      setRings(ringsData.rings || [])

      if (ringsData.rings?.length > 0) {
        setSelectedRing(ringsData.rings[0].id)
        await fetchRingData(ringsData.rings[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  const fetchRingData = async (ringId: string) => {
    setDataLoading(true)
    try {
      const [infoRes, postsRes] = await Promise.all([
        fetch(`/api/zhihu?action=detail&ringId=${ringId}`),
        fetch(`/api/zhihu?action=posts&ringId=${ringId}`),
      ])

      const infoData = await infoRes.json()
      const postsData = await postsRes.json()

      setRingInfo(infoData.data || null)
      setPosts(postsData.data || [])
    } catch (error) {
      console.error('Failed to fetch ring data:', error)
    }
    setDataLoading(false)
  }

  const handleSelectRing = async (ringId: string) => {
    setSelectedRing(ringId)
    setSelectedPost(null)
    setActiveTab('posts')
    await fetchRingData(ringId)
  }

  const handleViewPost = async (post: ZhihuPost) => {
    setSelectedPost(post)
    setActiveTab('detail')
    await fetchComments(post.id)
  }

  const fetchComments = async (postId: string) => {
    try {
      const res = await fetch(`/api/zhihu?action=comments&postId=${postId}`)
      const data = await res.json()
      setComments(data.data || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handlePublish = async () => {
    if (!publishContent.trim() || !selectedRing) return

    setPublishing(true)
    try {
      const res = await fetch('/api/zhihu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish_pin',
          ringId: selectedRing,
          content: publishContent,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPublishSuccess(true)
        setPublishContent('')
        setTimeout(() => setPublishSuccess(false), 3000)
        await fetchRingData(selectedRing)
      }
    } catch (error) {
      console.error('Failed to publish:', error)
    }
    setPublishing(false)
  }

  const handleLike = async (post: ZhihuPost) => {
    const action = post.liked ? 'unlike' : 'like'
    try {
      await fetch('/api/zhihu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reaction',
          targetId: post.id,
          targetType: 'post',
          targetAction: action,
        }),
      })
      setPosts(posts.map(p =>
        p.id === post.id
          ? { ...p, likes: action === 'like' ? p.likes + 1 : p.likes - 1, liked: !p.liked }
          : p
      ))
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? {
          ...prev,
          likes: action === 'like' ? prev.likes + 1 : prev.likes - 1,
          liked: !prev.liked
        } : null)
      }
    } catch (error) {
      console.error('Failed to like:', error)
    }
  }

  const handleComment = async () => {
    if (!commentContent.trim() || !selectedPost) return

    setSubmittingComment(true)
    try {
      const res = await fetch('/api/zhihu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          postId: selectedPost.id,
          content: commentContent,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCommentContent('')
        await fetchComments(selectedPost.id)
        setPosts(posts.map(p =>
          p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p
        ))
      }
    } catch (error) {
      console.error('Failed to comment:', error)
    }
    setSubmittingComment(false)
  }

  const fetchBillboard = async () => {
    setDataLoading(true)
    try {
      const res = await fetch('/api/zhihu?action=billboard&hours=24')
      const data = await res.json()
      setBillboard(data.data || [])
    } catch (error) {
      console.error('Failed to fetch billboard:', error)
    }
    setDataLoading(false)
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return

    setSearchLoading(true)
    try {
      const res = await fetch(`/api/zhihu?action=search&keyword=${encodeURIComponent(searchKeyword)}`)
      const data = await res.json()
      setSearchResults(data.data || [])
    } catch (error) {
      console.error('Failed to search:', error)
    }
    setSearchLoading(false)
  }

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    return `${Math.floor(hours / 24)}天前`
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">知乎圈子</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-yellow-700 dark:text-yellow-300">知乎 API 凭证未配置，无法连接知乎平台</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">请在 .env.local 中配置 ZHIHU_APP_KEY 和 ZHIHU_APP_SECRET</p>
          </div>
        </main>
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
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">知乎圈子</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">社交实验 · AI Agent 开发者联盟</p>
          </div>
          <div className="text-sm text-gray-500">
            剩余调用: <span className="font-medium text-blue-600">{remainingCalls}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">🔗 知乎开放平台</h2>
              <p className="text-blue-100 text-sm">发布内容到两个专属圈子 · 获取热榜 · 全网搜索</p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> 刷新
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {rings.map((ring) => (
              <button
                key={ring.id}
                onClick={() => handleSelectRing(ring.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRing === ring.id
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {ring.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{ringInfo?.name || '圈子'}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{ringInfo?.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {formatNumber(ringInfo?.memberCount || 0)}</span>
              <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {formatNumber(ringInfo?.postCount || 0)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">快速操作</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('publish')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <Send className="h-4 w-4" /> 发布想法
              </button>
              <button
                onClick={() => { setActiveTab('billboard'); fetchBillboard(); }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" /> 热榜
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">API 状态</h3>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600 dark:text-green-400">已连接</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">签名算法: HMAC-SHA256</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {[
                { key: 'posts', label: '内容列表', icon: FileText },
                { key: 'publish', label: '发布想法', icon: Send },
                { key: 'billboard', label: '热榜', icon: TrendingUp },
                { key: 'search', label: '全网搜索', icon: Search },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabType)}
                  className={`px-6 py-4 font-medium transition-colors flex items-center gap-2 ${
                    activeTab === key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {dataLoading ? (
                  <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" /></div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">暂无帖子内容</div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handleViewPost(post)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{post.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-400">{post.authorName}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags?.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <button onClick={(e) => { e.stopPropagation(); handleLike(post); }} className={`flex items-center gap-1 hover:text-red-500 ${post.liked ? 'text-red-500' : ''}`}>
                          <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} /> {post.likes}
                        </button>
                        <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments}</span>
                        <span className="flex items-center gap-1"><Share2 className="h-4 w-4" /> {post.shares}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'publish' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">发布想法到 {rings.find(r => r.id === selectedRing)?.name}</h3>
                <textarea
                  value={publishContent}
                  onChange={(e) => setPublishContent(e.target.value)}
                  placeholder="分享你的观点、经验或问题..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">{publishContent.length}/500</span>
                  <button
                    onClick={handlePublish}
                    disabled={publishing || !publishContent.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    发布
                  </button>
                </div>
                {publishSuccess && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> 发布成功！
                  </div>
                )}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">发布规则</h4>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• 内容需符合知乎社区规范</li>
                    <li>• 禁止发布广告、垃圾信息</li>
                    <li>• 尊重他人，文明发言</li>
                    <li>• 鼓励分享有价值的观点和经验</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'billboard' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">知乎热榜 · 最近24小时</h3>
                  <button onClick={fetchBillboard} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" /> 刷新
                  </button>
                </div>
                {dataLoading ? (
                  <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" /></div>
                ) : (
                  <div className="space-y-3">
                    {billboard.map((item, index) => (
                      <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-red-500 text-white' :
                            index === 1 ? 'bg-orange-500 text-white' :
                            index === 2 ? 'bg-yellow-500 text-white' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{item.summary}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {formatNumber(item.热度)}</span>
                              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {formatNumber(item.回答数)} 回答</span>
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {formatNumber(item.关注数)} 关注</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">全网可信搜索</h3>
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="输入关键词搜索..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    搜索
                  </button>
                </div>
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <a
                      key={result.id}
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          result.type === 'question' ? 'bg-blue-100 text-blue-600' :
                          result.type === 'article' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {result.type === 'question' ? '问题' : result.type === 'article' ? '文章' : '回答'}
                        </span>
                        <span className="text-xs text-gray-400">权威度: {result.authorityLevel}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{result.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{result.abstract}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">作者: {result.authorName}</span>
                        {result.selectedComment && (
                          <span className="text-xs text-gray-400 italic truncate max-w-[200px]">"{result.selectedComment}"</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
                {searchResults.length > 0 && (
                  <p className="mt-4 text-sm text-gray-500 text-center">搜索结果已缓存，调用限制: 1000次/用户</p>
                )}
              </div>
            )}

            {activeTab === 'detail' && selectedPost && (
              <div>
                <button onClick={() => setActiveTab('posts')} className="mb-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  ← 返回列表
                </button>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selectedPost.title}</h3>
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{selectedPost.authorName}</span>
                  <span>·</span>
                  <span>{formatDate(selectedPost.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags?.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm">{tag}</span>
                  ))}
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleLike(selectedPost)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      selectedPost.liked ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {selectedPost.liked ? <ThumbsUp className="h-5 w-5 fill-current" /> : <ThumbsUp className="h-5 w-5" />}
                    {selectedPost.likes} 点赞
                  </button>
                  <span className="flex items-center gap-2 text-gray-500"><MessageCircle className="h-5 w-5" /> {selectedPost.comments} 评论</span>
                  <a href={`https://www.zhihu.com/ring/host/${selectedRing}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <ExternalLink className="h-5 w-5" /> 在知乎查看
                  </a>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">评论 ({comments.length})</h4>
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="发表你的看法..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={handleComment}
                      disabled={submittingComment || !commentContent.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{comment.authorName}</span>
                          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {comment.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {comment.replyCount} 回复</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}