import { NextRequest, NextResponse } from 'next/server'
import { InterviewSessionService } from '@/lib/services/interviewSessionService'

export async function POST(
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

    const session = await InterviewSessionService.completeSession(params.id, userId)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error completing session:', error)
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 }
    )
  }
} 