import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { saveMessage, getMessages, updateChatTitle } from '@/lib/db'
import { SendMessageRequest } from '@/lib/models/Chat'
import { AI_CONFIG, ERROR_MESSAGES } from '@/lib/config'
import { generateAITitle } from '@/lib/utils'

export const runtime = 'nodejs'
const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey)

export async function POST(request: NextRequest) {
  try {
    const { chatId, message }: SendMessageRequest = await request.json()

    if (!message || !chatId) {
      return NextResponse.json({ error: ERROR_MESSAGES.chat.messageRequired + ' and ' + ERROR_MESSAGES.chat.chatIdRequired }, { status: 400 })
    }

    // Save user message to database
    await saveMessage(chatId, message, 'user')

    // If this is the first message, generate a title based on the content
    const messages = await getMessages(chatId)
    if (messages.length === 1) { // Only the user message we just saved
      const title = generateAITitle(message)
      await updateChatTitle(chatId, title)
    }

    // Use the configured AI model
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.model })

    const result = await model.generateContent(message)
    const response = await result.response
    const text = response.text()

    // Save assistant response to database
    await saveMessage(chatId, text, 'assistant', {
      model: AI_CONFIG.model,
      tokens: response.text().length // Approximate token count
    })

    return NextResponse.json({ 
      message: text,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Chat API error:', error, error?.stack, error?.message)
    return NextResponse.json(
      { error: ERROR_MESSAGES.ai.generationFailed, details: error?.message || String(error) }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json({ error: ERROR_MESSAGES.chat.chatIdRequired }, { status: 400 })
    }

    const messages = await getMessages(chatId)
    return NextResponse.json({ messages })

  } catch (error: any) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.database.queryFailed, details: error?.message || String(error) }, 
      { status: 500 }
    )
  }
} 
