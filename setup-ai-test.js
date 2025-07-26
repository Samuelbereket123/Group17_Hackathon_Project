#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 AI Test Setup');
console.log('================');
console.log('');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envContent = `# Google AI API Key (Required for AI functionality)
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Edit .env.local and add your Google AI API key');
  console.log('   2. Get your API key from: https://makersuite.google.com/app/apikey');
  console.log('   3. Run: npm install (to install ts-node)');
  console.log('   4. Run: npm run test:ai (to test the AI)');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('');
console.log('🚀 To test your AI API:');
console.log('   npm run test:ai');
console.log('');
console.log('🌐 To test your local API:');
console.log('   Make sure your Next.js server is running (npm run dev)');
console.log('   Then run: npm run test:ai');
console.log(''); 