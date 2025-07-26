'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import AppLayout from '@/components/AppLayout'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('')

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    // Load chat title when selecting a chat
    if (chatId) {
      api.getChat(chatId)
        .then(response => {
          if (response.success && response.data?.chat) {
            setCurrentChatTitle(response.data.chat.title)
          }
        })
        .catch(console.error)
    }
  }

  const handleNewChat = () => {
    setCurrentChatId(undefined)
    setCurrentChatTitle('')
  }

  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  return (
    <AppLayout
      currentChatId={currentChatId}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
    >
      <div className="flex flex-col h-full">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>
                Upload your resume and job description to get personalized interview preparation help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Start a new chat to upload your resume and job description for personalized assistance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Preparation</CardTitle>
              <CardDescription>
                Practice with AI-generated interview questions based on your resume and job descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => window.location.href = '/interview-prep'}
                className="w-full"
              >
                Start Interview Prep
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            chatId={currentChatId}
            onChatCreated={handleChatCreated}
            currentChatTitle={currentChatTitle}
          />
        </div>
      </div>
    </AppLayout>
  )
} 