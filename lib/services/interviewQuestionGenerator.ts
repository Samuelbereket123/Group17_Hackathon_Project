import { callGeminiAPI } from '../utils'
import { AI_CONFIG } from '../config'
import { IResume } from '../models/Resume'
import { IJobDescription } from '../models/JobDescription'

export class InterviewQuestionGeneratorService {
  /**
   * Generate contextual interview questions based on resume and job description
   */
  static async generateQuestions(
    resume: IResume,
    jobDescription: IJobDescription,
    questionType: 'technical' | 'behavioral' | 'situational' | 'general' = 'general',
    count: number = 5
  ): Promise<Array<{
    id: string
    question: string
    type: 'technical' | 'behavioral' | 'situational' | 'general'
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    context?: string
  }>> {
    try {
      const prompt = this.buildPrompt(resume, jobDescription, questionType, count)
      
      const text = await callGeminiAPI(prompt, AI_CONFIG.apiKey)

      return this.parseQuestions(text, questionType)
    } catch (error) {
      console.error('Error generating interview questions:', error)
      // Fallback to default questions if AI fails
      return this.getFallbackQuestions(questionType, count)
    }
  }

  /**
   * Generate a follow-up question based on the candidate's answer
   */
  static async generateFollowUpQuestion(
    originalQuestion: string,
    candidateAnswer: string,
    resume: IResume,
    jobDescription: IJobDescription
  ): Promise<string> {
    try {
      const prompt = `
        Based on the candidate's answer to the interview question, generate a relevant follow-up question.
        
        Original Question: ${originalQuestion}
        Candidate's Answer: ${candidateAnswer}
        
        Resume Skills: ${resume.parsedData.skills.join(', ')}
        Job Requirements: ${jobDescription.parsedData.requiredSkills.join(', ')}
        
        Generate a follow-up question that:
        1. Builds upon their answer
        2. Probes deeper into their experience
        3. Is relevant to the job requirements
        4. Is conversational and natural
        
        Return only the follow-up question, nothing else.
      `

      return await callGeminiAPI(prompt, AI_CONFIG.apiKey)
    } catch (error) {
      console.error('Error generating follow-up question:', error)
      return "Can you tell me more about that experience?"
    }
  }

  /**
   * Evaluate a candidate's answer and provide feedback
   */
  static async evaluateAnswer(
    question: string,
    answer: string,
    resume: IResume,
    jobDescription: IJobDescription
  ): Promise<{
    score: number
    feedback: string
    strengths: string[]
    areasForImprovement: string[]
  }> {
    try {
      const prompt = `
        Evaluate the candidate's answer to this interview question and provide detailed feedback.
        
        Question: ${question}
        Answer: ${answer}
        
        Resume Skills: ${resume.parsedData.skills.join(', ')}
        Job Requirements: ${jobDescription.parsedData.requiredSkills.join(', ')}
        
        Provide evaluation in this exact JSON format:
        {
          "score": number (1-10),
          "feedback": "detailed feedback",
          "strengths": ["strength1", "strength2"],
          "areasForImprovement": ["area1", "area2"]
        }
      `

      const text = await callGeminiAPI(prompt, AI_CONFIG.apiKey)

      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback if JSON parsing fails
      return {
        score: 7,
        feedback: "Good answer with room for improvement. Consider providing more specific examples.",
        strengths: ["Clear communication"],
        areasForImprovement: ["Add more specific examples"]
      }
    } catch (error) {
      console.error('Error evaluating answer:', error)
      return {
        score: 6,
        feedback: "Answer provided. Consider adding more specific examples and details.",
        strengths: ["Attempted to answer"],
        areasForImprovement: ["Provide more specific examples"]
      }
    }
  }

  private static buildPrompt(
    resume: IResume,
    jobDescription: IJobDescription,
    questionType: string,
    count: number
  ): string {
    const resumeSkills = resume.parsedData.skills.join(', ')
    const jobSkills = jobDescription.parsedData.requiredSkills.join(', ')
    const jobTitle = jobDescription.title
    const company = jobDescription.company

    return `
      Generate ${count} ${questionType} interview questions for a ${jobTitle} position at ${company}.
      
      Candidate's Skills: ${resumeSkills}
      Job Required Skills: ${jobSkills}
      
      Generate questions that:
      1. Are specific to the candidate's background and the job requirements
      2. Test both technical knowledge and soft skills
      3. Are realistic and commonly asked in real interviews
      4. Vary in difficulty (easy, medium, hard)
      5. Include both general and role-specific questions
      
      For each question, provide:
      - The question text
      - Question type (technical/behavioral/situational/general)
      - Category (e.g., "Problem Solving", "Team Work", "Technical Skills")
      - Difficulty level (easy/medium/hard)
      
      Format each question as:
      Q: [Question text]
      Type: [type]
      Category: [category]
      Difficulty: [difficulty]
      
      ---
    `
  }

