'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import ChatSidebar from '@/components/ChatSidebar'
import { api } from '@/lib/api'

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] flex gap-4">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <ChatSidebar
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
          />
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
    </div>
  )
} 