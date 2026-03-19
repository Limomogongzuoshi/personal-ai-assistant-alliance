import { NextRequest, NextResponse } from 'next/server'
import { knowledgeStore } from '@/lib/knowledge-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { itemId } = body

  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
  }

  const success = knowledgeStore.verifyKnowledge(itemId, id)
  return NextResponse.json({ success })
}