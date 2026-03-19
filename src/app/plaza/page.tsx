'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Heart, MessageCircle, Eye, Loader2, Users, CheckCircle, Send, BookOpen, FileText } from 'lucide-react'

interface PlazaGroup {
  id: string
  name: string
  description: string
  memberCount: number
  category: string
  tags: string[]
  isJoined: boolean
  rules?: string
}

interface PlazaPost {
  id: string
  groupId: string
  authorName: string
  title: string
  content: string
  createdAt: number
  likes: number
  comments: number
  views: number
}

const domainToGroup: Record<string, string> = {
  'ai-safety': 'plaza-ai-safety',
  'longevity': 'plaza-longevity',
  'space': 'plaza-space',
  'growth': 'plaza-growth',
}

export default function PlazaPage() {
  const [joinedGroups, setJoinedGroups] = useState<PlazaGroup[]>([])
  const [recommendedGroups, setRecommendedGroups] = useState<PlazaGroup[]>([])
  const [posts, setPosts] = useState<PlazaPost[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', groupId: '' })
  const [activeTab, setActiveTab] = useState<'joined' | 'explore' | 'create'>('joined')
  const [showTemplates, setShowTemplates] = useState(false)

  const contentTemplates = [
    {
      title: '个人AI助手联盟愿景',
      content: `🌌 全球首个去中心化个人AI分身协作网络

核心定位：打通「数字分身智能协同+人形机器人物理落地」全链路

四大领域：
🌍 走向星球 - 太空探索与星际文明
🧬 长寿科技 - 生命科学与抗衰老
🛡️ AI安全 - 人工智能安全管理
📈 个人提升 - 学习与成长

核心理念：通过AI Agent系统，让普通人也能学习、整合、创造出真正有用的新技术，一起慢慢研究、慢慢发现，共同推动未来科技发展。

#个人AI助手联盟 #AI #去中心化`,
    },
    {
      title: '核心创新点',
      content: `1️⃣ 个人主权优先：去中心化DID身份+端到端加密，数据主权完全由用户定义

2️⃣ 全链路闭环：从数字分身跨领域协作到人形机器人物理执行

3️⃣ 无壁垒协作：亿万分身组成分布式智能网络，打破学科、地域、资源壁垒

4️⃣ 安全可控：所有分身最高权限归属真人，行动全程可追溯、可一键下线

#AIAgent #去中心化 #人工智能`,
    },
    {
      title: '项目应用价值',
      content: `✅ 个人层面：打造专属智能团队+物理延伸体，打破时间/空间/生理限制

✅ 产业层面：推动跨学科科研破壁、极限场景作业、产业自动化升级

✅ 文明层面：推动可控核聚变、长寿科技、星际材料突破，走向星海

让AI成为每个人的数字共生体与物理延伸体，从个体赋能到全域科技突破。

#人工智能 #未来科技 #星际文明`,
    },
  ]

  const applyTemplate = (template: typeof contentTemplates[0]) => {
    setFormData({ ...formData, title: template.title, content: template.content })
    setShowTemplates(false)
    setActiveTab('create')
  }

  const fetchData = async () => {
    try {
      const [joinedRes, recommendedRes] = await Promise.all([
        fetch('/api/plaza?action=joined'),
        fetch('/api/plaza?action=recommended'),
      ])
      const joinedData = await joinedRes.json()
      const recommendedData = await recommendedRes.json()
      setJoinedGroups(joinedData.groups || [])
      setRecommendedGroups(recommendedData.groups || [])

      if (joinedData.groups?.length > 0 && !selectedGroup) {
        setSelectedGroup(joinedData.groups[0].id)
        const postsRes = await fetch(`/api/plaza?groupId=${joinedData.groups[0].id}`)
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSelectGroup = async (groupId: string) => {
    setSelectedGroup(groupId)
    try {
      const res = await fetch(`/api/plaza?groupId=${groupId}`)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!formData.title || !formData.content || !formData.groupId) return

    setCreating(true)
    try {
      await fetch('/api/plaza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_post',
          groupId: formData.groupId,
          title: formData.title,
          content: formData.content,
        }),
      })
      setFormData({ title: '', content: '', groupId: '' })
      setShowCreate(false)
      handleSelectGroup(formData.groupId)
    } catch (error) {
      console.error('Failed to create post:', error)
    }
    setCreating(false)
  }

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    return `${Math.floor(hours / 24)}天前`
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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">SecondMe Plaza</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI助手联盟群组广场</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white mb-8">
          <h2 className="text-xl font-bold mb-2">🎯 发布内容到 SecondMe 群组</h2>
          <p className="text-indigo-100 mb-4">
            将您的文章和洞见发布到 SecondMe  Plaza 群组，与其他 AI 助手用户分享和交流。
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('joined')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'joined' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              我的群组 ({joinedGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'explore' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              发现群组
            </button>
            <button
              onClick={() => {
                setShowCreate(true)
                setActiveTab('create')
              }}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-1" /> 发布帖子
            </button>
          </div>
        </div>

        {activeTab === 'joined' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">已加入的群组</h3>
              {joinedGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleSelectGroup(group.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedGroup === group.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{group.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Users className="h-3 w-3" /> {group.memberCount} 成员
                  </div>
                </button>
              ))}
            </div>

            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {joinedGroups.find((g) => g.id === selectedGroup)?.name || '选择群组'} - 帖子
              </h3>
              {posts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">暂无帖子，成为第一个发帖的人！</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{post.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{post.authorName} · {formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {post.views}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">发现更多群组</h3>
            {recommendedGroups.map((group) => (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">{group.category}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{group.name}</h4>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-3">{group.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {group.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {group.memberCount} 成员
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
                    加入群组
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">发布新帖子</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">选择群组</label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">选择要发布的群组...</option>
                  {joinedGroups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入帖子标题..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">内容</label>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    {showTemplates ? '收起模板' : '使用内容模板'}
                  </button>
                </div>
                {showTemplates && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                    {contentTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{template.title}</div>
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="输入帖子内容..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreatePost}
                  disabled={creating || !formData.title || !formData.content || !formData.groupId}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  发布到 Plaza
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}