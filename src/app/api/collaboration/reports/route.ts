import { NextResponse } from 'next/server'
import { knowledgeStore } from '@/lib/knowledge-store'
import { DOMAINS } from '@/lib/collaboration'

export async function GET() {
  const reports = DOMAINS.map((domain) => {
    const knowledge = knowledgeStore.getKnowledge(domain.id)
    const insights = knowledgeStore.getInsightsByDomain(domain.id)

    const weekNumber = Math.ceil((Date.now() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000))

    return {
      domainId: domain.id,
      weekNumber,
      content: `本周在 ${domain.name} 领域取得了持续进展。共新增 ${knowledge.length} 条知识记录，跨域协作产生了 ${insights.length} 条新洞见。`,
      keyInsights: insights.slice(0, 3).map((i) => i.title),
      nextWeekPlans: [
        `继续深入研究 ${domain.specialties[0]}`,
        '与其他领域助手分享最新发现',
        '更新知识库并验证信息准确性',
      ],
    }
  })

  return NextResponse.json({ reports })
}