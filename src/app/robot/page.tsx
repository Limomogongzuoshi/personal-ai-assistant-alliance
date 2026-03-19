'use client'

import { useState } from 'react'
import { Bot, Link2, Wifi, WifiOff, Settings, ChevronRight, ExternalLink, Info, AlertCircle, CheckCircle } from 'lucide-react'

interface RobotDevice {
  id: string
  name: string
  platform: 'lerobot' | 'qinglong' | 'x1' | 'custom'
  status: 'online' | 'offline' | 'connecting'
  lastSync: string
  capabilities: string[]
}

const PLATFORMS = {
  lerobot: { name: 'LeRobot (Hugging Face)', url: 'https://github.com/huggingface/lerobot', color: 'bg-orange-500' },
  qinglong: { name: '青龙 (Qinglong)', url: 'https://github.com/QinglongAI/Qinglong', color: 'bg-green-500' },
  x1: { name: '智元灵犀 X1', url: 'https://github.com/phi-society/phi-society', color: 'bg-blue-500' },
  custom: { name: '自定义平台', url: '', color: 'bg-gray-500' },
}

const mockRobots: RobotDevice[] = [
  {
    id: 'robot-001',
    name: '我的机器人分身-alpha',
    platform: 'lerobot',
    status: 'online',
    lastSync: '2026-03-19 10:30:00',
    capabilities: ['双臂控制', '步态行走', '视觉识别', '语音交互'],
  },
]

export default function RobotBindingPage() {
  const [robots, setRobots] = useState<RobotDevice[]>(mockRobots)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRobot, setNewRobot] = useState({ name: '', platform: 'lerobot' as const, ip: '' })

  const handleBindRobot = () => {
    if (!newRobot.name.trim()) return
    const robot: RobotDevice = {
      id: `robot-${Date.now()}`,
      name: newRobot.name,
      platform: newRobot.platform,
      status: 'offline',
      lastSync: '从未同步',
      capabilities: [],
    }
    setRobots([...robots, robot])
    setShowAddModal(false)
    setNewRobot({ name: '', platform: 'lerobot', ip: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Bot className="h-6 w-6" />
          <h1 className="text-lg font-semibold">人形机器人绑定</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">什么是机器人绑定？</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                将您的数字 AI 分身与人形机器人绑定，实现「数字思维→物理行动」的闭环。
                您的 AI 分身可以控制机器人执行物理世界中的任务，让 AI 成为您的物理延伸体。
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Bot className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">数字思维</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI 分身具备跨领域知识和决策能力
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ChevronRight className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">指令传输</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              通过 A2A 协议将任务指令发送给机器人
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Settings className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">物理执行</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              机器人在物理世界执行具体任务
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">已绑定的机器人</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Link2 className="h-4 w-4" /> 绑定新机器人
            </button>
          </div>

          {robots.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无绑定的机器人</p>
              <p className="text-sm mt-1">点击上方按钮绑定您的第一台人形机器人</p>
            </div>
          ) : (
            <div className="space-y-4">
              {robots.map((robot) => (
                <div
                  key={robot.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${robot.status === 'online' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {robot.status === 'online' ? (
                          <Wifi className="h-5 w-5 text-green-500" />
                        ) : (
                          <WifiOff className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{robot.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${robot.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {robot.status === 'online' ? '在线' : '离线'}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${PLATFORMS[robot.platform].color} text-white`}>
                            {PLATFORMS[robot.platform].name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        最后同步: {robot.lastSync}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {robot.capabilities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {robot.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">开源机器人平台参考</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://github.com/huggingface/lerobot"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-orange-300 dark:hover:border-orange-600 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <h3 className="font-medium text-gray-900 dark:text-white">LeRobot (Hugging Face)</h3>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Hugging Face 开源的机器人学习库，支持多种机器人硬件，提供预训练模型和数据集
              </p>
            </a>
            <a
              href="https://github.com/QinglongAI/Qinglong"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <h3 className="font-medium text-gray-900 dark:text-white">青龙 (Qinglong)</h3>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                世界首个全尺寸开源人形机器人项目，配备 42 个自由度，支持多种 AI 算法集成
              </p>
            </a>
            <a
              href="https://github.com/phi-society/phi-society"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <h3 className="font-medium text-gray-900 dark:text-white">智元灵犀 X1</h3>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                智元机器人开源的灵犀 X1 项目，提供完整的软硬件解决方案，适合研究用途
              </p>
            </a>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <h3 className="font-medium text-gray-900 dark:text-white">更多平台持续更新...</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                我们将持续集成更多开源机器人平台，敬请期待
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">当前状态</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                机器人绑定功能正在规划中，以上为参考设计。您可以添加机器人设备信息，但实际控制功能需等待后续版本更新。
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">绑定新机器人</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  机器人名称
                </label>
                <input
                  type="text"
                  value={newRobot.name}
                  onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                  placeholder="例如: 我的机器人分身-alpha"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  机器人平台
                </label>
                <select
                  value={newRobot.platform}
                  onChange={(e) => setNewRobot({ ...newRobot, platform: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lerobot">LeRobot (Hugging Face)</option>
                  <option value="qinglong">青龙 (Qinglong)</option>
                  <option value="x1">智元灵犀 X1</option>
                  <option value="custom">自定义平台</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP 地址 / 连接地址（可选）
                </label>
                <input
                  type="text"
                  value={newRobot.ip}
                  onChange={(e) => setNewRobot({ ...newRobot, ip: e.target.value })}
                  placeholder="例如: 192.168.1.100"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBindRobot}
                disabled={!newRobot.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认绑定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}