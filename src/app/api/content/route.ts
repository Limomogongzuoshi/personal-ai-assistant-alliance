import { NextRequest, NextResponse } from 'next/server'
import { contentManager, CONTENT_TEMPLATES } from '@/lib/content-manager'

export async function GET() {
  const articles = contentManager.getArticles()
  const publishQueue = contentManager.getPublishQueue()
  const platformConfigs = contentManager.getPlatformConfigs()
  const templates = CONTENT_TEMPLATES

  return NextResponse.json({
    articles,
    publishQueue,
    platformConfigs,
    templates,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, articleId, platform, title, content, excerpt, domainId, tags, config } = body

  if (action === 'create') {
    if (!title || !content || !domainId) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }
    const article = contentManager.createArticle(title, content, excerpt || '', domainId, tags || [])
    return NextResponse.json({ success: true, article })
  }

  if (action === 'update') {
    if (!articleId) {
      return NextResponse.json({ error: '缺少articleId' }, { status: 400 })
    }
    const article = contentManager.updateArticle(articleId, { title, content, excerpt, tags })
    return NextResponse.json({ success: true, article })
  }

  if (action === 'delete') {
    if (!articleId) {
      return NextResponse.json({ error: '缺少articleId' }, { status: 400 })
    }
    const success = contentManager.deleteArticle(articleId)
    return NextResponse.json({ success })
  }

  if (action === 'publish') {
    if (!articleId || !platform) {
      return NextResponse.json({ error: '缺少articleId或platform' }, { status: 400 })
    }
    try {
      const record = await contentManager.publishToPlatform(articleId, platform)
      return NextResponse.json({ success: true, record })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (action === 'update_config') {
    if (!platform || !config) {
      return NextResponse.json({ error: '缺少platform或config' }, { status: 400 })
    }
    contentManager.updatePlatformConfig(platform, config)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: '未知操作' }, { status: 400 })
}