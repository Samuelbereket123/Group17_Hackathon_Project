import { IJobDescription } from '../models/JobDescription'

export class JobDescriptionParserService {
  /**
   * Parse job description text and extract structured data
   */
  static async parseJobDescription(text: string): Promise<IJobDescription['parsedData']> {
    try {
      const parsedData: IJobDescription['parsedData'] = {
        requiredSkills: [],
        preferredSkills: [],
        responsibilities: [],
        requirements: [],
        benefits: []
      }

      // Extract required skills (look for "required", "must have", "essential" keywords)
      const requiredSkillPatterns = [
        /required.*?skills?[:\s]*([^.]+)/gi,
        /must have.*?skills?[:\s]*([^.]+)/gi,
        /essential.*?skills?[:\s]*([^.]+)/gi,
        /qualifications[:\s]*([^.]+)/gi
      ]

      for (const pattern of requiredSkillPatterns) {
        const matches = text.match(pattern)
        if (matches) {
          const skills = this.extractSkillsFromText(matches.join(' '))
          parsedData.requiredSkills.push(...skills)
        }
      }

      // Extract preferred skills (look for "preferred", "nice to have", "bonus" keywords)
      const preferredSkillPatterns = [
        /preferred.*?skills?[:\s]*([^.]+)/gi,
        /nice to have.*?skills?[:\s]*([^.]+)/gi,
        /bonus.*?skills?[:\s]*([^.]+)/gi,
        /plus.*?skills?[:\s]*([^.]+)/gi
      ]

      for (const pattern of preferredSkillPatterns) {
        const matches = text.match(pattern)
        if (matches) {
          const skills = this.extractSkillsFromText(matches.join(' '))
          parsedData.preferredSkills.push(...skills)
        }
      }

      // Extract responsibilities (look for bullet points or numbered lists)
      const responsibilityPatterns = [
        /responsibilities?[:\s]*([^.]+)/gi,
        /duties?[:\s]*([^.]+)/gi,
        /what you'll do[:\s]*([^.]+)/gi
      ]

      for (const pattern of responsibilityPatterns) {
        const matches = text.match(pattern)
        if (matches) {
          const responsibilities = this.extractListItems(matches.join(' '))
          parsedData.responsibilities.push(...responsibilities)
        }
      }

      // Extract requirements (look for "requirements", "qualifications" sections)
      const requirementPatterns = [
        /requirements?[:\s]*([^.]+)/gi,
        /qualifications?[:\s]*([^.]+)/gi,
        /what you need[:\s]*([^.]+)/gi
      ]

      for (const pattern of requirementPatterns) {
        const matches = text.match(pattern)
        if (matches) {
          const requirements = this.extractListItems(matches.join(' '))
          parsedData.requirements.push(...requirements)
        }
      }

      // Extract benefits (look for "benefits", "perks", "what we offer" sections)
      const benefitPatterns = [
        /benefits?[:\s]*([^.]+)/gi,
        /perks?[:\s]*([^.]+)/gi,
        /what we offer[:\s]*([^.]+)/gi
      ]

      for (const pattern of benefitPatterns) {
        const matches = text.match(pattern)
        if (matches) {
          const benefits = this.extractListItems(matches.join(' '))
          parsedData.benefits?.push(...benefits)
        }
      }

      // Extract location
      const locationMatch = text.match(/(remote|hybrid|on-site|in-office|location[:\s]*([^.]+))/i)
      if (locationMatch) {
        parsedData.location = locationMatch[0]
      }

      // Extract employment type
      const employmentTypeMatch = text.match(/(full-time|part-time|contract|internship|freelance)/i)
      if (employmentTypeMatch) {
        parsedData.employmentType = employmentTypeMatch[0]
      }

      // Extract experience level
      const experienceLevelMatch = text.match(/(entry-level|junior|mid-level|senior|lead|principal|executive)/i)
      if (experienceLevelMatch) {
        parsedData.experienceLevel = experienceLevelMatch[0]
      }

      // Remove duplicates
      parsedData.requiredSkills = [...new Set(parsedData.requiredSkills)]
      parsedData.preferredSkills = [...new Set(parsedData.preferredSkills)]
      parsedData.responsibilities = [...new Set(parsedData.responsibilities)]
      parsedData.requirements = [...new Set(parsedData.requirements)]
      if (parsedData.benefits) {
        parsedData.benefits = [...new Set(parsedData.benefits)]
      }

      return parsedData
    } catch (error) {
      console.error('Error parsing job description:', error)
      throw new Error('Failed to parse job description')
    }
  }

  /**
   * Extract skills from text using common skill keywords
   */
  private static extractSkillsFromText(text: string): string[] {
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue', 'Node.js',
      'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'REST API', 'GraphQL', 'TypeScript', 'HTML', 'CSS', 'SASS',
      'Machine Learning', 'AI', 'Data Science', 'SQL', 'NoSQL', 'Redis', 'Elasticsearch',
      'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'JIRA', 'Figma', 'Adobe Creative Suite',
      'Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Project Management'
    ]

    return skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    )
  }

  /**
   * Extract list items from text (bullet points, numbered lists, etc.)
   */
  private static extractListItems(text: string): string[] {
    const items: string[] = []
    
    // Split by common list separators
    const lines = text.split(/[•\-\*]\s*|\d+\.\s*|\n\s*[•\-\*]\s*|\n\s*\d+\.\s*/)
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 10 && trimmed.length < 200) {
        items.push(trimmed)
      }
    }

    return items.slice(0, 10) // Limit to 10 items
  }
} 