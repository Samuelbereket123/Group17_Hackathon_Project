import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("auth-db")
    const usersCollection = db.collection("users")

    // Check if username already exists
    const existingUser = await usersCollection.findOne({ username })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
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
        message: 'User created successfully',
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