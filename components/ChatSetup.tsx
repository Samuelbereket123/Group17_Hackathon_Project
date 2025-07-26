'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api } from '@/lib/api'

interface ChatSetupProps {
  onSetupComplete: (resumeId: string, jobDescription: string) => void
}

export default function ChatSetup({ onSetupComplete }: ChatSetupProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      setResumeFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resumeFile) {
      setError('Please upload your resume')
      return
    }

    if (!jobDescription.trim()) {
      setError('Please provide a job description')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Upload resume
      const formData = new FormData()
      formData.append('file', resumeFile)
      formData.append('userId', 'user123') // This should come from auth context

      const resumeResponse = await fetch('/api/resumes', {
        method: 'POST',
        body: formData
      })

      if (!resumeResponse.ok) {
        throw new Error('Failed to upload resume')
      }

      const resumeData = await resumeResponse.json()
      
      // Call the callback with resume ID and job description
      onSetupComplete(resumeData.id, jobDescription)
    } catch (error) {
      console.error('Setup error:', error)
      setError('Failed to upload resume. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold text-blue-700">
          Let's Get Started
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-sm font-medium">
              Upload Your Resume (PDF)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="resume"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resume" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📄</div>
                  <div className="text-sm text-gray-600">
                    {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Only PDF files are supported
                  </div>
                </div>
              </label>
            </div>
            {resumeFile && (
              <div className="text-sm text-green-600">
                ✓ {resumeFile.name} selected
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription" className="text-sm font-medium">
              Job Description
            </Label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !resumeFile || !jobDescription.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            {isLoading ? 'Setting up...' : 'Start Chat'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 