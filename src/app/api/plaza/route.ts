import { NextRequest, NextResponse } from 'next/server'
import { plazaManager } from '@/lib/plaza-manager'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const groupId = searchParams.get('groupId')
  const domainId = searchParams.get('domainId')
  const action = searchParams.get('action')

  try {
    if (action === 'groups') {
      const groups = await plazaManager.getGroups()
      return NextResponse.json({ groups })
    }

    if (action === 'joined') {
      const groups = plazaManager.getJoinedGroups()
      return NextResponse.json({ groups })
    }

    if (action === 'recommended') {
      const groups = plazaManager.getRecommendedGroups()
      return NextResponse.json({ groups })
    }

    if (groupId) {
      const posts = await plazaManager.getPostsByGroup(groupId)
      return NextResponse.json({ posts })
    }

    if (domainId) {
      const posts = await plazaManager.getPostsByDomain(domainId)
      return NextResponse.json({ posts })
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, groupId, title, content, articleId } = body

  try {
    if (action === 'create_post') {
      if (!groupId || !title || !content) {
        return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
      }
      const post = await plazaManager.createPost(groupId, title, content)
      return NextResponse.json({ success: true, post })
    }

    if (action === 'publish_article') {
      if (!groupId || !articleId || !title || !content) {
        return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
      }
      const result = await plazaManager.publishArticleToPlaza(articleId, groupId, title, content)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}