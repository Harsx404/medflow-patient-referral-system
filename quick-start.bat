@echo off
chcp 65001 >nul
echo 🚀 GTG-MED Patient Referral System Quick Start
echo ==============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local file not found. Creating from template...
    if exist "env.example" (
        copy "env.example" ".env.local" >nul
        echo ✅ Created .env.local from template
        echo ⚠️  Please edit .env.local and add your GEMINI_API_KEY
    ) else (
        echo ❌ env.example not found. Please create .env.local manually
        echo Required variables:
        echo   GEMINI_API_KEY=your_gemini_api_key_here
        echo   NEXT_PUBLIC_APP_URL=http://localhost:3000
    )
) else (
    echo ✅ .env.local file found
)

echo.
echo 🎯 Next Steps:
echo 1. Edit .env.local and add your GEMINI_API_KEY
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo 📚 For detailed setup instructions, see SETUP_GUIDE.md
echo 🔧 For improvement plans, see IMPROVEMENT_PLAN.md
echo.
echo 🚀 Ready to start development!
pause 