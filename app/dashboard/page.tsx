"use client";


import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-indigo-600">InterviewAI</div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {session.user.username}!</span>
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Interview Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Ready to practice your interview skills?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Practice</h3>
            <p className="text-gray-600 mb-6">
              Begin a new interview simulation session
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
              Start Session
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">View Progress</h3>
            <p className="text-gray-600 mb-6">
              Check your performance and improvement
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
              View Stats
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Settings</h3>
            <p className="text-gray-600 mb-6">
              Customize your interview preferences
            </p>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
              Configure
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Mock Interview Session</p>
                <p className="text-gray-600">Software Engineer - Tech Company</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">2 days ago</p>
                <p className="text-green-600 font-semibold">85% Score</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Practice Session</p>
                <p className="text-gray-600">Behavioral Questions</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">1 week ago</p>
                <p className="text-blue-600 font-semibold">78% Score</p>
              </div>
            </div>
          </div>
          
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
  );
} 