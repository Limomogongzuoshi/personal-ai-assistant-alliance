import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question } = body

    if (!question) {
      return NextResponse.json({ error: '问题不能为空' }, { status: 400 })
    }

    const { routeQuestion, getSuggestedQuestions } = await import('@/lib/routing')
    const routing = routeQuestion(question)

    return NextResponse.json({
      success: true,
      routing,
      suggestedQuestions: getSuggestedQuestions(routing.primaryDomain)
    })
  } catch (error: any) {
    console.error('AI route error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'AI Router API working' })
}