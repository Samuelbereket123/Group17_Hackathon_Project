import { NextRequest, NextResponse } from 'next/server'
import { InterviewSessionService } from '@/lib/services/interviewSessionService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const session = await InterviewSessionService.getInterviewSessionById(params.id, userId)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error getting interview session:', error)
    return NextResponse.json(
      { error: 'Failed to get interview session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const success = await InterviewSessionService.deleteInterviewSession(params.id, userId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting interview session:', error)
    return NextResponse.json(
      { error: 'Failed to delete interview session' },
      { status: 500 }
    )
  }
} 