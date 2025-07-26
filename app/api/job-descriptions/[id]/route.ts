import { NextRequest, NextResponse } from 'next/server'
import { JobDescriptionService } from '@/lib/services/jobDescriptionService'

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

    const jobDescription = await JobDescriptionService.getJobDescriptionById(params.id, userId)
    
    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(jobDescription)
  } catch (error) {
    console.error('Error getting job description:', error)
    return NextResponse.json(
      { error: 'Failed to get job description' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const body = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const jobDescription = await JobDescriptionService.updateJobDescription(params.id, userId, body)
    
    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(jobDescription)
  } catch (error) {
    console.error('Error updating job description:', error)
    return NextResponse.json(
      { error: 'Failed to update job description' },
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

    const success = await JobDescriptionService.deleteJobDescription(params.id, userId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job description:', error)
    return NextResponse.json(
      { error: 'Failed to delete job description' },
      { status: 500 }
    )
  }
} 