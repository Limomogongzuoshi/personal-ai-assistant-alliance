import { NextRequest, NextResponse } from 'next/server'
import { knowledgeBaseManager, RAGService } from '@/lib/knowledge-base'
import { DOMAINS, createSubAssistant, getSystemPrompt, type KnowledgeItem } from '@/lib/collaboration'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domainId = searchParams.get('domainId')

  if (domainId) {
    const assistant = await knowledgeBaseManager.getSubAssistant(domainId)
    if (!assistant) {
      return NextResponse.json({ success: false, error: 'Sub-assistant not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, assistant })
  }

  const assistants = await knowledgeBaseManager.getAllSubAssistants()
  return NextResponse.json({ success: true, assistants })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, domainId, config } = body

    if (action === 'generate') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const existing = await knowledgeBaseManager.getSubAssistant(domainId)
      if (existing) {
        return NextResponse.json({
          success: true,
          assistant: existing,
          message: 'Sub-assistant already exists',
        })
      }

      const assistant = await knowledgeBaseManager.createSubAssistant(domainId)
      return NextResponse.json({ success: true, assistant })
    }

    if (action === 'generate_all') {
      const assistants: any[] = []
      const errors: string[] = []

      for (const domain of DOMAINS) {
        try {
          const existing = await knowledgeBaseManager.getSubAssistant(domain.id)
          if (existing) {
            assistants.push(existing)
            continue
          }

          const assistant = await knowledgeBaseManager.createSubAssistant(domain.id)
          if (assistant) {
            assistants.push(assistant)
          }
        } catch (err) {
          errors.push(`Failed to generate assistant for ${domain.id}: ${err}`)
        }
      }

      return NextResponse.json({
        success: true,
        assistants,
        totalGenerated: assistants.length,
        errors: errors.length > 0 ? errors : undefined,
      })
    }

    if (action === 'update') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const updated = await knowledgeBaseManager.updateSubAssistant(domainId, config)
      return NextResponse.json({ success: true, assistant: updated })
    }

    if (action === 'system_prompt') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const systemPrompt = getSystemPrompt(domainId)
      return NextResponse.json({ success: true, systemPrompt })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}