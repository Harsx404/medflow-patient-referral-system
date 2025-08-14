#!/bin/bash

# GTG-MED Patient Referral System Quick Start Script
echo "🚀 GTG-MED Patient Referral System Quick Start"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env.local
        echo "✅ Created .env.local from template"
        echo "⚠️  Please edit .env.local and add your GEMINI_API_KEY"
    else
        echo "❌ env.example not found. Please create .env.local manually"
        echo "Required variables:"
        echo "  GEMINI_API_KEY=your_gemini_api_key_here"
        echo "  NEXT_PUBLIC_APP_URL=http://localhost:3000"
    fi
else
    echo "✅ .env.local file found"
fi

# Check if GEMINI_API_KEY is set
if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env.local 2>/dev/null; then
    echo "⚠️  Please add your GEMINI_API_KEY to .env.local"
    echo "   Get it from: https://makersuite.google.com/app/apikey"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Edit .env.local and add your GEMINI_API_KEY"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 For detailed setup instructions, see SETUP_GUIDE.md"
echo "🔧 For improvement plans, see IMPROVEMENT_PLAN.md"
echo ""
echo "🚀 Ready to start development!" 