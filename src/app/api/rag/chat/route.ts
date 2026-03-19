import { NextRequest, NextResponse } from 'next/server'
import { knowledgeBaseManager, ragService } from '@/lib/knowledge-base'
import { getSystemPrompt, DOMAINS } from '@/lib/collaboration'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, domainId, conversationHistory, useRAG } = body

    if (!query || !domainId) {
      return NextResponse.json({ success: false, error: 'query and domainId are required' }, { status: 400 })
    }

    const domain = await import('@/lib/collaboration').then(m => m.DOMAINS.find(d => d.id === domainId))
    if (!domain) {
      return NextResponse.json({ success: false, error: 'Invalid domainId' }, { status: 400 })
    }

    let retrievedKnowledge: any[] = []
    let ragEnhanced = false

    if (useRAG !== false) {
      try {
        const retrieved = await ragService.retrieve(query, domainId)
        retrievedKnowledge = retrieved

        if (retrieved.length > 0) {
          ragEnhanced = true
        }
      } catch (err) {
        console.error('RAG retrieval error:', err)
      }
    }

    const systemPrompt = getSystemPrompt(domainId)

    let enhancedContext = ''
    if (retrievedKnowledge.length > 0) {
      enhancedContext = `\n\n以下是相关知识库内容：\n`
      retrievedKnowledge.slice(0, 3).forEach((item, i) => {
        enhancedContext += `\n[${i + 1}] ${item.title}\n${item.content}\n`
      })
    }

    const fullPrompt = `${systemPrompt}${enhancedContext}\n\n用户问题：${query}`

    const mockResponse = generateDomainResponse(query, domainId, retrievedKnowledge)

    return NextResponse.json({
      success: true,
      response: mockResponse,
      rag: {
        enhanced: ragEnhanced,
        sourcesCount: retrievedKnowledge.length,
        sources: retrievedKnowledge.slice(0, 5).map(item => ({
          id: item.id,
          title: item.title,
          source: item.source,
        })),
      },
      metadata: {
        domain: domain.name,
        domainIcon: domain.icon,
        assistantName: domain.assistantName,
      },
    })
  } catch (error) {
    console.error('RAG chat error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

function generateDomainResponse(query: string, domainId: string, knowledge: any[]): string {
  const domain = DOMAINS.find(d => d.id === domainId)
  const domainName = domain?.name || '通用'
  const domainIcon = domain?.icon || '🤖'

  if (knowledge.length > 0) {
    const knowledgeContext = knowledge
      .slice(0, 3)
      .map((k, i) => `[${i + 1}] ${k.title}：${k.content.substring(0, 100)}${k.content.length > 100 ? '...' : ''}`)
      .join('\n')

    return `🌟 **${domainIcon} ${domainName}领域专家为您解答**

关于您的问题："${query}"

${knowledgeContext}

---
💡 **综合分析**

根据检索到的 ${knowledge.length} 条相关知识，这个问题可以从以下几个方面来理解：

**核心要点：**
${knowledge.slice(0, 2).map((k, i) => `${i + 1}. ${k.title}：${k.content.substring(0, 80)}...`).join('\n')}

如果您需要更深入的了解，可以继续提问，我会结合更多专业知识为您解答。`
  }

  return `🌟 **${domainIcon} ${domainName}领域专家为您解答**

关于您的问题："${query}"

目前知识库中暂无相关内容匹配，但根据 ${domainName} 领域的一般知识：

**初步分析：**
这是一个很好的 ${domainName} 相关问题。该领域涉及 ${domain?.specialties?.slice(0, 3).join('、') || '多个方面'} 等专业知识。

**建议：**
• 您可以尝试使用更具体的关键词
• 或者添加更多背景信息帮助我理解您的问题
• 如果您知道答案，也可以帮助我们完善知识库

${domain?.description || '我会尽力结合专业知识为您解答。'}`
}