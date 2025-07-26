import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'
import { IChat, IChatMessage } from './models/Chat'
import { DATABASE_CONFIG } from './config'

export async function getDb() {
  const client = await clientPromise
  return client.db(DATABASE_CONFIG.name)
}

// Chat operations
export async function createChat(title: string = 'New Chat', userId?: string): Promise<IChat> {
  const db = await getDb()
  const chat: Omit<IChat, '_id'> = {
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
    messageCount: 0,
    userId
  }
  
  const result = await db.collection(DATABASE_CONFIG.collections.chats).insertOne(chat)
  return { ...chat, _id: result.insertedId }
}

export async function getChats(userId?: string): Promise<IChat[]> {
  const db = await getDb()
  const filter = userId ? { userId } : {}
  
  return await db.collection(DATABASE_CONFIG.collections.chats)
    .find(filter)
    .sort({ updatedAt: -1 })
    .toArray() as IChat[]
}

export async function getChat(chatId: string): Promise<IChat | null> {
  const db = await getDb()
  return await db.collection(DATABASE_CONFIG.collections.chats).findOne({ 
    _id: new ObjectId(chatId) 
  }) as IChat | null
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  const db = await getDb()
  await db.collection(DATABASE_CONFIG.collections.chats).updateOne(
    { _id: new ObjectId(chatId) },
    { 
      $set: { 
        title,
        updatedAt: new Date()
      }
    }
  )
}

export async function deleteChat(chatId: string): Promise<void> {
  const db = await getDb()
  const objectId = new ObjectId(chatId)
  
  // Delete chat and all its messages
  await Promise.all([
    db.collection(DATABASE_CONFIG.collections.chats).deleteOne({ _id: objectId }),
    db.collection(DATABASE_CONFIG.collections.messages).deleteMany({ chatId: objectId })
  ])
}

// Message operations
export async function saveMessage(chatId: string, content: string, role: 'user' | 'assistant', metadata?: any): Promise<IChatMessage> {
  const db = await getDb()
  const message: Omit<IChatMessage, '_id'> = {
    chatId: new ObjectId(chatId),
    content,
    role,
    timestamp: new Date(),
    metadata
  }
  
  const result = await db.collection(DATABASE_CONFIG.collections.messages).insertOne(message)
  
  // Update chat's message count and updatedAt
  await db.collection(DATABASE_CONFIG.collections.chats).updateOne(
    { _id: new ObjectId(chatId) },
    { 
      $inc: { messageCount: 1 },
      $set: { updatedAt: new Date() }
    }
  )
  
  return { ...message, _id: result.insertedId }
}

export async function getMessages(chatId: string): Promise<IChatMessage[]> {
  const db = await getDb()
  return await db.collection(DATABASE_CONFIG.collections.messages)
    .find({ chatId: new ObjectId(chatId) })
    .sort({ timestamp: 1 })
    .toArray() as IChatMessage[]
}

export async function getLastMessage(chatId: string): Promise<IChatMessage | null> {
  const db = await getDb()
  return await db.collection(DATABASE_CONFIG.collections.messages)
    .findOne(
      { chatId: new ObjectId(chatId) },
      { sort: { timestamp: -1 } }
    ) as IChatMessage | null
} 