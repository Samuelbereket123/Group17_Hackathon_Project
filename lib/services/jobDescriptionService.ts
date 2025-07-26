import { ObjectId } from 'mongodb'
import clientPromise from '../mongodb'
import { DATABASE_CONFIG } from '../config'
import { IJobDescription, CreateJobDescriptionRequest, JobDescriptionResponse } from '../models/JobDescription'

export class JobDescriptionService {
  /**
   * Create a new job description
   */
  static async createJobDescription(data: CreateJobDescriptionRequest): Promise<JobDescriptionResponse> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.jobDescriptions)

      const now = new Date()
      const jobDescription: IJobDescription = {
        userId: data.userId,
        title: data.title,
        company: data.company,
        originalText: data.originalText,
        parsedData: data.parsedData,
        createdAt: now,
        updatedAt: now
      }

      const result = await collection.insertOne(jobDescription)
      
      return {
        id: result.insertedId.toString(),
        title: jobDescription.title,
        company: jobDescription.company,
        originalText: jobDescription.originalText,
        parsedData: jobDescription.parsedData,
        createdAt: jobDescription.createdAt.toISOString(),
        updatedAt: jobDescription.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Error creating job description:', error)
      throw new Error('Failed to create job description')
    }
  }

  /**
   * Get job description by ID
   */
  static async getJobDescriptionById(id: string, userId: string): Promise<JobDescriptionResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.jobDescriptions)

      const jobDescription = await collection.findOne({
        _id: new ObjectId(id),
        userId: userId
      })

      if (!jobDescription) {
        return null
      }

      return {
        id: jobDescription._id!.toString(),
        title: jobDescription.title,
        company: jobDescription.company,
        originalText: jobDescription.originalText,
        parsedData: jobDescription.parsedData,
        createdAt: jobDescription.createdAt.toISOString(),
        updatedAt: jobDescription.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Error getting job description:', error)
      throw new Error('Failed to get job description')
    }
  }

  /**
   * Get all job descriptions for a user
   */
  static async getJobDescriptionsByUserId(userId: string): Promise<JobDescriptionResponse[]> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.jobDescriptions)

      const jobDescriptions = await collection
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .toArray()

      return jobDescriptions.map(jobDescription => ({
        id: jobDescription._id!.toString(),
        title: jobDescription.title,
        company: jobDescription.company,
        originalText: jobDescription.originalText,
        parsedData: jobDescription.parsedData,
        createdAt: jobDescription.createdAt.toISOString(),
        updatedAt: jobDescription.updatedAt.toISOString()
      }))
    } catch (error) {
      console.error('Error getting job descriptions:', error)
      throw new Error('Failed to get job descriptions')
    }
  }

  /**
   * Update job description
   */
  static async updateJobDescription(
    id: string, 
    userId: string, 
    updates: Partial<IJobDescription['parsedData']>
  ): Promise<JobDescriptionResponse | null> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.jobDescriptions)

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
        title: result.title,
        company: result.company,
        originalText: result.originalText,
        parsedData: result.parsedData,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Error updating job description:', error)
      throw new Error('Failed to update job description')
    }
  }

  /**
   * Delete job description
   */
  static async deleteJobDescription(id: string, userId: string): Promise<boolean> {
    try {
      const client = await clientPromise
      const db = client.db(DATABASE_CONFIG.name)
      const collection = db.collection(DATABASE_CONFIG.collections.jobDescriptions)

      const result = await collection.deleteOne({
        _id: new ObjectId(id),
        userId: userId
      })

      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting job description:', error)
      throw new Error('Failed to delete job description')
    }
  }
} 