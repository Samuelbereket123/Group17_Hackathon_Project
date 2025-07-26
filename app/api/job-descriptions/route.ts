import { NextRequest, NextResponse } from 'next/server'
import { JobDescriptionService } from '@/lib/services/jobDescriptionService'
import { JobDescriptionParserService } from '@/lib/services/jobDescriptionParser'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, company, originalText } = body

    if (!userId || !title || !company || !originalText) {
      return NextResponse.json(
        { error: 'userId, title, company, and originalText are required' },
        { status: 400 }
      )
    }

    // Parse the job description
    const parsedData = await JobDescriptionParserService.parseJobDescription(originalText)
    
    // Create job description in database
    const jobDescription = await JobDescriptionService.createJobDescription({
      userId,
      title,
      company,
      originalText,
      parsedData
    })

    return NextResponse.json(jobDescription)
  } catch (error) {
    console.error('Error creating job description:', error)
    return NextResponse.json(
      { error: 'Failed to create job description' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const jobDescriptions = await JobDescriptionService.getJobDescriptionsByUserId(userId)
    return NextResponse.json(jobDescriptions)
  } catch (error) {
    console.error('Error getting job descriptions:', error)
    return NextResponse.json(
      { error: 'Failed to get job descriptions' },
      { status: 500 }
    )
  }
} 