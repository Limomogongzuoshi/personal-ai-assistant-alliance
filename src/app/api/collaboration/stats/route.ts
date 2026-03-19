import { NextResponse } from 'next/server'
import { knowledgeStore } from '@/lib/knowledge-store'
import { DOMAINS } from '@/lib/collaboration'

export async function GET() {
  const domainStats = DOMAINS.map((domain) => {
    const knowledge = knowledgeStore.getKnowledge(domain.id)
    const connections = knowledgeStore.getCrossDomainConnections(domain.id)
    const totalConnections = connections.reduce((sum, c) => sum + c.insightCount, 0)

    return {
      id: domain.id,
      name: domain.name,
      knowledgeCount: knowledge.length,
      lastUpdate: knowledge.length > 0
        ? new Date(Math.max(...knowledge.map((k) => k.timestamp))).toLocaleDateString('zh-CN')
        : '暂无',
      connections: totalConnections,
    }
  })

  const allKnowledge = knowledgeStore.getAllKnowledge()
  let totalKnowledge = 0
  let verifiedCount = 0
  allKnowledge.forEach((items) => {
    totalKnowledge += items.length
    verifiedCount += items.filter((k) => k.verified).length
  })

  const insights = knowledgeStore.getInsights()

  return NextResponse.json({
    domains: domainStats,
    global: {
      totalKnowledge,
      crossDomainInsights: insights.length,
      verifiedCount,
      activeConnections: domainStats.reduce((sum, d) => sum + d.connections, 0),
    },
  })
}