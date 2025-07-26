# Next.js Authentication System

A complete authentication system built with Next.js, NextAuth.js, and MongoDB featuring user registration, login, and protected routes.

## Features

- ✅ User registration with username and password
- ✅ Secure password hashing with bcrypt
- ✅ User login with NextAuth.js
- ✅ Protected dashboard route
- ✅ Session management with JWT
- ✅ MongoDB integration for user storage
- ✅ Clean, responsive UI with Tailwind CSS
- ✅ Error handling and success messages
- ✅ Logout functionality

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: NextAuth.js v4
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://cursors461:IcUg0k9RNjLWSG7E@hackatonproject.svdyxxw.mongodb.net/?retryWrites=true&w=majority&appName=hackatonproject

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Registration
1. Navigate to `/register`
2. Enter a username and password (minimum 6 characters)
3. Submit the form
4. You'll be redirected to login upon successful registration

### Login
1. Navigate to `/login`
2. Enter your username and password
3. Submit the form
4. You'll be redirected to the dashboard upon successful login

### Dashboard
- Protected route accessible only to authenticated users
- Displays user information
- Includes logout functionality

### Logout
- Click the "Logout" button in the dashboard
- You'll be redirected to the login page

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth configuration
│   │   └── register/route.ts            # Registration API
│   ├── dashboard/page.tsx               # Protected dashboard
│   ├── login/page.tsx                   # Login page
│   ├── register/page.tsx                # Registration page
│   ├── layout.tsx                       # Root layout with providers
│   ├── page.tsx                         # Home page (redirects)
│   └── providers.tsx                    # Session provider
├── lib/
│   └── mongodb.ts                       # MongoDB connection utility
├── types/
│   └── next-auth.d.ts                   # NextAuth type extensions
├── middleware.ts                        # Route protection middleware
└── .env.local                           # Environment variables
```

## API Endpoints

### POST /api/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- `201`: User created successfully
- `400`: Missing username/password or password too short
- `409`: Username already exists
- `500`: Internal server error

### POST /api/auth/signin
Login with credentials (handled by NextAuth.js).

## Security Features

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens for session management
- Protected routes with middleware
- Input validation and sanitization
- Secure MongoDB connection

## Database Schema

The application uses a `users` collection in MongoDB with the following structure:

```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

## Customization

### Adding Email Support
To add email functionality:
1. Install email provider: `npm install @next-auth/email-provider`
2. Configure email settings in NextAuth
3. Update registration to include email field

### Adding OAuth Providers
To add Google, GitHub, or other OAuth providers:
1. Install the provider: `npm install @next-auth/google-provider`
2. Add provider configuration to NextAuth
3. Set up OAuth credentials in the provider's developer console

### Styling
The application uses Tailwind CSS. You can customize the styling by:
1. Modifying the CSS classes in the components
2. Adding custom styles to `app/globals.css`
3. Configuring Tailwind in `tailwind.config.js`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your MongoDB URI in `.env.local`
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure the database and collection exist

2. **NextAuth Secret Error**
   - Generate a new secret: `openssl rand -base64 32`
   - Update `NEXTAUTH_SECRET` in `.env.local`

3. **TypeScript Errors**
   - Run `npm run build` to check for type errors
   - Ensure all dependencies are properly installed

### Development Tips

- Use the browser's developer tools to check for console errors
- Monitor the terminal for server-side errors
- Check MongoDB Atlas dashboard for connection issues

## Production Deployment

1. Set up environment variables in your hosting platform
2. Update `NEXTAUTH_URL` to your production domain
3. Generate a secure `NEXTAUTH_SECRET`
4. Configure MongoDB Atlas for production access
5. Build and deploy: `npm run build && npm start`

## License

This project is open source and available under the [MIT License](LICENSE).
