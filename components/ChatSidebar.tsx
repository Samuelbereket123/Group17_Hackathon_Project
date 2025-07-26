'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, MessageSquare, Trash2, Edit3 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { formatDate } from '@/lib/utils'
import { APP_CONFIG } from '@/lib/config'
import { api } from '@/lib/api'

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

interface ChatSidebarProps {
  currentChatId?: string
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

export default function ChatSidebar({ currentChatId, onChatSelect, onNewChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const response = await api.getChats()
      if (response.success && response.data) {
        setChats(response.data.chats)
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChat = async () => {
    try {
      const response = await api.createChat(APP_CONFIG.defaultChatTitle)
      if (response.success && response.data?.chat) {
        const chat = response.data.chat
        setChats(prev => [chat, ...prev])
        onChatSelect(chat.id)
      }
    } catch (error) {

      
      console.error('Failed to create chat:', error)
    }
  }

    const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return
    
    try {
      const response = await api.deleteChat(chatId)
      if (response.success) {
        setChats(prev => prev.filter(chat => chat.id !== chatId))
        if (currentChatId === chatId) {
          onNewChat()
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const handleUpdateTitle = async (chatId: string) => {
    if (!editTitle.trim()) return
    
    setIsEditing(true)
    try {
      const response = await api.updateChatTitle(chatId, editTitle.trim())
      if (response.success) {
        setChats(prev => prev.map(chat => 
          chat.id === chatId ? { ...chat, title: editTitle.trim() } : chat
        ))
        setEditingChatId(null)
        setEditTitle('')
      }
    } catch (error) {
      console.error('Failed to update chat title:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const startEditing = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
    setIsEditing(false)
  }



  return (
    <Card className="w-80 h-full flex flex-col shadow-lg border-0">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-blue-700">
          <span>Chat History</span>
          <Button
            onClick={handleCreateChat}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No chats yet</p>
              <p className="text-sm">Start a new conversation</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                                 {editingChatId === chat.id ? (
                   <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                     <Input
                       value={editTitle}
                       onChange={(e) => setEditTitle(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           handleUpdateTitle(chat.id)
                         } else if (e.key === 'Escape') {
                           setEditingChatId(null)
                           setEditTitle('')
                         }
                       }}
                       className="flex-1 text-sm"
                       autoFocus
                       disabled={isEditing}
                       placeholder="Enter chat title..."
                     />
                     <Button
                       size="sm"
                       onClick={() => handleUpdateTitle(chat.id)}
                       className="bg-green-600 hover:bg-green-700 text-white"
                       disabled={isEditing || !editTitle.trim()}
                     >
                       {isEditing ? (
                         <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                         '✓'
                       )}
                     </Button>
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => {
                         setEditingChatId(null)
                         setEditTitle('')
                       }}
                       disabled={isEditing}
                     >
                       ✕
                     </Button>
                   </div>
                 ) : (
                  <>
                    <div className="flex items-start justify-between">
                                             <div className="flex-1 min-w-0">
                         <h3 className="font-medium text-gray-900 truncate text-sm flex items-center gap-1">
                           {chat.title}
                           {chat.title === APP_CONFIG.defaultChatTitle && (
                             <span 
                               className="text-xs text-gray-400 cursor-help" 
                               title="Click the edit button to customize this title"
                             >
                               (Auto-generated)
                             </span>
                           )}
                         </h3>
                         <p className="text-xs text-gray-500 mt-1">
                           {chat.messageCount} messages • {formatDate(chat.updatedAt)}
                         </p>
                       </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(chat)
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChat(chat.id)
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 