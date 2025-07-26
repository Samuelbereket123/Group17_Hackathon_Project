import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UI_CONFIG, APP_CONFIG } from './config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessage(content: string): string {
  // Enhanced markdown-like formatting
  return content
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2"><code class="text-sm font-mono">$2</code></pre>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>')
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString([], { weekday: 'short' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

export function generateChatTitle(firstMessage: string): string {
  // Clean and truncate the first message to create a meaningful title
  const cleanedMessage = firstMessage
    .replace(/[^\w\s]/g, '') // Remove special characters
    .trim()
    .toLowerCase()
  
  // Take first few words and capitalize them
  const words = cleanedMessage.split(' ').slice(0, UI_CONFIG.chat.maxTitleWords)
  if (words.length === 0) return APP_CONFIG.defaultChatTitle
  
  const title = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return title + (cleanedMessage.split(' ').length > UI_CONFIG.chat.maxTitleWords ? '...' : '')
}

export function generateAITitle(message: string): string {
  // Extract key topics from the message for better title generation
  const commonTopics = [
    'javascript', 'python', 'react', 'nodejs', 'database', 'api', 'frontend', 'backend',
    'coding', 'programming', 'development', 'design', 'architecture', 'testing',
    'deployment', 'security', 'performance', 'optimization', 'debugging'
  ]
  
  const lowerMessage = message.toLowerCase()
  const foundTopics = commonTopics.filter(topic => lowerMessage.includes(topic))
  
  if (foundTopics.length > 0) {
    const topic = foundTopics[0].charAt(0).toUpperCase() + foundTopics[0].slice(1)
    return `${topic} Discussion`
  }
  
  // Fallback to simple title generation
  return generateChatTitle(message)
}

export function truncateText(text: string, maxLength: number = UI_CONFIG.chat.truncateLength): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
