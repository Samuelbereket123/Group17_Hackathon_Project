import { NextRequest, NextResponse } from 'next/server'
import { createChat, getChats, deleteChat, updateChatTitle } from '@/lib/db'
import { CreateChatRequest } from '@/lib/models/Chat'
import { APP_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { title, userId }: CreateChatRequest = await request.json()
    
    const chat = await createChat(title || APP_CONFIG.defaultChatTitle, userId)
    
    return NextResponse.json({ 
      chat: {
        id: chat._id?.toString(),
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messageCount
      }
    })

  } catch (error: any) {
    console.error('Create chat error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.database.queryFailed, details: error?.message || String(error) }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const chats = await getChats(userId || undefined)
    
    return NextResponse.json({ 
      chats: chats.map(chat => ({
        id: chat._id?.toString(),
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messageCount
      }))
    })

  } catch (error: any) {
    console.error('Get chats error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.database.queryFailed, details: error?.message || String(error) }, 
      { status: 500 }
    )
  }
} 