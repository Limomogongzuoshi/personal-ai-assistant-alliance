import { NextRequest, NextResponse } from 'next/server'
import { knowledgeStore } from '@/lib/knowledge-store'
import { createKnowledgeItem } from '@/lib/collaboration'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const knowledge = knowledgeStore.getKnowledge(id)

  return NextResponse.json({ knowledge })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { title, content, source } = body

  if (!title) {
    return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
  }

  const item = createKnowledgeItem(id, title, content || '', source || '个人笔记', [])
  knowledgeStore.addKnowledge(item)

  return NextResponse.json({ success: true, item })
}