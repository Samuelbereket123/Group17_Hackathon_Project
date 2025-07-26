import { IResume } from '../models/Resume'

export class ResumeParserService {
  /**
   * Parse PDF resume and extract structured data
   */
  static async parseResumePDF(buffer: Buffer): Promise<IResume['parsedData']> {
    try {
      console.log('Starting PDF parsing...')
      console.log('Buffer size:', buffer.length)
      
      let text = ''
      
      try {
        // Use dynamic import to avoid initialization issues
        const pdf = (await import('pdf-parse')).default
        const data = await pdf(buffer)
        text = data.text
        
        console.log('PDF text extracted, length:', text.length)
        console.log('First 200 characters:', text.substring(0, 200))
        
        // If text is too short or contains PDF metadata, try alternative parsing
        if (text.length < 100 || text.includes('obj') || text.includes('<<')) {
          console.log('PDF text appears to be raw data, trying alternative parsing...')
          // Try parsing without options
          const alternativeData = await pdf(buffer)
          text = alternativeData.text
          console.log('Alternative parsing result length:', text.length)
        }
      } catch (pdfError: any) {
        console.error('PDF parsing library failed:', pdfError.message)
        // Fallback: try to extract text from buffer as string
        text = buffer.toString('utf8')
        console.log('Fallback text extraction, length:', text.length)
      }

      // Extract basic information
      const parsedData: IResume['parsedData'] = {
        skills: [],
        education: [],
        experience: [],
        projects: [],
        certifications: []
      }

      // Extract name (usually at the top)
      const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m)
      if (nameMatch) {
        parsedData.name = nameMatch[1]
      }

      // Extract email
      const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
      if (emailMatch) {
        parsedData.email = emailMatch[0]
      }

      // Extract phone
      const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
      if (phoneMatch) {
        parsedData.phone = phoneMatch[0]
      }

      // Extract skills (look for common skill keywords)
      const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue', 'Node.js',
        'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
        'Git', 'GitHub', 'REST API', 'GraphQL', 'TypeScript', 'HTML', 'CSS', 'SASS',
        'Machine Learning', 'AI', 'Data Science', 'SQL', 'NoSQL', 'Redis', 'Elasticsearch',
        'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'JIRA', 'Figma', 'Adobe Creative Suite',
        'Next.js', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Ant Design', 'Redux',
        'Vuex', 'MobX', 'Jest', 'Cypress', 'Selenium', 'Webpack', 'Vite', 'Babel',
        'ESLint', 'Prettier', 'npm', 'yarn', 'pnpm', 'Linux', 'Windows', 'macOS',
        'RESTful', 'Microservices', 'Serverless', 'Lambda', 'EC2', 'S3', 'CloudFront',
        'Terraform', 'Ansible', 'Puppet', 'Chef', 'Nginx', 'Apache', 'PM2', 'Forever'
      ]

      const foundSkills = skillKeywords.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
      )
      parsedData.skills = [...new Set(foundSkills)]
      
      console.log('Skills found:', parsedData.skills)

      // Extract education (look for degree patterns)
      const educationPattern = /(Bachelor|Master|PhD|B\.S\.|M\.S\.|Ph\.D\.|B\.A\.|M\.A\.).*?(University|College|Institute|School)/gi
      const educationMatches = text.match(educationPattern)
      
      if (educationMatches) {
        parsedData.education = educationMatches.slice(0, 3).map((edu: string) => ({
          institution: edu.split(/\s+(?:Bachelor|Master|PhD|B\.S\.|M\.S\.|Ph\.D\.|B\.A\.|M\.A\.)/i)[1] || 'Unknown',
          degree: edu.match(/(Bachelor|Master|PhD|B\.S\.|M\.S\.|Ph\.D\.|B\.A\.|M\.A\.)/i)?.[1] || 'Unknown',
          field: 'Computer Science', // Default, could be enhanced with more parsing
          startDate: '',
          endDate: ''
        }))
      }
      
      console.log('Education found:', parsedData.education.length, 'entries')

      // Extract experience (look for company and position patterns)
      const experiencePatterns = [
        /([A-Z][a-zA-Z\s&]+)\s*[-–—]\s*([A-Z][a-zA-Z\s]+)/g,
        /([A-Z][a-zA-Z\s&]+)\s*at\s*([A-Z][a-zA-Z\s]+)/gi,
        /([A-Z][a-zA-Z\s&]+)\s*:\s*([A-Z][a-zA-Z\s]+)/g
      ]
      
      let experienceMatches: RegExpMatchArray[] = []
      
      for (const pattern of experiencePatterns) {
        const matches = Array.from(text.matchAll(pattern))
        if (matches.length > 0) {
          experienceMatches = matches
          break
        }
      }
      
      if (experienceMatches.length > 0) {
        parsedData.experience = experienceMatches.slice(0, 5).map((match: RegExpMatchArray) => ({
          company: match[1].trim(),
          position: match[2].trim(),
          startDate: '',
          endDate: '',
          description: ['Experience details extracted from resume'],
          technologies: []
        }))
      }
      
      console.log('Experience found:', parsedData.experience.length, 'entries')

      // Extract summary (first paragraph or section)
      const paragraphs = text.split(/\n\s*\n/).filter((p: string) => p.trim().length > 50)
      if (paragraphs.length > 0) {
        parsedData.summary = paragraphs[0].substring(0, 300) + '...'
      } else {
        // Fallback: take first 300 characters if no paragraphs found
        const cleanText = text.replace(/[^\w\s.,!?-]/g, ' ').replace(/\s+/g, ' ').trim()
        if (cleanText.length > 50) {
          parsedData.summary = cleanText.substring(0, 300) + '...'
        } else {
          parsedData.summary = 'Resume content extracted successfully. Please review for complete details.'
        }
      }
      
      console.log('Summary extracted, length:', parsedData.summary?.length || 0)
      console.log('Final parsed data:', {
        skillsCount: parsedData.skills.length,
        educationCount: parsedData.education.length,
        experienceCount: parsedData.experience.length,
        hasSummary: !!parsedData.summary
      })

      return parsedData
    } catch (error: any) {
      console.error('Error parsing resume PDF:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Return a basic structure if parsing fails
      return {
        skills: [],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        summary: 'Unable to parse PDF content. Please review manually.'
      }
    }
  }

  /**
   * Extract skills from resume text using AI
   */
  static async extractSkillsWithAI(resumeText: string): Promise<string[]> {
    // This would use the Gemini API to extract skills more accurately
    // For now, returning basic skill extraction
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue', 'Node.js',
      'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'REST API', 'GraphQL', 'TypeScript', 'HTML', 'CSS', 'SASS',
      'Machine Learning', 'AI', 'Data Science', 'SQL', 'NoSQL', 'Redis', 'Elasticsearch',
      'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'JIRA', 'Figma', 'Adobe Creative Suite'
    ]

    const foundSkills = skillKeywords.filter(skill => 
      resumeText.toLowerCase().includes(skill.toLowerCase())
    )
    
    return [...new Set(foundSkills)]
  }
} 