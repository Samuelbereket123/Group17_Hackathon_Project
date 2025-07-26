import { ObjectId } from 'mongodb'

export interface IResume {
  _id?: ObjectId
  userId: string
  originalFileName: string
  fileUrl: string
  parsedData: {
    name?: string
    email?: string
    phone?: string
    summary?: string
    skills: string[]
    education: Array<{
      institution: string
      degree: string
      field: string
      startDate?: string
      endDate?: string
      gpa?: string
    }>
    experience: Array<{
      company: string
      position: string
      startDate: string
      endDate?: string
      description: string[]
      technologies?: string[]
    }>
    projects?: Array<{
      name: string
      description: string
      technologies: string[]
      url?: string
    }>
    certifications?: Array<{
      name: string
      issuer: string
      date: string
      url?: string
    }>
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateResumeRequest {
  userId: string
  originalFileName: string
  fileUrl: string
  parsedData: IResume['parsedData']
}

export interface ResumeResponse {
  id: string
  originalFileName: string
  parsedData: IResume['parsedData']
  createdAt: string
  updatedAt: string
} 