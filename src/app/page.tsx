'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, LogIn, LogOut, Loader2, AlertCircle, Network, Rocket, Sparkles, Shield, Users, Globe, ArrowRight, Star, Zap, ChevronDown } from 'lucide-react'

interface UserInfo {
  id: string
  name: string | null
  email: string | null
  avatarUrl: string | null
}

const ERROR_MESSAGES: Record<string, string> = {
  no_code: 'OAuth 回调中缺少授权码，请重新登录。',
  auth_failed: 'SecondMe 授权失败，请稍后重试。',
  access_denied: '您拒绝了授权请求。',
}

const FEATURES = [
  {
    id: 'space',
    icon: '🌍',
    title: '走向星球',
    description: '太空探索与星际文明',
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-900/20',
  },
  {
    id: 'longevity',
    icon: '🧬',
    title: '长寿科技',
    description: '生命科学与抗衰老',
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-900/20',
  },
  {
    id: 'ai-safety',
    icon: '🛡️',
    title: 'AI安全',
    description: '人工智能安全管理',
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
  },
  {
    id: 'growth',
    icon: '📈',
    title: '个人提升',
    description: '学习与成长',
    gradient: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-900/20',
  },
]

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError(ERROR_MESSAGES[errorParam] || `登录失败: ${errorParam}`)
      window.history.replaceState({}, '', '/')
    }

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/auth/login'
  }

  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 px-6 text-center text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <p className="flex items-center justify-center gap-2 relative z-10">
          <Star className="h-4 w-4 animate-pulse" />
          全球首个去中心化个人AI分身协作网络 · 从地球走向星际
          <Sparkles className="h-4 w-4" />
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl">
          <div className="card p-10 shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/30 animate-float">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                个人<span className="text-gradient">AI助手联盟</span>
              </h1>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Personal AI Assistant Alliance
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className={`${feature.bgLight} dark:${feature.bgDark} rounded-2xl p-5 text-left border border-slate-100 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className={`text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-500 hover:text-red-600 mt-1 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}

            {user ? (
              <div className="space-y-5">
                <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || 'User'}
                      className="h-16 w-16 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {user.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {user.name || '未命名用户'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.email || '未提供邮箱'}
                    </p>
                  </div>
                  <div className="badge badge-success">
                    已登录
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="btn-primary flex items-center justify-center gap-3 py-4 text-lg"
                >
                  <Network className="h-5 w-5" />
                  进入联盟控制台
                </Link>

                <div className="flex gap-3">
                  <Link
                    href="/about"
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Rocket className="h-5 w-5" />
                    了解更多
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost flex items-center justify-center gap-2 px-5"
                  >
                    <LogOut className="h-4 w-4" />
                    退出
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="relative py-6 px-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white dark:bg-slate-800 text-sm text-slate-500">
                      开始探索
                    </span>
                  </div>
                </div>

                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed px-4">
                  让 AI 成为每个人的数字共生体与物理延伸体
                </p>

                <button
                  onClick={handleLogin}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg group"
                >
                  <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  使用 SecondMe 登录
                </button>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                >
                  了解更多关于联盟
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8 gap-2 text-sm text-slate-400">
            <span>Powered by</span>
            <span className="text-gradient font-semibold">SecondMe</span>
            <span>&</span>
            <span className="text-gradient font-semibold">AI Alliance</span>
          </div>
        </div>
      </div>
    </main>
  )
}