  private static parseQuestions(text: string, questionType: string): Array<{
    id: string
    question: string
    type: 'technical' | 'behavioral' | 'situational' | 'general'
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    context?: string
  }> {
    const questions: Array<{
      id: string
      question: string
      type: 'technical' | 'behavioral' | 'situational' | 'general'
      category: string
      difficulty: 'easy' | 'medium' | 'hard'
      context?: string
    }> = []

    const questionBlocks = text.split(/Q:\s*/).filter(block => block.trim())
    
    for (const block of questionBlocks) {
      const lines = block.split('\n').filter(line => line.trim())
      if (lines.length >= 4) {
        const question = lines[0].trim()
        const typeMatch = lines.find(line => line.startsWith('Type:'))?.replace('Type:', '').trim()
        const categoryMatch = lines.find(line => line.startsWith('Category:'))?.replace('Category:', '').trim()
        const difficultyMatch = lines.find(line => line.startsWith('Difficulty:'))?.replace('Difficulty:', '').trim()

        if (question && typeMatch && categoryMatch && difficultyMatch) {
          questions.push({
            id: Math.random().toString(36).substr(2, 9),
            question,
            type: typeMatch as 'technical' | 'behavioral' | 'situational' | 'general',
            category: categoryMatch,
            difficulty: difficultyMatch as 'easy' | 'medium' | 'hard'
          })
        }
      }
    }

    return questions.length > 0 ? questions : this.getFallbackQuestions(questionType as any, 5)
  }

  private static getFallbackQuestions(
    questionType: 'technical' | 'behavioral' | 'situational' | 'general',
    count: number
  ): Array<{
    id: string
    question: string
    type: 'technical' | 'behavioral' | 'situational' | 'general'
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    context?: string
  }> {
    const fallbackQuestions = {
      technical: [
        {
          question: "Can you explain the difference between synchronous and asynchronous programming?",
          category: "Programming Concepts",
          difficulty: "medium" as const
        },
        {
          question: "What is the time complexity of a binary search algorithm?",
          category: "Algorithms",
          difficulty: "easy" as const
        },
        {
          question: "How would you design a scalable database architecture?",
          category: "System Design",
          difficulty: "hard" as const
        }
      ],
      behavioral: [
        {
          question: "Tell me about a time when you had to work with a difficult team member.",
          category: "Team Work",
          difficulty: "medium" as const
        },
        {
          question: "Describe a situation where you had to learn a new technology quickly.",
          category: "Adaptability",
          difficulty: "medium" as const
        },
        {
          question: "Give me an example of a project where you took the lead.",
          category: "Leadership",
          difficulty: "hard" as const
        }
      ],
      situational: [
        {
          question: "What would you do if you discovered a critical bug in production?",
          category: "Problem Solving",
          difficulty: "medium" as const
        },
        {
          question: "How would you handle a situation where your manager disagrees with your technical approach?",
          category: "Communication",
          difficulty: "medium" as const
        },
        {
          question: "What steps would you take to improve the performance of a slow application?",
          category: "Technical Problem Solving",
          difficulty: "hard" as const
        }
      ],
      general: [
        {
          question: "Why are you interested in this position?",
          category: "Motivation",
          difficulty: "easy" as const
        },
        {
          question: "Where do you see yourself in 5 years?",
          category: "Career Goals",
          difficulty: "easy" as const
        },
        {
          question: "What are your strengths and weaknesses?",
          category: "Self Assessment",
          difficulty: "medium" as const
        }
      ]
    }

    const questions = fallbackQuestions[questionType] || fallbackQuestions.general
    return questions.slice(0, count).map((q, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      question: q.question,
      type: questionType,
      category: q.category,
      difficulty: q.difficulty
    }))
  }
} 