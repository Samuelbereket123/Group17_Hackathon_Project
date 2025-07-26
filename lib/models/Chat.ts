import { ObjectId } from 'mongodb'

export interface IChat {
  _id?: ObjectId
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  userId?: string // For future user authentication
}

export interface IChatMessage {
  _id?: ObjectId
  chatId: ObjectId
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: {
    tokens?: number
    model?: string
  }
}

export interface CreateChatRequest {
  title?: string
  userId?: string
}

export interface SendMessageRequest {
  chatId: string
  message: string
}

export interface ChatResponse {
  chatId: string
  message: string
  timestamp: string
} 