import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { DATABASE_CONFIG, VALIDATION_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (password.length < VALIDATION_CONFIG.password.minLength) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.auth.passwordTooShort },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db(DATABASE_CONFIG.name)
    const usersCollection = db.collection(DATABASE_CONFIG.collections.users)

    // Check if username already exists
    const existingUser = await usersCollection.findOne({ username })
    if (existingUser) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.auth.userExists },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const result = await usersCollection.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date()
    })

    return NextResponse.json(
      { 
        message: SUCCESS_MESSAGES.auth.userCreated,
        userId: result.insertedId 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 