import { NextRequest, NextResponse } from 'next/server'
import { xiaolongxiaSync, knowledgeBaseManager } from '@/lib/knowledge-base'
import { DOMAINS } from '@/lib/collaboration'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const domainId = searchParams.get('domainId')

  if (action === 'status') {
    const sources: any[] = []
    for (const domain of DOMAINS) {
      const domainSources = await knowledgeBaseManager.getKnowledgeSources(domain.id)
      const items = await knowledgeBaseManager.getKnowledgeItems(domain.id)
      sources.push({
        domainId: domain.id,
        domainName: domain.name,
        sourcesCount: domainSources.length,
        knowledgeCount: items.length,
        verifiedCount: items.filter(i => i.verified).length,
      })
    }

    return NextResponse.json({
      success: true,
      status: sources,
      syncConfig: knowledgeBaseManager.getSyncConfig(),
    })
  }

  if (action === 'check') {
    const config = knowledgeBaseManager.getSyncConfig()
    try {
      const response = await fetch(`${config.xiaolongxiaEndpoint}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        return NextResponse.json({ success: true, connected: true })
      } else {
        return NextResponse.json({ success: true, connected: false })
      }
    } catch {
      return NextResponse.json({ success: true, connected: false })
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, domainId, config } = body

    if (action === 'sync_to') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const result = await xiaolongxiaSync.syncToXiaolongxia(domainId)
      return NextResponse.json({ success: result.success, ...result })
    }

    if (action === 'sync_from') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const result = await xiaolongxiaSync.syncFromXiaolongxia(domainId)
      return NextResponse.json({ success: result.success, ...result })
    }

    if (action === 'sync_bidirectional') {
      if (!domainId) {
        return NextResponse.json({ success: false, error: 'domainId is required' }, { status: 400 })
      }

      const result = await xiaolongxiaSync.bidirectionalSync(domainId)
      return NextResponse.json({
        success: result.toXiaolongxia.success && result.fromXiaolongxia.success,
        ...result,
      })
    }

    if (action === 'sync_all') {
      const results: any[] = []
      for (const domain of DOMAINS) {
        const result = await xiaolongxiaSync.bidirectionalSync(domain.id)
        results.push({
          domainId: domain.id,
          domainName: domain.name,
          ...result,
        })
      }

      return NextResponse.json({
        success: true,
        results,
      })
    }

    if (action === 'configure') {
      if (config) {
        knowledgeBaseManager.setSyncConfig(config)
      }
      return NextResponse.json({
        success: true,
        syncConfig: knowledgeBaseManager.getSyncConfig(),
      })
    }

    if (action === 'start_auto_sync') {
      xiaolongxiaSync.startAutoSync()
      return NextResponse.json({ success: true, message: 'Auto sync started' })
    }

    if (action === 'stop_auto_sync') {
      xiaolongxiaSync.stopAutoSync()
      return NextResponse.json({ success: true, message: 'Auto sync stopped' })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}