import { NextRequest, NextResponse } from 'next/server'
import { saveMessage, getMessages, updateChatTitle } from '@/lib/db'
import { SendMessageRequest } from '@/lib/models/Chat'
import { AI_CONFIG, ERROR_MESSAGES } from '@/lib/config'
import { generateAITitle, callGeminiAPI } from '@/lib/utils'

// AI Model Configuration
const AI_MODEL_CONFIG = {
  maxInputTokens: 1000000,
  maxOutputTokens: 8192,
  maxMessageLength: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const

// Error types for better handling
interface AIError {
  type: 'rate_limit' | 'token_limit' | 'network' | 'api_error' | 'unknown'
  message: string
  status?: number
  retryable: boolean
}

export const runtime = 'nodejs'

// Utility functions for AI API handling
function classifyAIError(error: any): AIError {
  const message = error.message || String(error)
  
  if (message.includes('429') || message.includes('rate limit')) {
    return {
      type: 'rate_limit',
      message: 'Rate limit exceeded. Please try again in a few moments.',
      status: 429,
      retryable: true
    }
  }
  
  if (message.includes('400') || message.includes('token') || message.includes('length')) {
    return {
      type: 'token_limit',
      message: 'Message too long. Please try a shorter message.',
      status: 400,
      retryable: false
    }
  }
  
  if (message.includes('fetch failed') || message.includes('network') || message.includes('Error fetching')) {
    return {
      type: 'network',
      message: 'Network connection issue. Please check your internet connection.',
      status: 0,
      retryable: true
    }
  }
  
  if (message.includes('500') || message.includes('internal')) {
    return {
      type: 'api_error',
      message: 'AI service temporarily unavailable. Please try again.',
      status: 500,
      retryable: true
    }
  }
  
  if (message.includes('403') || message.includes('Forbidden') || message.includes('API key')) {
    return {
      type: 'api_error',
      message: 'API key issue. Please check your configuration.',
      status: 403,
      retryable: false
    }
  }
  
  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again.',
    status: undefined,
    retryable: true
  }
}

function truncateMessage(message: string, maxLength: number = AI_MODEL_CONFIG.maxMessageLength): string {
  console.log('TruncateMessage Input:', {
    messageLength: message.length,
    maxLength,
    needsTruncation: message.length > maxLength
  })
  
  if (message.length <= maxLength) {
    console.log('No truncation needed')
    return message
  }
  
  // Try to truncate at a sentence boundary
  const truncated = message.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastQuestion = truncated.lastIndexOf('?')
  const lastExclamation = truncated.lastIndexOf('!')
  
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation)
  
  let result: string
  
  if (lastSentenceEnd > maxLength * 0.8) { // If we can find a good break point
    result = truncated.substring(0, lastSentenceEnd + 1) + ' [Message truncated due to length]'
  } else {
    result = truncated + ' [Message truncated due to length]'
  }
  
  console.log('TruncateMessage Output:', {
    originalLength: message.length,
    truncatedLength: result.length,
    truncationPoint: lastSentenceEnd,
    truncationMethod: lastSentenceEnd > maxLength * 0.8 ? 'sentence_boundary' : 'hard_cut'
  })
  
  return result
}

