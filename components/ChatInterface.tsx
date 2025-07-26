'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { IChatMessage } from '@/lib/models/Chat'
import { formatMessage, generateChatTitle } from '@/lib/utils'
import { APP_CONFIG } from '@/lib/config'
import { api } from '@/lib/api'
import ChatSetup from './ChatSetup'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatInterfaceProps {
  chatId?: string
  onChatCreated?: (chatId: string) => void
  currentChatTitle?: string
}

export default function ChatInterface({ chatId, onChatCreated, currentChatTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [resumeId, setResumeId] = useState<string>('')
  const [jobDescription, setJobDescription] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId)
      setShowSetup(false)
    } else {
      setMessages([])
      setShowSetup(true)
    }
  }, [chatId])

  const loadMessages = async (chatId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await api.getMessages(chatId)
      if (response.success && response.data?.messages) {
        const formattedMessages: Message[] = response.data.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const createNewChat = async (resumeId?: string, jobDescription?: string) => {
    try {
      const response = await api.createChat(APP_CONFIG.defaultChatTitle)
      if (response.success && response.data?.chat) {
        onChatCreated?.(response.data.chat.id)
        
        // If we have resume and job description, send an initial message
        if (resumeId && jobDescription) {
          const initialMessage = `I've uploaded my resume and here's the job description I'm interested in:

Job Description:
${jobDescription}

Please help me prepare for this interview by analyzing my resume against this job description and providing personalized advice.`
          
          // Send the initial message
          await api.sendMessage(response.data.chat.id, initialMessage)
          
          // Reload messages to show the conversation
          await loadMessages(response.data.chat.id)
        }
      }
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleSetupComplete = async (resumeId: string, jobDescription: string) => {
    setResumeId(resumeId)
    setJobDescription(jobDescription)
    await createNewChat(resumeId, jobDescription)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // If no chatId, create a new chat first
    if (!chatId) {
      await createNewChat()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await api.sendMessage(chatId, inputMessage)

      if (response.success && response.data) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.message,
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Show setup screen for new chats
  if (showSetup) {
    return (
      <div className="w-full min-h-[400px] h-full max-h-[700px] flex items-center justify-center p-4">
        <ChatSetup onSetupComplete={handleSetupComplete} />
      </div>
    )
  }

  return (
    // Ensure the Card fills available height and is responsive
    <Card className="w-full min-h-[400px] h-full max-h-[700px] flex flex-col shadow-lg border-0">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-700">
          {!chatId && (
            <span className="text-sm font-normal text-blue-600">(New Chat)</span>
          )}
          {chatId && currentChatTitle && currentChatTitle !== APP_CONFIG.defaultChatTitle && (
            <span className="text-sm font-normal text-blue-600">• {currentChatTitle}</span>
          )}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Message area: always scrolls if content overflows */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" style={{scrollbarWidth:'thin'}}>
          {isLoadingMessages ? (
            <div className="text-center text-gray-400 mt-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 && !chatId ? (
            <div className="text-center text-gray-400 mt-16 select-none">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 text-3xl font-bold">G</div>
              <p className="text-base">Start a conversation with Gemini AI</p>
              <p className="text-sm mt-2">Type a message below to begin</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-16 select-none">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 text-3xl font-bold">G</div>
              <p className="text-base">No messages in this chat</p>
              <p className="text-sm mt-2">Start the conversation</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-blue-600'} font-bold text-lg`}>
                    {message.role === 'user' ? (
                      <span>U</span>
                    ) : (
                      <span>G</span>
                    )}
                  </div>
                  {/* Bubble */}
                  <div className={`px-4 py-2 rounded-2xl shadow-sm ${message.role === 'user' ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessage(message.content) 
                      }}
                    />
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'} text-right`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[80%]">
                <div className="w-9 h-9 rounded-full bg-gray-200 text-blue-600 flex items-center justify-center font-bold text-lg">G</div>
                <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 shadow-sm animate-pulse">
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="p-4 border-t bg-white flex gap-2"
          onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
        >
          <Input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chatId ? "Type your message..." : "Type a message to start a new chat..."}
            disabled={isLoading}
            className="flex-1 focus-visible:ring-blue-400"
            autoFocus
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-xl shadow"
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 