// API Base URL - can be configured for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  register: '/api/register',
  login: '/api/auth/signin',
  logout: '/api/auth/signout',
  session: '/api/auth/session',
  
  // Chat Management
  chats: '/api/chats',
  chat: '/api/chat',
  
  // Dynamic endpoints (with parameters)
  chatById: (id: string) => `/api/chats/${id}`,
  chatMessages: (chatId: string) => `/api/chat?chatId=${chatId}`,
} as const

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface ChatResponse {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface MessageResponse {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

export interface CreateChatRequest {
  title?: string
  userId?: string
}

export interface SendMessageRequest {
  chatId: string
  message: string
}

export interface UpdateChatRequest {
  title: string
}

// API Service Class
class ApiService {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, { ...defaultOptions, ...options })
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.message,
        }
      }

      return {
        success: true,
        data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Authentication APIs
  async register(username: string, password: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.register, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async login(username: string, password: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.logout, {
      method: 'POST',
    })
  }

  async getSession(): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.session)
  }

  // Chat Management APIs
  async getChats(userId?: string): Promise<ApiResponse<{ chats: ChatResponse[] }>> {
    const url = userId ? `${API_ENDPOINTS.chats}?userId=${userId}` : API_ENDPOINTS.chats
    return this.request(url)
  }

  async createChat(title?: string, userId?: string): Promise<ApiResponse<{ chat: ChatResponse }>> {
    return this.request(API_ENDPOINTS.chats, {
      method: 'POST',
      body: JSON.stringify({ title, userId }),
    })
  }

  async getChat(chatId: string): Promise<ApiResponse<{ chat: ChatResponse }>> {
    return this.request(API_ENDPOINTS.chatById(chatId))
  }

  async updateChatTitle(chatId: string, title: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.chatById(chatId), {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    })
  }

  async deleteChat(chatId: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.chatById(chatId), {
      method: 'DELETE',
    })
  }

  // Message APIs
  async getMessages(chatId: string): Promise<ApiResponse<{ messages: MessageResponse[] }>> {
    return this.request(API_ENDPOINTS.chatMessages(chatId))
  }

  async sendMessage(chatId: string, message: string): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return this.request(API_ENDPOINTS.chat, {
      method: 'POST',
      body: JSON.stringify({ chatId, message }),
    })
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL)

// Export individual functions for convenience
export const api = {
  // Authentication
  register: (username: string, password: string) => apiService.register(username, password),
  login: (username: string, password: string) => apiService.login(username, password),
  logout: () => apiService.logout(),
  getSession: () => apiService.getSession(),

  // Chat Management
  getChats: (userId?: string) => apiService.getChats(userId),
  createChat: (title?: string, userId?: string) => apiService.createChat(title, userId),
  getChat: (chatId: string) => apiService.getChat(chatId),
  updateChatTitle: (chatId: string, title: string) => apiService.updateChatTitle(chatId, title),
  deleteChat: (chatId: string) => apiService.deleteChat(chatId),

  // Messages
  getMessages: (chatId: string) => apiService.getMessages(chatId),
  sendMessage: (chatId: string, message: string) => apiService.sendMessage(chatId, message),
}

 