async function generateContentWithRetry(message: string, retryCount = 0): Promise<string> {
  try {
    console.log(`Attempting AI call (attempt ${retryCount + 1})...`)
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 60000) // 60 second timeout
    })
    
    const aiPromise = callGeminiAPI(message, AI_CONFIG.apiKey)
    const result = await Promise.race([aiPromise, timeoutPromise]) as string
    console.log('AI call successful, response length:', result.length)
    return result
    
  } catch (error: any) {
    console.error(`AI call failed (attempt ${retryCount + 1}):`, error.message)
    const aiError = classifyAIError(error)
    
    if (aiError.retryable && retryCount < AI_MODEL_CONFIG.retryAttempts) {
      console.log(`Retrying in ${AI_MODEL_CONFIG.retryDelay * (retryCount + 1)}ms...`)
      await new Promise(resolve => setTimeout(resolve, AI_MODEL_CONFIG.retryDelay * (retryCount + 1)))
      return generateContentWithRetry(message, retryCount + 1)
    }
    
    throw aiError
  }
}

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

    // Check if API key is configured
    if (!AI_CONFIG.apiKey) {
      console.log('No API key configured, using fallback response')
      const fallbackResponse = "I'm currently experiencing technical difficulties with my AI service. Please try again later or contact support if the issue persists. In the meantime, I can help you with basic interview preparation tips: 1) Research the company thoroughly, 2) Practice common interview questions, 3) Prepare specific examples from your experience, 4) Dress professionally, and 5) Follow up with a thank you email."
      
      await saveMessage(chatId, fallbackResponse, 'assistant', {
        model: 'fallback',
        tokens: Math.ceil(fallbackResponse.length / 4)
      })

      return NextResponse.json({ 
        message: fallbackResponse,
        timestamp: new Date().toISOString()
      })
    }

    // Validate API key format
    if (AI_CONFIG.apiKey.length < 20) {
      console.log('API key appears to be invalid, using fallback response')
      const fallbackResponse = "I'm currently experiencing technical difficulties with my AI service. Please check your API key configuration. In the meantime, here are some interview preparation tips: 1) Research the company thoroughly, 2) Practice common interview questions, 3) Prepare specific examples from your experience, 4) Dress professionally, and 5) Follow up with a thank you email."
      
      await saveMessage(chatId, fallbackResponse, 'assistant', {
        model: 'fallback',
        tokens: Math.ceil(fallbackResponse.length / 4)
      })

      return NextResponse.json({ 
        message: fallbackResponse,
        timestamp: new Date().toISOString()
      })
    }



    // Use the configured AI model
    console.log('AI Config:', {
      model: AI_CONFIG.model,
      hasApiKey: !!AI_CONFIG.apiKey,
      apiKeyLength: AI_CONFIG.apiKey?.length
    })

    // Create a context-aware prompt for interview preparation
    let enhancedMessage = message
    
    // Log the original message details
    console.log('=== CHAT MESSAGE LOG ===')
    console.log('Original Message Length:', message.length)
    console.log('Original Message:', message)
    
    // If the message contains job description and resume upload context, enhance the prompt
    if (message.toLowerCase().includes('job description') && message.toLowerCase().includes('resume')) {
      enhancedMessage = `You are an expert interview preparation assistant. The user has uploaded their resume and provided a job description. 

Please analyze their resume against the job description and provide:

1. **Skills Gap Analysis**: Identify skills they have vs. what the job requires
2. **Experience Alignment**: How well their experience matches the role
3. **Interview Preparation Tips**: Specific advice for this role
4. **Potential Questions**: Questions they might be asked based on their background
5. **Strengths to Highlight**: Key strengths from their resume for this role
6. **Areas to Address**: Potential concerns or gaps to prepare for

User's message: ${message}

Please provide a comprehensive, helpful response that will help them prepare for their interview.`
    } else {
      // For simple messages, use a basic prompt
      enhancedMessage = `You are a helpful AI assistant. Please respond to: ${message}`
    }
    
    console.log('Enhanced Message Length:', enhancedMessage.length)
    console.log('Enhanced Message:', enhancedMessage)
    console.log('=== END CHAT MESSAGE LOG ===')

    // Check message length and truncate if necessary
    const originalEnhancedLength = enhancedMessage.length
    enhancedMessage = truncateMessage(enhancedMessage)
    console.log('Message Truncation:', {
      originalLength: originalEnhancedLength,
      truncatedLength: enhancedMessage.length,
      wasTruncated: originalEnhancedLength !== enhancedMessage.length
    })

    try {
      // Use the retry mechanism with proper error handling
      const text = await generateContentWithRetry(enhancedMessage)

      // Save assistant response to database
      await saveMessage(chatId, text, 'assistant', {
        model: AI_CONFIG.model,
        tokens: Math.ceil(text.length / 4) // Better token approximation
      })

      return NextResponse.json({ 
        message: text,
        timestamp: new Date().toISOString()
      })
    } catch (aiError: any) {
      // Log the actual error for debugging
      console.error('AI Error Details:', {
        message: aiError.message,
        stack: aiError.stack,
        type: aiError.type,
        status: aiError.status,
        code: aiError.code
      })
      
      // Classify the error for better handling
      const classifiedError = classifyAIError(aiError)
      console.log('Classified Error:', classifiedError)
      
      // Create context-aware fallback response based on error type
      let fallbackResponse = ''
      
      switch (classifiedError.type) {
        case 'rate_limit':
          fallbackResponse = `I'm currently experiencing high demand. Please wait a moment and try again. In the meantime, here are some quick interview tips for "${message}": Research the company, prepare STAR method responses, and practice your elevator pitch.`
          break
          
        case 'token_limit':
          fallbackResponse = `Your message was too long for me to process. Please try breaking it into smaller parts or ask a more specific question. For "${message}", focus on the most important aspects.`
          break
          
        case 'network':
          fallbackResponse = `I'm having trouble connecting to my AI service. Please check your internet connection and try again. For "${message}", consider researching the company and preparing specific examples from your experience.`
          break
          
        case 'api_error':
          fallbackResponse = `The AI service is temporarily unavailable. Please try again in a few minutes. For "${message}", focus on preparing relevant examples and researching the role requirements.`
          break
          
        default:
          // Create a more intelligent fallback response for resume analysis
          if (message.toLowerCase().includes('resume') && message.toLowerCase().includes('job description')) {
            fallbackResponse = `I apologize, but I'm currently experiencing technical difficulties with my AI service. However, I can still provide some general interview preparation advice:

**General Interview Tips:**
1. Research the company thoroughly - understand their mission, values, and recent news
2. Practice common interview questions using the STAR method (Situation, Task, Action, Result)
3. Prepare specific examples from your experience that demonstrate relevant skills
4. Dress professionally and arrive early
5. Follow up with a thank you email within 24 hours

**For Front-End Developer Roles:**
- Be prepared to discuss your experience with JavaScript, React, and Next.js
- Have examples of responsive design projects you've worked on
- Understand modern web development practices and tools
- Be ready to discuss performance optimization techniques
- Know how to work with design teams and backend developers

**Technical Preparation:**
- Review JavaScript fundamentals and ES6+ features
- Understand React hooks, state management, and component lifecycle
- Be familiar with Next.js routing, API routes, and SSR/SSG
- Know CSS frameworks like Tailwind CSS or Bootstrap
- Understand responsive design principles and mobile-first development

Please try again later when the AI service is available for a more personalized analysis.`
          } else {
            fallbackResponse = `I apologize, but I'm currently experiencing technical difficulties. Here are some general interview preparation tips for "${message}": 1) Research the company thoroughly, 2) Practice common questions, 3) Prepare specific examples, 4) Dress appropriately, and 5) Follow up with a thank you email.`
          }
      }

      await saveMessage(chatId, fallbackResponse, 'assistant', {
        model: 'fallback',
        tokens: Math.ceil(fallbackResponse.length / 4)
      })

      return NextResponse.json({ 
        message: fallbackResponse,
        timestamp: new Date().toISOString()
      })
    }

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
