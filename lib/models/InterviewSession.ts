import { ObjectId } from 'mongodb'

export interface IInterviewSession {
  _id?: ObjectId
  userId: string
  resumeId: ObjectId
  jobDescriptionId: ObjectId
  title: string
  status: 'active' | 'completed' | 'paused'
  currentQuestionIndex: number
  questions: Array<{
    id: string
    question: string
    type: 'technical' | 'behavioral' | 'situational' | 'general'
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    context?: string
    answer?: string
    feedback?: string
    score?: number
    timestamp: Date
  }>
  summary?: {
    totalQuestions: number
    answeredQuestions: number
    averageScore: number
    strengths: string[]
    areasForImprovement: string[]
    overallFeedback: string
  }
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface CreateInterviewSessionRequest {
  userId: string
  resumeId: string
  jobDescriptionId: string
  title?: string
}

export interface InterviewSessionResponse {
  id: string
  title: string
  status: string
  currentQuestionIndex: number
  questions: IInterviewSession['questions']
  summary?: IInterviewSession['summary']
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface AddQuestionRequest {
  sessionId: string
  question: string
  type: 'technical' | 'behavioral' | 'situational' | 'general'
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  context?: string
}

export interface AddAnswerRequest {
  sessionId: string
  questionId: string
  answer: string
} 