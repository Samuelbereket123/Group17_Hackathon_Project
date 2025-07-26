import { NextRequest, NextResponse } from 'next/server'
import { ResumeService } from '@/lib/services/resumeService'
import { ResumeParserService } from '@/lib/services/resumeParser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('File uploaded:', {
      name: file.name,
      size: file.size,
      type: file.type,
      bufferSize: buffer.length
    })
    
    // Parse the PDF with better error handling
    let parsedData
    try {
      parsedData = await ResumeParserService.parseResumePDF(buffer)
    } catch (parseError) {
      console.error('PDF parsing error:', parseError)
      // Create a basic parsed data structure if parsing fails
      parsedData = {
        skills: [],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        summary: 'Unable to parse PDF content. Please review manually.'
      }
    }
    
    // For now, we'll store the file in memory (in production, you'd upload to cloud storage)
    const fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`
    
    // Create resume in database
    const resume = await ResumeService.createResume({
      userId,
      originalFileName: file.name,
      fileUrl,
      parsedData
    })

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Failed to upload resume' },
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

    const resumes = await ResumeService.getResumesByUserId(userId)
    return NextResponse.json(resumes)
  } catch (error) {
    console.error('Error getting resumes:', error)
    return NextResponse.json(
      { error: 'Failed to get resumes' },
      { status: 500 }
    )
  }
} 