'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'

export default function UserAvatar() {
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {getUserInitials(session.user.username || session.user.email || 'U')}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {session.user.username || 'User'}
          </div>
          <div className="text-xs text-gray-500">
            {session.user.email}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </Button>

      {isDropdownOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 z-50 shadow-lg border border-gray-200">
          <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {getUserInitials(session.user.username || session.user.email || 'U')}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {session.user.username || 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.user.email}
                  </div>
                </div>
              </div>
            
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  // Add settings functionality here
                  setIsDropdownOpen(false)
                }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
} 