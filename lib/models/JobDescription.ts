import { ObjectId } from 'mongodb'

export interface IJobDescription {
  _id?: ObjectId
  userId: string
  title: string
  company: string
  originalText: string
  parsedData: {
    requiredSkills: string[]
    preferredSkills: string[]
    responsibilities: string[]
    requirements: string[]
    benefits?: string[]
    location?: string
    salary?: {
      min?: number
      max?: number
      currency?: string
    }
    employmentType?: string
    experienceLevel?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateJobDescriptionRequest {
  userId: string
  title: string
  company: string
  originalText: string
  parsedData: IJobDescription['parsedData']
}

export interface JobDescriptionResponse {
  id: string
  title: string
  company: string
  originalText: string
  parsedData: IJobDescription['parsedData']
  createdAt: string
  updatedAt: string
} 