import { NextRequest, NextResponse } from 'next/server'
import { InterviewSessionService } from '@/lib/services/interviewSessionService'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const body = await request.json()
    const { questionId, answer } = body

    if (!userId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'userId, questionId, and answer are required' },
        { status: 400 }
      )
    }

    const session = await InterviewSessionService.addAnswer(
      {
        sessionId: params.id,
        questionId,
        answer
      },
      userId
    )
    
    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error adding answer:', error)
    return NextResponse.json(
      { error: 'Failed to add answer' },
      { status: 500 }
    )
  }
} 