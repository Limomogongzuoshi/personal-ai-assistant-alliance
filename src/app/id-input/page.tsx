'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, CheckCircle, XCircle, AlertCircle, Trash2, Copy, Plus, Users, MessageCircle, RefreshCw } from 'lucide-react'

interface IDEntry {
  id: string
  status: 'pending' | 'valid' | 'invalid' | 'duplicate'
  timestamp: number
  message?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  idsExtracted?: IDEntry[]
}

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STORAGE_KEY = 'secondme_ids_session'

export default function IDInputPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [entries, setEntries] = useState<IDEntry[]>([])
  const [showIdList, setShowIdList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { messages: savedMessages, entries: savedEntries } = JSON.parse(saved)
        setMessages(savedMessages)
        setEntries(savedEntries)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0 || entries.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, entries }))
    }
  }, [messages, entries])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const extractIDs = (text: string): string[] => {
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    const matches = text.match(uuidPattern) || []
    return [...new Set(matches.map(id => id.toLowerCase()))]
  }

  const validateID = (id: string): { valid: boolean; message?: string } => {
    if (!ID_PATTERN.test(id)) {
      return { valid: false, message: '格式不正确，UUID应为 8-4-4-4-12 位十六进制数' }
    }
    if (entries.some(e => e.id === id)) {
      return { valid: false, message: 'ID 已存在列表中' }
    }
    return { valid: true }
  }

  const processInput = (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])

    const extractedIDs = extractIDs(text)
    const newEntries: IDEntry[] = []
    const errors: string[] = []

    extractedIDs.forEach(id => {
      const validation = validateID(id)
      const entry: IDEntry = {
        id,
        status: validation.valid ? 'valid' : 'invalid',
        timestamp: Date.now(),
        message: validation.message,
      }
      newEntries.push(entry)
      if (!validation.valid && validation.message) {
        errors.push(`${id}: ${validation.message}`)
      }
    })

    if (newEntries.length > 0) {
      setEntries(prev => {
        const existingIds = new Set(prev.map(e => e.id))
        const uniqueNew = newEntries.filter(e => !existingIds.has(e.id))
        return [...prev, ...uniqueNew]
      })
    }

    let responseContent = ''
    if (extractedIDs.length === 0) {
      responseContent = '我没有在您的消息中找到有效的 UUID 格式 ID。\n\n请输入类似以下格式的 ID：\n`8a1c3b2d-4e5f-7890-abcd-ef1234567890`\n\n支持批量输入，多个 ID 用空格、逗号或换行分隔。'
    } else {
      const validCount = newEntries.filter(e => e.status === 'valid').length
      const invalidCount = newEntries.filter(e => e.status === 'invalid').length
      responseContent = `已识别 ${newEntries.length} 个 ID：\n`
      if (validCount > 0) responseContent += `✅ 有效: ${validCount} 个\n`
      if (invalidCount > 0) responseContent += `❌ 无效: ${invalidCount} 个\n`
      responseContent += `\n当前共 ${entries.length + validCount} 个 ID 在列表中。`
      if (errors.length > 0) {
        responseContent += '\n\n⚠️ 无效 ID：\n' + errors.join('\n')
      }
    }

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
        idsExtracted: newEntries,
      }
      setMessages(prev => [...prev, assistantMessage])
      setSending(false)
    }, 500)
  }

  const handleSend = () => {
    if (!input.trim() || sending) return
    setSending(true)
    processInput(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const clearAll = () => {
    if (confirm('确定清空所有已输入的 ID？')) {
      setEntries([])
      setMessages([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const copyAllIDs = () => {
    const allIDs = entries.filter(e => e.status === 'valid').map(e => e.id).join('\n')
    navigator.clipboard.writeText(allIDs)
  }

  const handleExample = () => {
    setInput('我的助手 ID 是 8a1c3b2d-4e5f-7890-abcd-ef1234567890，还有 3b9c7d2e-5f1a-4c8b-9d3e-2f5a6c8e0b1d')
  }

  const validCount = entries.filter(e => e.status === 'valid').length
  const invalidCount = entries.filter(e => e.status === 'invalid').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">ID 输入系统</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">自然语言批量输入 Second Me 用户 ID</p>
            </div>
          </div>
          {entries.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowIdList(!showIdList)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4" /> {entries.length} 个 ID
              </button>
              <button
                onClick={copyAllIDs}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg"
                title="复制所有有效ID"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={clearAll}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg"
                title="清空所有"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" /> 有效: {validCount}
            </span>
            {invalidCount > 0 && (
              <span className="flex items-center gap-1 text-red-500">
                <XCircle className="h-4 w-4" /> 无效: {invalidCount}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">欢迎使用 ID 输入系统</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  您可以通过自然语言描述输入多个 Second Me 用户 ID，例如：
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left max-w-md mx-auto text-sm text-gray-600 dark:text-gray-300">
                  <p>"我的助手 ID 是 8a1c3b2d-4e5f-7890-abcd-ef1234567890"</p>
                  <p className="mt-2">"还有以下 ID 需要添加：xxx-xxx, yyy-yyy"</p>
                </div>
                <button
                  onClick={handleExample}
                  className="mt-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-sm flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" /> 尝试示例
                </button>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.idsExtracted && msg.idsExtracted.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs opacity-70 mb-2">本次识别：</p>
                      <div className="space-y-1">
                        {msg.idsExtracted.slice(0, 5).map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {entry.status === 'valid' ? (
                              <CheckCircle className="h-3 w-3 text-green-400" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-400" />
                            )}
                            <span className="font-mono">{entry.id}</span>
                          </div>
                        ))}
                        {msg.idsExtracted.length > 5 && (
                          <p className="text-xs opacity-70">...还有 {msg.idsExtracted.length - 5} 个</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入 Second Me 用户 ID 或描述..."
                rows={1}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              支持批量输入，多个 ID 用空格、逗号或换行分隔 | 按 Enter 发送
            </p>
          </div>
        </div>

        {showIdList && entries.length > 0 && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">ID 列表</h3>
              <button
                onClick={() => setShowIdList(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XCircle className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-2 rounded-lg border ${
                    entry.status === 'valid'
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-gray-900 dark:text-white truncate">{entry.id}</p>
                      {entry.message && (
                        <p className="text-xs text-red-500 mt-1">{entry.message}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={copyAllIDs}
              className="w-full mt-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" /> 复制所有有效 ID
            </button>
          </div>
        )}
      </div>
    </div>
  )
}