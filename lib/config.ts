// Database Configuration
export const DATABASE_CONFIG = {
  name: 'interviewer-ai',
  collections: {
    chats: 'chats',
    messages: 'messages',
    users: 'users',
    resumes: 'resumes',
    jobDescriptions: 'jobDescriptions',
    interviewSessions: 'interviewSessions'
  }
} as const

// AI Configuration
export const AI_CONFIG = {
  model: 'gemini-2.0-flash' as const,
  apiKey: process.env.GEMINI_API_KEY ||'AIzaSyDECQwG3MrG8JrqybIdRRFsPI9AgQaO1uU',
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  maxInputTokens: 1000000,
  maxOutputTokens: 8192,
  maxMessageLength: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const



// Application Configuration
export const APP_CONFIG = {
  name: 'Interviewer AI',
  description: 'AI-powered chat application',
  version: '1.0.0',
  defaultChatTitle: 'New Chat',
  maxTitleLength: 100,
  maxMessageLength: 4000
} as const

// UI Configuration
export const UI_CONFIG = {
  chat: {
    maxWidth: '80%',
    avatarSize: 'w-9 h-9',
    maxTitleWords: 6,
    truncateLength: 50
  },
  sidebar: {
    width: 'w-80',
    maxHeight: 'h-full'
  },
  messages: {
    maxWidth: 'max-w-[80%]',
    avatarSize: 'w-9 h-9'
  }
} as const

// Environment Configuration
export const ENV_CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    required: true
  },
  nextauth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  },
  node: {
    env: process.env.NODE_ENV || 'development'
  }
} as const

// Validation Configuration
export const VALIDATION_CONFIG = {
  password: {
    minLength: 6
  },
  username: {
    minLength: 3,
    maxLength: 50
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  database: {
    connectionFailed: 'Failed to connect to database',
    queryFailed: 'Database query failed'
  },
  auth: {
    invalidCredentials: 'Invalid username or password',
    userExists: 'Username already exists',
    userNotFound: 'User not found',
    passwordTooShort: 'Password must be at least 6 characters long'
  },
  chat: {
    messageRequired: 'Message is required',
    chatIdRequired: 'ChatId is required',
    chatNotFound: 'Chat not found',
    titleRequired: 'Title is required'
  },
  ai: {
    generationFailed: 'Failed to generate AI response',
    apiError: 'AI API error'
  }
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  auth: {
    userCreated: 'User created successfully',
    loginSuccess: 'Login successful'
  },
  chat: {
    created: 'Chat created successfully',
    updated: 'Chat updated successfully',
    deleted: 'Chat deleted successfully'
  }
} as const

// Default Values
export const DEFAULTS = {
  chat: {
    title: 'New Chat',
    messageCount: 0
  },
  pagination: {
    limit: 10,
    maxLimit: 100
  },
  dateFormat: {
    short: { hour: '2-digit', minute: '2-digit' },
    medium: { weekday: 'short' },
    long: { month: 'short', day: 'numeric' }
  }
} as const 