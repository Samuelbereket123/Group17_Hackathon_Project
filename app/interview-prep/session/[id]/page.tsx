'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/components/AppLayout'

interface Question {
  id: string
  question: string
  type: string
  category: string
  difficulty: string
  answer?: string
  feedback?: string
  score?: number
}

interface InterviewSession {
  id: string
  title: string
  status: string
  currentQuestionIndex: number
  questions: Question[]
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

export default function InterviewSessionPage() {
  const params = useParams()
  const sessionId = params.id as string
  
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [userId] = useState('user123') // In a real app, this would come from auth

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/interview-sessions/${sessionId}?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
        setCurrentQuestionIndex(data.currentQuestionIndex || 0)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const generateQuestions = async (questionType: string = 'general', count: number = 5) => {
    setIsGeneratingQuestions(true)
    try {
      const response = await fetch(`/api/interview-sessions/${sessionId}/generate-questions?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionType,
          count
        })
      })

      if (response.ok) {
        const updatedSession = await response.json()
        setSession(updatedSession)
        alert('Questions generated successfully!')
      } else {
        alert('Failed to generate questions')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Error generating questions')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !session) return

    setIsLoading(true)
    try {
      const currentQuestion = session.questions[currentQuestionIndex]
      const response = await fetch(`/api/interview-sessions/${sessionId}/add-answer?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answer.trim()
        })
      })

      if (response.ok) {
        const updatedSession = await response.json()
        setSession(updatedSession)
        setAnswer('')
        
        if (currentQuestionIndex < session.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
      } else {
        alert('Failed to submit answer')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Error submitting answer')
    } finally {
      setIsLoading(false)
    }
  }

  const completeSession = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/interview-sessions/${sessionId}/complete?userId=${userId}`, {
        method: 'POST'
      })

      if (response.ok) {
        const completedSession = await response.json()
        setSession(completedSession)
        alert('Interview session completed! Check your summary below.')
      } else {
        alert('Failed to complete session')
      }
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Error completing session')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading interview session...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = session.questions[currentQuestionIndex]
  const hasAnsweredCurrent = currentQuestion?.answer
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1
  const allQuestionsAnswered = session.questions.every(q => q.answer)

  return (
    <AppLayout showChatHistory={false}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{session.title}</h1>
              <p className="text-gray-600">Status: {session.status}</p>
            </div>
            <Button
              onClick={() => window.location.href = '/interview-prep'}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-lg font-semibold">
                {session.questions.filter(q => q.answer).length} / {session.questions.length} questions answered
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Question</p>
              <p className="text-lg font-semibold">{currentQuestionIndex + 1} of {session.questions.length}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(session.questions.filter(q => q.answer).length / session.questions.length) * 100}%`
              }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Questions Section */}
      {session.questions.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Interview Questions</CardTitle>
            <CardDescription>
              Generate AI-powered questions based on your resume and job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => generateQuestions('technical', 5)}
                  disabled={isGeneratingQuestions}
                  className="w-full"
                >
                  {isGeneratingQuestions ? 'Generating...' : 'Technical Questions (5)'}
                </Button>
                <Button
                  onClick={() => generateQuestions('behavioral', 5)}
                  disabled={isGeneratingQuestions}
                  className="w-full"
                >
                  {isGeneratingQuestions ? 'Generating...' : 'Behavioral Questions (5)'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => generateQuestions('situational', 5)}
                  disabled={isGeneratingQuestions}
                  className="w-full"
                >
                  {isGeneratingQuestions ? 'Generating...' : 'Situational Questions (5)'}
                </Button>
                <Button
                  onClick={() => generateQuestions('general', 5)}
                  disabled={isGeneratingQuestions}
                  className="w-full"
                >
                  {isGeneratingQuestions ? 'Generating...' : 'General Questions (5)'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription>
                  {currentQuestion.category} • {currentQuestion.difficulty} • {currentQuestion.type}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {currentQuestion.type}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
            </div>

            {!hasAnsweredCurrent ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="answer">Your Answer</Label>
                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border rounded-md h-32 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-between">
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    Previous Question
                  </Button>
                  <Button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || isLoading}
                  >
                    {isLoading ? 'Submitting...' : isLastQuestion ? 'Submit & Complete' : 'Submit Answer'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="font-semibold text-green-800 mb-2">Your Answer:</h4>
                  <p className="text-green-700">{currentQuestion.answer}</p>
                </div>
                <div className="flex justify-between">
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    Previous Question
                  </Button>
                  {!isLastQuestion ? (
                    <Button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={completeSession}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'Completing...' : 'Complete Interview'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Summary */}
      {session.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Summary</CardTitle>
            <CardDescription>
              Your performance analysis and feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{session.summary.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{session.summary.answeredQuestions}</div>
                <div className="text-sm text-gray-600">Answered</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{session.summary.averageScore}/10</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">Strengths</h4>
                <ul className="space-y-1">
                  {session.summary.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-600">• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-700">Areas for Improvement</h4>
                <ul className="space-y-1">
                  {session.summary.areasForImprovement.map((area, index) => (
                    <li key={index} className="text-sm text-orange-600">• {area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Overall Feedback</h4>
              <p className="text-gray-700">{session.summary.overallFeedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Navigation */}
      {session.questions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {session.questions.map((question, index) => (
                <Button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  variant={index === currentQuestionIndex ? "default" : "outline"}
                  size="sm"
                  className={`h-12 ${
                    question.answer ? 'bg-green-100 border-green-300 text-green-800' : ''
                  }`}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></span>
              Answered
              <span className="inline-block w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2 ml-4"></span>
              Unanswered
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AppLayout>
  )
} 