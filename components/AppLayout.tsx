'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import UserAvatar from './UserAvatar'
import ChatSidebar from './ChatSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Menu, X } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
  currentChatId?: string
  onChatSelect?: (chatId: string) => void
  onNewChat?: () => void
  showChatHistory?: boolean
}

export default function AppLayout({ 
  children, 
  currentChatId, 
  onChatSelect, 
  onNewChat,
  showChatHistory = true 
}: AppLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Menu button */}
            <div className="flex items-center gap-4">
              {showChatHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Interview Assistant</h1>
              </div>
            </div>

            {/* Right side - Navigation and User Avatar */}
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/interview-prep')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Interview Prep
                </Button>
              </nav>
              
              <Separator orientation="vertical" className="h-6 hidden md:block" />
              
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-4 h-[calc(100vh-8rem)]">
          {/* Sidebar */}
          {showChatHistory && (
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block flex-shrink-0`}>
              <ChatSidebar
                currentChatId={currentChatId}
                onChatSelect={onChatSelect || (() => {})}
                onNewChat={onNewChat || (() => {})}
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showChatHistory && isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-80">
            <div className="relative flex-1 flex flex-col bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="w-6 h-6 text-white" />
                </Button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <ChatSidebar
                  currentChatId={currentChatId}
                  onChatSelect={(chatId) => {
                    onChatSelect?.(chatId)
                    setIsSidebarOpen(false)
                  }}
                  onNewChat={() => {
                    onNewChat?.()
                    setIsSidebarOpen(false)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 