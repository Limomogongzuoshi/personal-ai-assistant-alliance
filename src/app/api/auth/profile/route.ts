import { NextRequest, NextResponse } from 'next/server'
import { getSession, callSecondMeAPI } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const [userInfo, shadesInfo] = await Promise.all([
      callSecondMeAPI('/api/secondme/user/info', session.accessToken),
      callSecondMeAPI('/api/secondme/user/info/shades', session.accessToken).catch(() => null),
    ])

    return NextResponse.json({
      user: {
        id: session.secondmeUserId,
        name: userInfo.name ?? null,
        email: userInfo.email ?? null,
        avatarUrl: userInfo.avatar ?? null,
        bio: userInfo.bio ?? null,
        domains: userInfo.domains ?? [],
      },
      shades: shadesInfo ? {
        personality: shadesInfo.personality ?? null,
        capabilities: shadesInfo.capabilities ?? [],
        specialties: shadesInfo.specialties ?? [],
      } : null,
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: '获取档案失败' }, { status: 500 })
  }
}