"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ChatInterface from '@/components/ChatInterface';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);
  const helpTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    // Load chat title when selecting a chat
    if (chatId) {
      api.getChat(chatId)
        .then(response => {
          if (response.success && response.data?.chat) {
            setCurrentChatTitle(response.data.chat.title);
          }
        })
        .catch(console.error);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(undefined);
    setCurrentChatTitle('');
  };

  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  return (
    <AppLayout
      currentChatId={currentChatId}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
    >
      <div className="flex flex-col h-full relative">
        {/* Navigation */}
        <nav className="bg-white shadow-sm mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
          </div>
        </nav>

        {/* Help Button */}
        <div className="flex justify-end mb-2 pr-2">
          <Button
            onMouseEnter={() => {
              if (helpTimeout.current) clearTimeout(helpTimeout.current);
              setShowHelp(true);
            }}
            onMouseLeave={() => {
              helpTimeout.current = setTimeout(() => setShowHelp(false), 300);
            }}
            onClick={() => setShowHelp((prev) => !prev)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Help
          </Button>
        </div>

        {/* Floating Help Panel */}
        {showHelp && (
          <div
            className="absolute z-50 right-4 top-24 w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-blue-100 p-6 animate-fade-in"
            onMouseEnter={() => {
              if (helpTimeout.current) clearTimeout(helpTimeout.current);
              setShowHelp(true);
            }}
            onMouseLeave={() => {
              helpTimeout.current = setTimeout(() => setShowHelp(false), 300);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        )}

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
  );
} 