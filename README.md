
# Interviewer AI - Chat Application

A full-featured chat application with AI-powered conversations, built with Next.js, MongoDB, and Google's Gemini AI.

A full-featured chat application with AI-powered conversations, built with Next.js, MongoDB, and Google's Gemini AI.

## 🚀 Features

### Core Functionality
- **AI Chat Interface**: Clean, modern chat UI with real-time messaging
- **Multiple Chat Sessions**: Create, manage, and switch between different chat conversations
- **Message History**: All conversations are saved and can be loaded from MongoDB
- **Rich Text Formatting**: Support for markdown-like formatting (bold, italic, code blocks, links)

### Database Integration
- **MongoDB Storage**: All chats and messages are persisted in MongoDB
- **Chat Sessions**: Each chat has its own ID and can be managed independently
- **Message Metadata**: Store additional information like tokens used and AI model

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Chat Sidebar**: Easy navigation between chat sessions
- **Real-time Updates**: Messages appear instantly with smooth animations
- **Loading States**: Proper loading indicators for better UX

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: MongoDB with native driver
- **AI**: Google Gemini AI (gemini-pro)
- **Authentication**: NextAuth.js (optional)

## 📁 Project Structure

```
interviewer-ai/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # Authentication
│   │   ├── chat/route.ts                  # Chat API
│   │   ├── chats/route.ts                 # Chat management
│   │   └── register/route.ts              # User registration
│   ├── dashboard/page.tsx                 # Main chat interface
│   └── layout.tsx                         # App layout
├── components/
│   ├── ChatInterface.tsx                  # Main chat component
│   ├── ChatSidebar.tsx                    # Chat history sidebar
│   └── ui/                                # shadcn/ui components
├── lib/
│   ├── db.ts                              # Database operations
│   ├── mongodb.ts                         # MongoDB connection
│   ├── models/Chat.ts                     # TypeScript interfaces
│   └── utils.ts                           # Utility functions
└── types/
    └── next-auth.d.ts                     # Auth type definitions
```

## 🗄️ Database Schema

### Collections

#### `chats`
```typescript
{
  _id: ObjectId,
  title: string,
  createdAt: Date,
  updatedAt: Date,
  messageCount: number,
  userId?: string
}
```

#### `messages`
```typescript
{
  _id: ObjectId,
  chatId: ObjectId,
  content: string,
  role: 'user' | 'assistant',
  timestamp: Date,
  metadata?: {
    tokens?: number,
    model?: string
  }
}
```

#### `users` (for authentication)
```typescript
{
  _id: ObjectId,
  username: string,
  password: string (hashed),
  createdAt: Date
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interviewer-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file:
   ```env
   # Google AI API Key (Required for AI functionality)
   # Get your API key from: https://makersuite.google.com/app/apikey
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   
   # Alternative environment variable names (if needed)
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   
   # MongoDB Connection String
   MONGODB_URI=your_mongodb_connection_string
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000/dashboard`

## 📖 API Endpoints

### Chat Management
- `POST /api/chats` - Create a new chat
- `GET /api/chats` - List all chats
- `GET /api/chats/[id]` - Get specific chat
- `PATCH /api/chats/[id]` - Update chat title
- `DELETE /api/chats/[id]` - Delete chat

### Messaging
- `POST /api/chat` - Send a message and get AI response
- `GET /api/chat?chatId=[id]` - Get messages for a chat

### Authentication (Optional)
- `POST /api/register` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

## 🎨 UI Components

### ChatInterface
- Real-time message display
- Auto-scroll to latest message
- Loading states and error handling
- Markdown-like text formatting

### ChatSidebar
- Chat history navigation
- Create new chat sessions
- Edit chat titles
- Delete chat sessions
- Responsive design

## 🔧 Configuration

### MongoDB Setup
1. Create a MongoDB database named `interviewer-ai`
2. The application will automatically create the required collections

### Google AI Setup
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the key to your environment variables

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🔮 Future Enhancements

- [ ] File attachments support
- [ ] Voice messages
- [ ] Chat export functionality
- [ ] Advanced AI models selection
- [ ] User preferences and settings
- [ ] Real-time collaboration
- [ ] Chat templates and prompts
- [ ] Analytics and insights

