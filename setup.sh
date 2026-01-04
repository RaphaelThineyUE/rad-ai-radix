#!/bin/bash

# RadReport AI - Quick Start Script
# This script helps you quickly set up the development environment

set -e

echo "🏥 RadReport AI - Quick Start Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not detected. You'll need MongoDB running locally or a connection string."
    echo "   Install MongoDB: https://www.mongodb.com/docs/manual/installation/"
    echo "   Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
fi

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi

echo "Installing backend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit backend/.env with your MongoDB URI and OpenAI API key"
    echo "   - MONGODB_URI: Your MongoDB connection string"
    echo "   - JWT_SECRET: Generate with: openssl rand -base64 32"
    echo "   - OPENAI_API_KEY: Your OpenAI API key from https://platform.openai.com/"
fi

echo "✅ Backend setup complete"

# Setup frontend
cd ../frontend
echo ""
echo "📦 Setting up frontend..."

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

echo "Installing frontend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "✅ Frontend .env created (defaults to http://localhost:5000/api)"
fi

# Install Playwright browsers
echo ""
echo "📦 Installing Playwright browsers for E2E testing..."
npx playwright install chromium

echo ""
echo "✅ Frontend setup complete"

cd ..

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit backend/.env with your MongoDB URI and OpenAI API key"
echo ""
echo "2. Start the development servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:5000/api"
echo "   - Health check: http://localhost:5000/api/health"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview and API documentation"
echo "   - IMPLEMENTATION_STATUS.md - What's complete and what's pending"
echo "   - DEVELOPMENT_ROADMAP.md - Guide for completing remaining features"
echo "   - DEPLOYMENT.md - Production deployment guide"
echo ""
echo "🧪 Testing:"
echo "   - Backend tests: cd backend && npm test"
echo "   - Frontend E2E: cd frontend && npm run test:e2e"
echo ""
echo "❓ Need help? Check the README.md or DEVELOPMENT_ROADMAP.md"
echo ""
echo "Happy coding! 🚀"
