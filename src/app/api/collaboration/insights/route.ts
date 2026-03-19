import { NextResponse } from 'next/server'
import { knowledgeStore } from '@/lib/knowledge-store'

export async function GET() {
  const insights = knowledgeStore.getInsights()
  return NextResponse.json({ insights })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { domains, title, content, confidence } = body

  if (!domains || !title || !content) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
  }

  const insight = {
    id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    domains,
    title,
    content,
    timestamp: Date.now(),
    confidence: confidence || 0.8,
  }

  knowledgeStore.addInsight(insight)
  return NextResponse.json({ success: true, insight })
}