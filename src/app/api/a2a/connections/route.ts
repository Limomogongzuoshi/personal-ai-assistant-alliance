import { NextResponse } from 'next/server'
import { generateA2AMessage, A2AMessage } from '@/lib/collaboration'

const connections: Map<string, any> = new Map()
const messageHistory: A2AMessage[] = []

export async function GET() {
  const connList = Array.from(connections.values())
  return NextResponse.json({ connections: connList, messageHistory })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, connectionId, fromDomain, toDomain, messageType, content } = body

  if (action === 'send_message') {
    const message = generateA2AMessage(fromDomain, toDomain, messageType, content)
    messageHistory.push(message)

    const connection = connections.get(connectionId)
    if (connection) {
      connection.lastInteraction = new Date().toISOString()
      connections.set(connectionId, connection)
    }

    return NextResponse.json({ success: true, message })
  }

  if (action === 'add_connection') {
    const newConnection = {
      id: `conn-${Date.now()}`,
      ...body,
      status: 'pending',
      createdAt: Date.now(),
    }
    connections.set(newConnection.id, newConnection)
    return NextResponse.json({ success: true, connection: newConnection })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}