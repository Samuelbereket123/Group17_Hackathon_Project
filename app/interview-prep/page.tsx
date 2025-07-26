'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/components/AppLayout'

interface Resume {
  id: string
  originalFileName: string
  parsedData: {
    name?: string
    skills: string[]
    education: Array<{
      institution: string
      degree: string
      field: string
    }>
    experience: Array<{
      company: string
      position: string
      description: string[]
    }>
  }
  createdAt: string
}

interface JobDescription {
  id: string
  title: string
  company: string
  originalText: string
  parsedData: {
    requiredSkills: string[]
    preferredSkills: string[]
    responsibilities: string[]
    requirements: string[]
  }
  createdAt: string
}

interface InterviewSession {
  id: string
  title: string
  status: string
  currentQuestionIndex: number
  questions: Array<{
    id: string
    question: string
    type: string
    category: string
    difficulty: string
    answer?: string
  }>
  summary?: {
    totalQuestions: number
    answeredQuestions: number
    averageScore: number
    strengths: string[]
    areasForImprovement: string[]
    overallFeedback: string
  }
  createdAt: string
}

export default function InterviewPrepPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([])
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [selectedResume, setSelectedResume] = useState<string>('')
  const [selectedJobDescription, setSelectedJobDescription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState('user123') // In a real app, this would come from auth

  // Form states
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescriptionText, setJobDescriptionText] = useState('')

  useEffect(() => {
    fetchResumes()
    fetchJobDescriptions()
    fetchSessions()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await fetch(`/api/resumes?userId=${userId}`)
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error('Error fetching resumes:', error)
    }
  }

  const fetchJobDescriptions = async () => {
    try {
      const response = await fetch(`/api/job-descriptions?userId=${userId}`)
      const data = await response.json()
      setJobDescriptions(data)
    } catch (error) {
      console.error('Error fetching job descriptions:', error)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/interview-sessions?userId=${userId}`)
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await fetchResumes()
        alert('Resume uploaded successfully!')
      } else {
        alert('Failed to upload resume')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Error uploading resume')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle || !company || !jobDescriptionText) {
      alert('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/job-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          title: jobTitle,
          company,
          originalText: jobDescriptionText
        })
      })

      if (response.ok) {
        await fetchJobDescriptions()
        setJobTitle('')
        setCompany('')
        setJobDescriptionText('')
        alert('Job description created successfully!')
      } else {
        alert('Failed to create job description')
      }
    } catch (error) {
      console.error('Error creating job description:', error)
      alert('Error creating job description')
    } finally {
      setIsLoading(false)
    }
  }

  const createInterviewSession = async () => {
    if (!selectedResume || !selectedJobDescription) {
      alert('Please select both a resume and job description')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/interview-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          resumeId: selectedResume,
          jobDescriptionId: selectedJobDescription
        })
      })

      if (response.ok) {
        const session = await response.json()
        await fetchSessions()
        alert('Interview session created! You can now start practicing.')
        // Redirect to the interview session
        window.location.href = `/interview-prep/session/${session.id}`
      } else {
        alert('Failed to create interview session')
      }
    } catch (error) {
      console.error('Error creating interview session:', error)
      alert('Error creating interview session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout showChatHistory={false}>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Preparation</h1>
          <p className="text-gray-600">
            Upload your resume, add job descriptions, and practice with AI-generated interview questions.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Upload</CardTitle>
            <CardDescription>
              Upload your resume in PDF format to extract your skills and experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume-upload">Upload PDF Resume</Label>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={isLoading}
                />
              </div>

              {resumes.length > 0 && (
                <div>
                  <Label>Select Resume for Interview</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                  >
                    <option value="">Choose a resume...</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.originalFileName} - {resume.parsedData.name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {resumes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Uploaded Resumes:</h4>
                  <div className="space-y-2">
                    {resumes.map((resume) => (
                      <div key={resume.id} className="p-3 border rounded-md">
                        <div className="font-medium">{resume.originalFileName}</div>
                        <div className="text-sm text-gray-600">
                          Skills: {resume.parsedData.skills.slice(0, 5).join(', ')}
                          {resume.parsedData.skills.length > 5 && '...'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Description Section */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Add the job description you're applying for to generate relevant questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJobDescriptionSubmit} className="space-y-4">
              <div>
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="job-description">Job Description</Label>
                <textarea
                  id="job-description"
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full p-2 border rounded-md h-32 resize-none"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Add Job Description'}
              </Button>
            </form>

            {jobDescriptions.length > 0 && (
              <div className="mt-6">
                <Label>Select Job Description for Interview</Label>
                <select
                  className="w-full p-2 border rounded-md mt-2"
                  value={selectedJobDescription}
                  onChange={(e) => setSelectedJobDescription(e.target.value)}
                >
                  <option value="">Choose a job description...</option>
                  {jobDescriptions.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.title} at {jd.company}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Interview Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Start Interview Practice</CardTitle>
          <CardDescription>
            Select your resume and job description to begin practicing with AI-generated questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={createInterviewSession}
            disabled={!selectedResume || !selectedJobDescription || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Creating Session...' : 'Start Interview Practice'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Interview Sessions</CardTitle>
            <CardDescription>
              Continue your previous interview practice sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{session.title}</div>
                    <div className="text-sm text-gray-600">
                      Status: {session.status} • Questions: {session.questions.length}
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = `/interview-prep/session/${session.id}`}
                    variant="outline"
                    size="sm"
                  >
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AppLayout>
  )
} 