'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, Sparkles, MessageCircle, CheckCircle, Zap, ChevronRight, RefreshCw } from 'lucide-react'
import { DOMAINS } from '@/lib/collaboration'
import { routeQuestion, getSuggestedQuestions } from '@/lib/routing'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  domain?: string
  timestamp: number
  routing?: {
    primaryDomain: string
    confidence: number
    reasoning: string
  }
}

const domainColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  space: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', icon: '🚀' },
  longevity: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800', icon: '🧬' },
  'ai-safety': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', icon: '🛡️' },
  growth: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', icon: '📈' },
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showRouting, setShowRouting] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initialMessage: Message = {
      id: 'welcome',
      role: 'system',
      content: '👋 欢迎使用智能助手！我是您的 AI 助手联盟核心。\n\n请描述您的问题，我会自动识别最适合的领域助手来为您服务。\n\n💡 您也可以直接选择一个领域助手：',
      timestamp: Date.now(),
    }
    setMessages([initialMessage])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (question?: string) => {
    const q = question || input.trim()
    if (!q) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })

      const data = await response.json()

      if (data.success) {
        const { routing } = data
        const domain = DOMAINS.find(d => d.id === routing.primaryDomain)
        const colors = domainColors[routing.primaryDomain]

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: generateAssistantResponse(q, routing, data.suggestedQuestions),
          domain: routing.primaryDomain,
          timestamp: Date.now(),
          routing: {
            primaryDomain: routing.primaryDomain,
            confidence: routing.confidence,
            reasoning: routing.reasoning,
          },
        }

        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setLoading(false)
  }

  const generateAssistantResponse = (
    question: string,
    routing: any,
    suggestedQuestions: string[]
  ): string => {
    const domain = DOMAINS.find(d => d.id === routing.primaryDomain)
    const confidence = Math.round(routing.confidence * 100)

    let response = `🎯 **智能路由分析结果**\n\n`
    response += `**匹配领域**: ${domain?.icon} ${domain?.name}\n`
    response += `**置信度**: ${confidence}%\n`
    response += `**分析**: ${routing.reasoning}\n\n`

    if (routing.secondaryDomains && routing.secondaryDomains.length > 0) {
      const secondary = routing.secondaryDomains
        .map((d: string) => {
          const secDomain = DOMAINS.find(dom => dom.id === d)
          return `${secDomain?.icon} ${secDomain?.name}`
        })
        .join('、')
      response += `**辅助领域**: ${secondary}\n\n`
    }

    response += `---\n\n`
    response += `📝 **关于您的问题**\n\n`
    response += `"${question}"\n\n`
    response += `这是${domain?.name}领域的问题。我可以帮您：\n\n`
    response += `• 分享该领域的专业知识\n`
    response += `• 提供学习路径建议\n`
    response += `• 连接到该领域的专家助手\n\n`

    if (suggestedQuestions.length > 0) {
      response += `💡 **您可能还想问**:\n`
      suggestedQuestions.slice(0, 3).forEach((q: string) => {
        response += `• ${q}\n`
      })
    }

    return response
  }

  const handleQuickQuestion = (domainId: string) => {
    const suggestions = getSuggestedQuestions(domainId)
    if (suggestions.length > 0) {
      handleSubmit(suggestions[0])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">智能助手</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI 助手联盟核心路由</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">选择领域助手</span>
            <button
              onClick={() => setShowRouting(!showRouting)}
              className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              {showRouting ? '隐藏' : '显示'}路由信息 <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((domain) => {
              const colors = domainColors[domain.id]
              return (
                <button
                  key={domain.id}
                  onClick={() => handleQuickQuestion(domain.id)}
                  className={`px-3 py-2 rounded-lg border transition-all ${colors.border} ${colors.bg} ${colors.text} hover:shadow-md`}
                >
                  <span className="mr-1">{domain.icon}</span>
                  {domain.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              if (message.role === 'system') {
                return (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Sparkles className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none p-4">
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )
              }

              if (message.role === 'user') {
                return (
                  <div key={message.id} className="flex items-start gap-3 justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                      <p>{message.content}</p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                )
              }

              const colors = message.domain ? domainColors[message.domain] : null
              const domain = message.domain ? DOMAINS.find(d => d.id === message.domain) : null

              return (
                <div key={message.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colors?.bg || 'bg-gray-100 dark:bg-gray-700'}`}>
                    <span className="text-xl">{domain?.icon || '🤖'}</span>
                  </div>
                  <div className={`flex-1 rounded-2xl rounded-tl-none p-4 ${colors?.bg || 'bg-gray-100 dark:bg-gray-700'}`}>
                    {message.routing && showRouting && (
                      <div className={`mb-3 p-3 rounded-lg border ${colors?.border || 'border-gray-200'} ${colors?.text || 'text-gray-600 dark:text-gray-300'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4" />
                          <span className="font-medium">智能路由</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${colors?.bg}`}>
                            {Math.round(message.routing.confidence * 100)}% 置信度
                          </span>
                        </div>
                        <p className="text-sm">{message.routing.reasoning}</p>
                      </div>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">{message.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none p-4">
                  <p className="text-gray-500">智能分析中...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="描述您的问题..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                发送
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}