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

    // Validate API key
    if (!AI_CONFIG.apiKey || AI_CONFIG.apiKey === 'AIzaSyDAveeImm5DzF3aX4lIknUM0yfQcCmGPOA') {
      return NextResponse.json(
        { error: 'Invalid or missing Google AI API key. Please set GOOGLE_AI_API_KEY environment variable.' }, 
        { status: 500 }
      )
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

    // Add timeout and better error handling
    const result = await Promise.race([
      model.generateContent(message),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
    ]) as any

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
    console.error('Chat API error:', error)
    
    // Provide more specific error messages
    let errorMessage: string = ERROR_MESSAGES.ai.generationFailed
    if (error?.message?.includes('fetch failed')) {
      errorMessage = 'Network error: Unable to connect to AI service. Please check your internet connection.'
    } else if (error?.message?.includes('timeout')) {
      errorMessage = 'Request timeout: AI service is taking too long to respond.'
    } else if (error?.message?.includes('API key')) {
      errorMessage = 'Authentication error: Invalid API key.'
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.message || String(error) }, 
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
