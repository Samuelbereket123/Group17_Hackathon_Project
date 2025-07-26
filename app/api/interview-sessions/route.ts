import { NextRequest, NextResponse } from 'next/server'
import { InterviewSessionService } from '@/lib/services/interviewSessionService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, resumeId, jobDescriptionId, title } = body

    if (!userId || !resumeId || !jobDescriptionId) {
      return NextResponse.json(
        { error: 'userId, resumeId, and jobDescriptionId are required' },
        { status: 400 }
      )
    }

    const session = await InterviewSessionService.createInterviewSession({
      userId,
      resumeId,
      jobDescriptionId,
      title
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating interview session:', error)
    return NextResponse.json(
      { error: 'Failed to create interview session' },
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

    const sessions = await InterviewSessionService.getInterviewSessionsByUserId(userId)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error getting interview sessions:', error)
    return NextResponse.json(
      { error: 'Failed to get interview sessions' },
      { status: 500 }
    )
  }
} 