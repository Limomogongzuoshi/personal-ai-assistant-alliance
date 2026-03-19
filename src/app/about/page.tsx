'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Rocket, Sparkles, Shield, Users, Globe, Zap, Heart, CheckCircle, ArrowRight, Lock, Cpu, Microscope, RocketIcon } from 'lucide-react'

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-purple-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">个人AI助手联盟</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">🌌 全球首个去中心化个人AI分身协作网络</h2>
          <p className="text-xl text-blue-100 mb-6">
            打通「数字分身智能协同+人形机器人物理落地」全链路，让AI成为每个人的数字共生体与物理延伸体
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <Globe className="h-5 w-5 inline mr-2" />从地球走向星际
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <Users className="h-5 w-5 inline mr-2" />亿万分身协作
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <Shield className="h-5 w-5 inline mr-2" />安全可控
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <RocketIcon className="h-6 w-6 text-blue-500" /> 项目定位
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                从个体赋能到全域科技突破，最终推动人类文明从地球走向星际，彻底打破个体能力、时空、生理的终极壁垒。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" /> 核心创新点
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">个人主权优先</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">去中心化DID身份+端到端加密，数据主权、协作权限完全由用户定义</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <span className="text-purple-600 dark:text-purple-300 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">全链路闭环</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">从数字分身跨领域协作到绑定人形机器人完成物理世界精准执行</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-300 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">无壁垒协作</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">亿万个体的分身组成分布式智能网络，打破学科、地域、资源壁垒</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <span className="text-orange-600 dark:text-orange-300 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">安全可控</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">所有分身最高权限归属真人，行动全程可追溯、可暂停、可一键下线</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" /> 核心应用价值
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">✅ 个人层面</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">打造专属智能团队+物理延伸体，打破时间/空间/生理限制</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-600 dark:text-purple-300 mb-2">✅ 产业层面</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">推动跨学科科研破壁、极限场景作业、产业自动化升级</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <h4 className="font-semibold text-green-600 dark:text-green-300 mb-2">✅ 文明层面</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">推动可控核聚变、长寿科技、星际材料突破，走向星海</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Microscope className="h-5 w-5 text-blue-500" /> 四大研究领域
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">走向星球</span>
                    <p className="text-xs text-gray-500">太空探索与星际文明</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">长寿科技</span>
                    <p className="text-xs text-gray-500">生命科学与抗衰老</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">AI安全</span>
                    <p className="text-xs text-gray-500">人工智能安全管理</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-orange-500" />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">个人提升</span>
                    <p className="text-xs text-gray-500">学习与成长</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" /> 安全理念
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                跳出「AI取代人类」的主流叙事，以「人永远为核心」为底层逻辑，让AI成为人类的能力放大器与延伸体。
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">无独立自主意志</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">全程可追溯</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">可一键下线</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium text-center transition-opacity flex items-center justify-center gap-2"
            >
              <Cpu className="h-5 w-5" /> 进入联盟控制台 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 落地路径</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="text-sm text-blue-600 dark:text-blue-300 font-medium mb-2">第一阶段 1-3个月</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">MVP可信私有联盟</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">跑通核心协作闭环，验证核心价值</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="text-sm text-purple-600 dark:text-purple-300 font-medium mb-2">第二阶段 3-6个月</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">开放联盟网络</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">兼容主流AI/机器人平台</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="text-sm text-green-600 dark:text-green-300 font-medium mb-2">长期愿景</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">全球智能协作网络</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">配套完整通信协议、权限规则、激励体系</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}