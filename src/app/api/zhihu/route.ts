import { NextRequest, NextResponse } from 'next/server'
import { zhihuManager } from '@/lib/zhihu-manager'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')
  const ringId = searchParams.get('ringId')
  const postId = searchParams.get('postId')
  const hours = parseInt(searchParams.get('hours') || '24')
  const keyword = searchParams.get('keyword')
  const page = parseInt(searchParams.get('page') || '1')

  try {
    if (action === 'rings') {
      const rings = zhihuManager.getAvailableRings()
      return NextResponse.json({ success: true, rings })
    }

    if (action === 'detail') {
      if (!ringId) {
        return NextResponse.json({ error: '缺少 ringId 参数' }, { status: 400 })
      }
      const result = await zhihuManager.getRingDetail(ringId)
      return NextResponse.json(result)
    }

    if (action === 'posts') {
      const result = await zhihuManager.getRingPosts(ringId || undefined, page)
      return NextResponse.json(result)
    }

    if (action === 'comments') {
      if (!postId) {
        return NextResponse.json({ error: '缺少 postId 参数' }, { status: 400 })
      }
      const contentType = searchParams.get('contentType') as 'pin' | 'comment' || 'pin'
      const page = parseInt(searchParams.get('page') || '1')
      const pageSize = parseInt(searchParams.get('pageSize') || '10')
      const result = await zhihuManager.getCommentList(postId, contentType, page, pageSize)
      return NextResponse.json(result)
    }

    if (action === 'billboard') {
      const result = await zhihuManager.getBillboard(hours)
      return NextResponse.json(result)
    }

    if (action === 'search') {
      if (!keyword) {
        return NextResponse.json({ error: '缺少 keyword 参数' }, { status: 400 })
      }
      const count = parseInt(searchParams.get('count') || '10')
      const result = await zhihuManager.searchGlobal(keyword, count)
      return NextResponse.json(result)
    }

    if (action === 'check') {
      const configured = zhihuManager.isConfigured()
      const remaining = zhihuManager.getRemainingCalls()
      return NextResponse.json({ success: true, configured, remainingCalls: remaining })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, ringId, title, content, images, targetId, targetType, targetAction, postId, commentId, contentType } = body

  try {
    if (action === 'publish_pin') {
      if (!ringId || !content) {
        return NextResponse.json({ error: '缺少必填参数 (ringId, content)' }, { status: 400 })
      }
      const result = await zhihuManager.publishPin({ ringId, title, content, images })
      return NextResponse.json(result)
    }

    if (action === 'reaction') {
      if (!targetId || !targetType || !targetAction) {
        return NextResponse.json({ error: '缺少必填参数 (targetId, targetType, action)' }, { status: 400 })
      }
      const result = await zhihuManager.setReaction({
        targetId,
        targetType,
        action: targetAction,
      })
      return NextResponse.json(result)
    }

    if (action === 'comment') {
      if (!postId || !content) {
        return NextResponse.json({ error: '缺少必填参数 (postId, content)' }, { status: 400 })
      }
      const result = await zhihuManager.createComment({ postId, content, contentType })
      return NextResponse.json(result)
    }

    if (action === 'delete_comment') {
      if (!commentId) {
        return NextResponse.json({ error: '缺少必填参数 (commentId)' }, { status: 400 })
      }
      const result = await zhihuManager.deleteComment(commentId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}