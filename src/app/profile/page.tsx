'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Globe, Sparkles, Edit2, Save, Loader2, MessageCircle, Users, BookOpen, Copy, Check, Share2 } from 'lucide-react'

interface ProfileData {
  id: string
  name: string | null
  email: string | null
  avatarUrl: string | null
  bio: string | null
  domains: string[]
}

interface ShadesData {
  personality: string | null
  capabilities: string[]
  specialties: string[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [shades, setShades] = useState<ShadesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bio, setBio] = useState('')
  const [copied, setCopied] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)

  const assistantLink = typeof window !== 'undefined' ? `${window.location.origin}/assistant?id=${profile?.id || ''}` : ''

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user)
          setBio(data.user.bio || '')
          setShades(data.shades)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setEditing(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(assistantLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      const input = document.createElement('input')
      input.value = assistantLink
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.name || '我的 AI 助手',
          text: '快来认识我的 AI 助手，加入个人 AI 助手联盟！',
          url: assistantLink,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-gray-600 dark:text-gray-300 mb-4">请先登录</p>
        <Link href="/" className="text-blue-500 hover:text-blue-600">返回登录</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI 助手档案</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32" />
          <div className="px-6 pb-6">
            <div className="relative -top-16">
              <div className="flex items-end gap-6">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name || 'AI'} className="h-32 w-32 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800" />
                ) : (
                  <div className="h-32 w-32 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-500">
                    {profile.name?.[0] || 'AI'}
                  </div>
                )}
                <div className="flex-1 pb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name || '我的 AI 助手'}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">ID: {profile.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">通讯能力</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              可与其他 AI 助手建立连接，共享知识和信息
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">联盟成员</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              加入个人 AI 助手联盟，拓展智能网络
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">知识共享</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              跨领域知识整合，快速获取所需信息
            </p>
          </div>
        </div>

        {shades && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">助手特性</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SecondMe Shades</p>
                </div>
              </div>
            </div>

            {shades.personality && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">个性</p>
                <p className="text-gray-600 dark:text-gray-400">{shades.personality}</p>
              </div>
            )}

            {shades.specialties && shades.specialties.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专长领域</p>
                <div className="flex flex-wrap gap-2">
                  {shades.specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {shades.capabilities && shades.capabilities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">能力</p>
                <div className="flex flex-wrap gap-2">
                  {shades.capabilities.map((cap, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full text-sm">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <User className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">个人简介</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">告诉联盟成员你是谁</p>
              </div>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition-colors"
              >
                <Edit2 className="h-4 w-4" /> 编辑
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 保存
              </button>
            )}
          </div>

          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="描述你的背景、兴趣和专长..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {bio || '暂无简介。点击编辑添加你的个人简介。'}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🌌 个人 AI 助手联盟</h3>
          <p className="text-blue-100 mb-4">
            全球首个去中心化个人AI分身协作网络，打通「数字分身智能协同+人形机器人物理落地」全链路，让AI成为每个人的数字共生体与物理延伸体。
          </p>
          <div className="flex gap-3">
            <Link
              href="/connections"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              探索联盟
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>

        {showSharePanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSharePanel(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5" /> 邀请助手
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                复制下方链接分享给其他用户，让他们可以添加你的 AI 助手。
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={assistantLink}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <button
                onClick={shareViaWebShare}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" /> 分享
              </button>
              <button
                onClick={() => setShowSharePanel(false)}
                className="w-full mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}