# 🚀 Quick Deployment Guide

## ✅ What's Ready
- ✅ Git repository initialized
- ✅ Code committed to git
- ✅ Environment variables configured
- ✅ Vercel configuration ready

## 🔑 Get Your Google Gemini AI API Key FIRST

**This is REQUIRED for the app to work:**
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy and save the key securely

## 📤 Step 1: Upload to GitHub

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Repository name: `medflow-patient-referral-system`
   - Description: `AI-powered patient referral management system`
   - Keep it Public or Private (your choice)
   - Don't initialize with README

2. **Connect Your Local Repository:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/medflow-patient-referral-system.git
   git push -u origin main
   ```

## 🚀 Step 2: Deploy to Vercel

1. **Connect to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Select your `medflow-patient-referral-system` repository

2. **Configure Settings:**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables (CRITICAL):**
   In Vercel Dashboard → Settings → Environment Variables:
   ```
   GEMINI_API_KEY = your_actual_gemini_api_key_here
   NEXT_PUBLIC_APP_URL = https://your-project-name.vercel.app
   NODE_ENV = production
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build completion
   - Your app will be live!

## 🎯 What Will Work After Deployment

✅ **Fully Functional:**
- Modern landing page
- Admin dashboard with statistics
- Patient form with QR codes
- **AI-powered PDF data extraction** (with your API key)
- Real-time dashboard updates
- Mobile-responsive design
- Dark/light themes

⚠️ **Note:** Uses mock data (no database yet)

## 🛠️ Test Locally First (Optional)

```bash
# Create local environment file
cp .env.example .env.local

# Add your actual API key to .env.local
# GEMINI_API_KEY=your_actual_key_here

# Install and run
npm install
npm run dev
```

## 🆘 Troubleshooting

**Build Fails?**
- Ensure GEMINI_API_KEY is set in Vercel
- Check the API key is valid

**PDF Processing Not Working?**
- Verify your Gemini API key is correct
- Check Google Cloud Console for usage limits

**Ready to deploy? Follow the GitHub and Vercel steps above! 🚀** 