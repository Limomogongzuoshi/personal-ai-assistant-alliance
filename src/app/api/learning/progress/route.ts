import { NextRequest, NextResponse } from 'next/server'
import { learningStore } from '@/lib/learning-store'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const domainId = searchParams.get('domainId')

  if (domainId) {
    const progress = learningStore.getProgress(domainId)
    if (!progress) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }
    return NextResponse.json({ progress })
  }

  const allProgress = learningStore.getAllProgress()
  const totalXp = learningStore.getTotalXp()
  const leaderboard = learningStore.getLeaderboard()

  return NextResponse.json({
    progress: allProgress,
    totalXp,
    leaderboard,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, domainId, milestoneId, weeklyGoal } = body

  if (action === 'complete_milestone') {
    if (!domainId || !milestoneId) {
      return NextResponse.json({ error: 'Missing domainId or milestoneId' }, { status: 400 })
    }
    const success = learningStore.completeMilestone(domainId, milestoneId)
    return NextResponse.json({ success })
  }

  if (action === 'set_weekly_goal') {
    if (!domainId || !weeklyGoal) {
      return NextResponse.json({ error: 'Missing domainId or weeklyGoal' }, { status: 400 })
    }
    learningStore.setWeeklyGoal(domainId, weeklyGoal)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}