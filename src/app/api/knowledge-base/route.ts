import { NextRequest, NextResponse } from 'next/server'
import { knowledgeBaseManager, ragService, chunkText, extractKeywords } from '@/lib/knowledge-base'
import { DOMAINS, type KnowledgeItem } from '@/lib/collaboration'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domainId = searchParams.get('domainId')
  const source = searchParams.get('source')

  if (source === 'sources') {
    if (!domainId) {
      const allSources: any[] = []
      for (const d of DOMAINS) {
        const sources = await knowledgeBaseManager.getKnowledgeSources(d.id)
        allSources.push(...sources)
      }
      return NextResponse.json({ success: true, sources: allSources })
    }
    const sources = await knowledgeBaseManager.getKnowledgeSources(domainId)
    return NextResponse.json({ success: true, sources })
  }

  if (domainId) {
    const verified = searchParams.get('verified')
    const type = searchParams.get('type') as KnowledgeItem['type'] | null

    const filters: any = {}
    if (verified !== null) filters.verified = verified === 'true'
    if (type) filters.type = type

    const knowledge = await knowledgeBaseManager.getKnowledgeItems(domainId, filters)
    return NextResponse.json({ success: true, knowledge })
  }

  return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, domainId, data } = body

    if (action === 'add_item') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const item = await knowledgeBaseManager.addKnowledgeItem(domainId, {
        title: data.title,
        content: data.content,
        source: data.source || 'manual',
        tags: data.tags || [],
        type: data.type || 'article',
      })

      return NextResponse.json({ success: true, item })
    }

    if (action === 'add_source') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const source = await knowledgeBaseManager.addKnowledgeSource(domainId, {
        domainId,
        type: data.type,
        url: data.url,
        name: data.name,
      })

      return NextResponse.json({ success: true, source })
    }

    if (action === 'sync_source') {
      if (!domainId || !data.sourceId) {
        return NextResponse.json({ success: false, error: 'domainId and sourceId are required' }, { status: 400 })
      }

      const result = await knowledgeBaseManager.syncSource(domainId, data.sourceId)
      return NextResponse.json({ ...result })
    }

    if (action === 'batch_add') {
      if (!domainId || !Array.isArray(data.items)) {
        return NextResponse.json({ success: false, error: 'domainId and items array are required' }, { status: 400 })
      }

      const items: KnowledgeItem[] = []
      for (const item of data.items) {
        const newItem = await knowledgeBaseManager.addKnowledgeItem(domainId, {
          title: item.title,
          content: item.content,
          source: item.source || 'batch_import',
          tags: item.tags || [],
          type: item.type || 'article',
        })
        items.push(newItem)
      }

      return NextResponse.json({ success: true, itemsAdded: items.length, items })
    }

    if (action === 'chunk_text') {
      const { text, chunkSize, overlap } = data
      const chunks = chunkText(text, chunkSize || 500, overlap || 50)
      return NextResponse.json({ success: true, chunks })
    }

    if (action === 'extract_keywords') {
      const { text, topN } = data
      const keywords = extractKeywords(text, topN || 10)
      return NextResponse.json({ success: true, keywords })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domainId = searchParams.get('domainId')
  const itemId = searchParams.get('itemId')

  if (!domainId || !itemId) {
    return NextResponse.json({ success: false, error: 'domainId and itemId are required' }, { status: 400 })
  }

  const deleted = await knowledgeBaseManager.deleteKnowledgeItem(domainId, itemId)
  return NextResponse.json({ success: deleted })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { domainId, itemId, verified } = body

    if (!domainId || !itemId) {
      return NextResponse.json({ success: false, error: 'domainId and itemId are required' }, { status: 400 })
    }

    if (verified !== undefined) {
      const verified_item = await knowledgeBaseManager.verifyKnowledgeItem(domainId, itemId)
      return NextResponse.json({ success: verified_item })
    }

    return NextResponse.json({ success: false, error: 'No valid update fields' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}