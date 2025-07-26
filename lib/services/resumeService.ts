import { ObjectId } from 'mongodb'
import clientPromise from '../mongodb'
import { DATABASE_CONFIG } from '../config'
import { IResume, CreateResumeRequest, ResumeResponse } from '../models/Resume'

export class ResumeService {
  /**
   * Create a new resume
   */
  static async createResume(data: CreateResumeRequest): Promise<ResumeResponse> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.resumes)

      const now = new Date()
      const resume: IResume = {
        userId: data.userId,
        originalFileName: data.originalFileName,
        fileUrl: data.fileUrl,
        parsedData: data.parsedData,
        createdAt: now,
        updatedAt: now
      }

      const result = await collection.insertOne(resume)
      
      return {
        id: result.insertedId.toString(),
        originalFileName: resume.originalFileName,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Error creating resume:', error)
      throw new Error('Failed to create resume')
    }
  }

  /**
   * Get resume by ID
   */
  static async getResumeById(id: string, userId: string): Promise<ResumeResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.resumes)

      const resume = await collection.findOne({
        _id: new ObjectId(id),
        userId: userId
      })

      if (!resume) {
        return null
      }

      return {
        id: resume._id!.toString(),
        originalFileName: resume.originalFileName,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Error getting resume:', error)
      throw new Error('Failed to get resume')
    }
  }

  /**
   * Get all resumes for a user
   */
  static async getResumesByUserId(userId: string): Promise<ResumeResponse[]> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.resumes)

      const resumes = await collection
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .toArray()

      return resumes.map(resume => ({
        id: resume._id!.toString(),
        originalFileName: resume.originalFileName,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString()
      }))
    } catch (error) {
      console.error('Error getting resumes:', error)
      throw new Error('Failed to get resumes')
    }
  }

  /**
   * Update resume
   */
  static async updateResume(id: string, userId: string, updates: Partial<IResume['parsedData']>): Promise<ResumeResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.resumes)

      const result = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
          userId: userId
        },
        {
          $set: {
            parsedData: updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      if (!result) {
        return null
      }

      return {
        id: result._id!.toString(),
        originalFileName: result.originalFileName,
        parsedData: result.parsedData,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Error updating resume:', error)
      throw new Error('Failed to update resume')
    }
  }

  /**
   * Delete resume
   */
  static async deleteResume(id: string, userId: string): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.resumes)

      const result = await collection.deleteOne({
        _id: new ObjectId(id),
        userId: userId
      })

      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting resume:', error)
      throw new Error('Failed to delete resume')
    }
  }
} 