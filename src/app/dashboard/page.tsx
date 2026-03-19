'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Rocket, Dna, Shield, TrendingUp, Network, Share2, CheckCircle, Clock, Users, Loader2, ArrowRight, BookOpen, Sparkles, Brain, FileText, Send, Globe, Bot, Zap, Settings, Bell, Search, ChevronRight, Activity, TrendingUp as TrendingUpIcon, Target, Award, Zap as ZapIcon } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'

interface DomainStats {
  id: string
  knowledgeCount: number
  lastUpdate: string
  connections: number
}

interface GlobalStats {
  totalKnowledge: number
  crossDomainInsights: number
  verifiedCount: number
  activeConnections: number
}

const domainConfig: Record<string, { gradient: string; iconBg: string; iconColor: string }> = {
  space: { gradient: 'from-blue-500 to-cyan-500', iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
  longevity: { gradient: 'from-purple-500 to-pink-500', iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500' },
  'ai-safety': { gradient: 'from-emerald-500 to-teal-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-500' },
  growth: { gradient: 'from-orange-500 to-amber-500', iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
}

const quickActions = [
  { icon: Sparkles, label: '智能助手', href: '/assistant', gradient: 'from-violet-500 to-purple-500' },
  { icon: Share2, label: '跨域协作', href: '/collaboration', gradient: 'from-indigo-500 to-blue-500' },
  { icon: Users, label: 'A2A连接', href: '/connections', gradient: 'from-pink-500 to-rose-500' },
  { icon: Brain, label: 'OpenClaw', href: '/openclaw', gradient: 'from-cyan-500 to-blue-500' },
]

const recentActivities = [
  { id: 1, text: '太空探索领域新增 2 条知识', time: '5分钟前', icon: Rocket },
  { id: 2, text: '完成跨域洞见生成', time: '15分钟前', icon: Sparkles },
  { id: 3, text: '知识库同步完成', time: '30分钟前', icon: CheckCircle },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [domainStats, setDomainStats] = useState<DomainStats[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalKnowledge: 0,
    crossDomainInsights: 0,
    verifiedCount: 0,
    activeConnections: 0,
  })

  useEffect(() => {
    fetch('/api/collaboration/stats')
      .then((res) => res.json())
      .then((data) => {
        setDomainStats(data.domains || [])
        setGlobalStats(data.global || globalStats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">加载控制台...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">个人 AI 助手联盟</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">控制台</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  className="bg-transparent border-0 outline-none text-sm text-slate-600 dark:text-slate-300 w-40"
                />
              </div>
              <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">🚀 多助手协作系统</h2>
            </div>
            <p className="text-indigo-100 mb-8 max-w-2xl">
              让 AI 不只是工具，而是你的智能团队。四个领域专家助手协同工作，共享知识，交叉验证，产出洞见。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '知识条目', value: globalStats.totalKnowledge, icon: BookOpen },
                { label: '跨域洞见', value: globalStats.crossDomainInsights, icon: Sparkles },
                { label: '已验证', value: globalStats.verifiedCount, icon: CheckCircle },
                { label: '活跃连接', value: globalStats.activeConnections, icon: Network },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-4 w-4 text-indigo-200" />
                    <span className="text-sm text-indigo-200">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">四大领域</h3>
              <Link href="/sub-assistant" className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                管理子助手 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {DOMAINS.map((domain) => {
                const stats = domainStats.find((s) => s.id === domain.id)
                const config = domainConfig[domain.id]

                return (
                  <Link
                    key={domain.id}
                    href={`/domain/${domain.id}`}
                    className="group card card-hover p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl">{domain.icon}</span>
                      </div>
                      <ArrowRight className={`h-5 w-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all ${config.iconColor}`} />
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{domain.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{domain.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {domain.specialties.slice(0, 2).map((specialty) => (
                        <span key={specialty} className="badge badge-primary">
                          {specialty}
                        </span>
                      ))}
                      {domain.specialties.length > 2 && (
                        <span className="badge badge-primary">+{domain.specialties.length - 2}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <BookOpen className="h-4 w-4" />
                        <span>{stats?.knowledgeCount || 0} 知识</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Network className="h-4 w-4" />
                        <span>{stats?.connections || 0} 连接</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">快捷操作</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="card card-hover p-4 text-center group"
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">最近活动</h3>
              <div className="card p-4 space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <activity.icon className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{activity.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">功能入口</h3>
              <div className="card divide-y divide-slate-100 dark:divide-slate-700/50">
                {[
                  { icon: FileText, label: '周报汇总', href: '/reports', desc: '定期学习成果分享' },
                  { icon: BookOpen, label: '学习路径', href: '/learning', desc: '系统化学习路径' },
                  { icon: Send, label: '内容发布', href: '/content', desc: '多平台内容发布' },
                  { icon: Globe, label: 'SecondMe Plaza', href: '/plaza', desc: '联盟广场' },
                  { icon: ZapIcon, label: '子助手体系', href: '/sub-assistant', desc: 'RAG增强助手' },
                  { icon: Bot, label: '机器人绑定', href: '/robot', desc: '人形机器人控制' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
