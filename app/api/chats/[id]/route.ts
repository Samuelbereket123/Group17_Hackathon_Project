import { NextRequest, NextResponse } from 'next/server'
import { getChat, updateChatTitle, deleteChat } from '@/lib/db'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const chat = await getChat(id)
    
    if (!chat) {
      return NextResponse.json({ error: ERROR_MESSAGES.chat.chatNotFound }, { status: 404 })
    }
    
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
    console.error('Get chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get chat', details: error?.message || String(error) }, 
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title } = await request.json()
    
    if (!title) {
      return NextResponse.json({ error: ERROR_MESSAGES.chat.titleRequired }, { status: 400 })
    }
    
    await updateChatTitle(id, title)
    
    return NextResponse.json({ success: true, message: SUCCESS_MESSAGES.chat.updated })

  } catch (error: any) {
    console.error('Update chat error:', error)
    return NextResponse.json(
      { error: 'Failed to update chat', details: error?.message || String(error) }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteChat(id)
    
    return NextResponse.json({ success: true, message: SUCCESS_MESSAGES.chat.deleted })

  } catch (error: any) {
    console.error('Delete chat error:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat', details: error?.message || String(error) }, 
      { status: 500 }
    )
  }
} 