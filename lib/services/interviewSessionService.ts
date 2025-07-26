import { ObjectId } from 'mongodb'
import clientPromise from '../mongodb'
import { DATABASE_CONFIG } from '../config'
import { 
  IInterviewSession, 
  CreateInterviewSessionRequest, 
  InterviewSessionResponse,
  AddQuestionRequest,
  AddAnswerRequest
} from '../models/InterviewSession'
import { InterviewQuestionGeneratorService } from './interviewQuestionGenerator'
import { ResumeService } from './resumeService'
import { JobDescriptionService } from './jobDescriptionService'

export class InterviewSessionService {
  /**
   * Create a new interview session
   */
  static async createInterviewSession(data: CreateInterviewSessionRequest): Promise<InterviewSessionResponse> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.interviewSessions)

      const now = new Date()
      const session: IInterviewSession = {
        userId: data.userId,
        resumeId: new ObjectId(data.resumeId),
        jobDescriptionId: new ObjectId(data.jobDescriptionId),
        title: data.title || `Interview Session - ${now.toLocaleDateString()}`,
        status: 'active',
        currentQuestionIndex: 0,
        questions: [],
        createdAt: now,
        updatedAt: now
      }

      const result = await collection.insertOne(session)
      
      return {
        id: result.insertedId.toString(),
        title: session.title,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        questions: session.questions,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Error creating interview session:', error)
      throw new Error('Failed to create interview session')
    }
  }

  /**
   * Get interview session by ID
   */
  static async getInterviewSessionById(id: string, userId: string): Promise<InterviewSessionResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.interviewSessions)

      const session = await collection.findOne({
        _id: new ObjectId(id),
        userId: userId
      })

      if (!session) {
        return null
      }

      return {
        id: session._id!.toString(),
        title: session.title,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        questions: session.questions,
        summary: session.summary,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        completedAt: session.completedAt?.toISOString()
      }
    } catch (error) {
      console.error('Error getting interview session:', error)
      throw new Error('Failed to get interview session')
    }
  }

  /**
   * Get all interview sessions for a user
   */
  static async getInterviewSessionsByUserId(userId: string): Promise<InterviewSessionResponse[]> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.interviewSessions)

      const sessions = await collection
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .toArray()

      return sessions.map(session => ({
        id: session._id!.toString(),
        title: session.title,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        questions: session.questions,
        summary: session.summary,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        completedAt: session.completedAt?.toISOString()
      }))
    } catch (error) {
      console.error('Error getting interview sessions:', error)
      throw new Error('Failed to get interview sessions')
    }
  }

  /**
   * Generate and add questions to an interview session
   */
  static async generateQuestions(
    sessionId: string, 
    userId: string, 
    questionType: 'technical' | 'behavioral' | 'situational' | 'general' = 'general',
    count: number = 5
  ): Promise<InterviewSessionResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.interviewSessions)

      // Get the session
      const session = await collection.findOne({
        _id: new ObjectId(sessionId),
        userId: userId
      })

      if (!session) {
        return null
      }

      // Get resume and job description
      const resume = await ResumeService.getResumeById(session.resumeId.toString(), userId)
      const jobDescription = await JobDescriptionService.getJobDescriptionById(session.jobDescriptionId.toString(), userId)

      if (!resume || !jobDescription) {
        throw new Error('Resume or job description not found')
      }

      // Generate questions
      const questions = await InterviewQuestionGeneratorService.generateQuestions(
        { parsedData: resume.parsedData } as any,
        { parsedData: jobDescription.parsedData } as any,
        questionType,
        count
      )

      // Add questions to session
      const updatedSession = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(sessionId),
          userId: userId
        },
        {
          $push: { questions: { $each: questions } },
          $set: { updatedAt: new Date() }
        } as any,
        { returnDocument: 'after' }
      )

      if (!updatedSession) {
        return null
      }

      return {
        id: updatedSession._id!.toString(),
        title: updatedSession.title,
        status: updatedSession.status,
        currentQuestionIndex: updatedSession.currentQuestionIndex,
        questions: updatedSession.questions,
        summary: updatedSession.summary,
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt.toISOString(),
        completedAt: updatedSession.completedAt?.toISOString()
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      throw new Error('Failed to generate questions')
    }
  }

  /**
   * Add answer to a question in the session
   */
  static async addAnswer(data: AddAnswerRequest, userId: string): Promise<InterviewSessionResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.interviewSessions)

      // Get the session
      const session = await collection.findOne({
        _id: new ObjectId(data.sessionId),
        userId: userId
      })

      if (!session) {
        return null
      }

      // Find and update the question with the answer
      const updatedSession = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(data.sessionId),
          userId: userId,
          'questions.id': data.questionId
        },
        {
          $set: {
            'questions.$.answer': data.answer,
            'questions.$.timestamp': new Date(),
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      if (!updatedSession) {
        return null
      }

      return {
        id: updatedSession._id!.toString(),
        title: updatedSession.title,
        status: updatedSession.status,
        currentQuestionIndex: updatedSession.currentQuestionIndex,
        questions: updatedSession.questions,
        summary: updatedSession.summary,
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt.toISOString(),
        completedAt: updatedSession.completedAt?.toISOString()
      }
    } catch (error) {
      console.error('Error adding answer:', error)
      throw new Error('Failed to add answer')
    }
  }

  /**
   * Complete an interview session and generate summary
   */
  static async completeSession(sessionId: string, userId: string): Promise<InterviewSessionResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.interviewSessions)

      // Get the session
      const session = await collection.findOne({
        _id: new ObjectId(sessionId),
        userId: userId
      })

      if (!session) {
        return null
      }

      // Calculate summary
      const answeredQuestions = session.questions.filter((q: any) => q.answer)
      const totalQuestions = session.questions.length
      const averageScore = answeredQuestions.length > 0 
        ? answeredQuestions.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / answeredQuestions.length 
        : 0

      const summary = {
        totalQuestions,
        answeredQuestions: answeredQuestions.length,
        averageScore: Math.round(averageScore * 10) / 10,
        strengths: ['Good communication skills'],
        areasForImprovement: ['Provide more specific examples'],
        overallFeedback: 'Good performance with room for improvement.'
      }

      // Update session
      const updatedSession = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(sessionId),
          userId: userId
        },
        {
          $set: {
            status: 'completed',
            summary,
            completedAt: new Date(),
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      if (!updatedSession) {
        return null
      }

      return {
        id: updatedSession._id!.toString(),
        title: updatedSession.title,
        status: updatedSession.status,
        currentQuestionIndex: updatedSession.currentQuestionIndex,
        questions: updatedSession.questions,
        summary: updatedSession.summary,
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt.toISOString(),
        completedAt: updatedSession.completedAt?.toISOString()
      }
    } catch (error) {
      console.error('Error completing session:', error)
      throw new Error('Failed to complete session')
    }
  }

  /**
   * Delete interview session
   */
  static async deleteInterviewSession(id: string, userId: string): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.interviewSessions)

      const result = await collection.deleteOne({
        _id: new ObjectId(id),
        userId: userId
      })

      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting interview session:', error)
      throw new Error('Failed to delete interview session')
    }
  }
} 