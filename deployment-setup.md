# 🚀 Deployment Setup Guide - MedFlow

This guide will help you deploy the MedFlow Patient Referral Management System to GitHub and Vercel.

## 📋 Prerequisites

1. **Node.js 18+** installed
2. **Git** installed
3. **GitHub account**
4. **Vercel account**
5. **Google Gemini AI API Key** (Required)

## 🔑 Environment Variables Required

### Essential API Keys

| Variable | Description | Required | Where to Get |
|----------|-------------|----------|--------------|
| `GEMINI_API_KEY` | Google Gemini AI API key for PDF processing | ✅ Yes | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `NEXT_PUBLIC_APP_URL` | Application base URL | ⚪ Optional | Your deployed URL (e.g., https://your-app.vercel.app) |

### Getting Your Google Gemini AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Keep it secure - you'll need it for deployment

## 📁 Required Environment Files

Create these files in your project root:

### `.env.example` (Template)
```env
# Google Gemini AI API Key (REQUIRED for PDF processing)
GEMINI_API_KEY=your_gemini_api_key_here

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### `.env.local` (Local Development)
```env
# Your actual API keys for local development
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🐙 GitHub Setup

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: MedFlow Patient Referral Management System"
```

### 2. Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it: `medflow-patient-referral-system`
4. Description: `AI-powered patient referral management system with Google Gemini integration`
5. Keep it **Public** or **Private** (your choice)
6. Don't initialize with README (we already have one)

### 3. Connect Local to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/medflow-patient-referral-system.git
git branch -M main
git push -u origin main
```

## ⚡ Vercel Deployment

### 1. Connect to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `medflow-patient-referral-system` repository

### 2. Configure Build Settings
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x or later
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Environment Variables Setup
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
GEMINI_API_KEY = your_actual_gemini_api_key
NEXT_PUBLIC_APP_URL = https://your-project-name.vercel.app
NODE_ENV = production
```

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## 🔧 Quick Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Git Commands
```bash
# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build fails with "GEMINI_API_KEY is not defined"**
   - Ensure you've added the API key in Vercel environment variables
   - Check the API key is valid and active

2. **PDF processing doesn't work**
   - Verify Gemini API key is correct
   - Check API quotas and billing in Google Cloud Console

3. **404 errors on deployment**
   - Ensure all file paths use forward slashes
   - Check that all imports are correct

4. **Asset loading issues**
   - Verify all assets exist in the `public/assets/` folder
   - Check asset paths in `lib/assets.ts`

## 📱 Features That Will Work After Deployment

✅ **Working Features:**
- Landing page with modern UI
- Admin dashboard with statistics
- Patient form with QR code access
- AI-powered PDF data extraction
- Real-time dashboard updates
- Mobile-responsive design
- Dark/light theme switching

⚠️ **Note:** Currently uses mock data (no database integration)

## 🔮 Next Steps After Deployment

1. **Database Integration**: Add PostgreSQL/MongoDB for data persistence
2. **Authentication**: Implement proper user authentication
3. **Email Notifications**: Add email alerts for referrals
4. **File Storage**: Implement cloud storage for PDFs
5. **Analytics**: Add user analytics and monitoring

## 🆘 Support

If you encounter issues:
1. Check the Vercel build logs
2. Verify all environment variables are set
3. Test locally first with `npm run build`
4. Check the console for JavaScript errors

---

**Happy Deploying! 🚀** 