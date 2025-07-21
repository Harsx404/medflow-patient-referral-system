# GTG Frontend - Patient Referral Management System

A modern, AI-powered patient referral management dashboard built with Next.js 14, TypeScript, and Tailwind CSS. This system replaces traditional Google Forms/Sheets integration with a custom solution featuring AI-driven PDF data extraction and streamlined patient management.

## 🚀 Features

### Core Functionality
- **Custom Patient Form**: QR code accessible form for patient referral submissions
- **AI-Powered PDF Processing**: Automatic data extraction from referral PDFs using Google Gemini AI
- **Real-time Dashboard**: Live patient management with status tracking
- **Multi-step Form Process**: Upload → AI Extract → Review → Submit workflow
- **Doctor Management**: Comprehensive doctor profiles and assignment system
- **Status Tracking**: Complete patient journey from referral to completion

### Technical Features
- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand for efficient client-side state
- **PDF Processing**: Advanced PDF text extraction and AI parsing
- **Responsive Design**: Mobile-first approach with modern design patterns
- **Toast Notifications**: Real-time user feedback system

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **AI Integration**: Google Gemini AI
- **PDF Processing**: PDF.js (pdfjs-dist)
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## 📁 Project Structure

```
gtgfrontend/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── extract-patient-data/ # AI-powered PDF data extraction
│   │   └── submit-patient-form/  # Form submission handling
│   ├── admin/                    # Admin dashboard
│   ├── doctor-dashboard/         # Doctor-specific views
│   ├── doctor-login/            # Doctor authentication
│   ├── login/                   # General login
│   ├── notifications/           # Notification center
│   ├── patient-form/            # QR code accessible patient form
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React Components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── custom-patient-form.tsx    # Multi-step patient form
│   │   ├── dashboard-header.tsx       # Main dashboard header
│   │   ├── doctors-panel.tsx          # Doctor management
│   │   ├── live-updates-panel.tsx     # Real-time updates
│   │   ├── patient-details-modal.tsx  # Patient detail view
│   │   ├── patients-table.tsx         # Patient data table
│   │   ├── pdf-viewer-modal.tsx       # PDF viewing component
│   │   ├── qr-code-generator.tsx      # QR code generation
│   │   ├── rejection-tracker.tsx      # Rejection management
│   │   ├── stats-cards.tsx            # Dashboard statistics
│   │   ├── timeline-modal.tsx         # Patient timeline
│   │   └── upload-referral.tsx        # File upload component
│   ├── theme/                   # Theme configuration
│   ├── ui/                      # Reusable UI components (shadcn/ui)
│   └── theme-provider.tsx       # Theme context provider
├── lib/                         # Utility libraries
│   ├── assets.ts               # Asset management
│   ├── mock-data.ts            # Development data
│   ├── pdf-utils.ts            # PDF processing utilities
│   ├── store.ts                # Zustand state management
│   └── utils.ts                # General utilities
├── public/                      # Static assets
│   ├── assets/                 # Application assets
│   │   ├── icons/              # Icon files
│   │   ├── illustrations/      # Illustration assets
│   │   ├── images/             # Image files
│   │   └── logos/              # Logo assets
│   ├── favicon.ico             # Site favicon
│   └── manifest.json           # PWA manifest
└── Configuration Files
    ├── next.config.js          # Next.js configuration
    ├── tailwind.config.ts      # Tailwind CSS configuration
    ├── tsconfig.json           # TypeScript configuration
    ├── postcss.config.js       # PostCSS configuration
    └── package.json            # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini AI API key (for PDF processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gtgfrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Key Pages & Features

### Main Dashboard (`/`)
- Patient overview table with real-time status updates
- Statistics cards showing key metrics
- Doctor management panel
- QR code generator for patient form access

### Patient Form (`/patient-form`)
- QR code accessible patient referral form
- Multi-step process: Upload → Extract → Review → Submit
- AI-powered PDF data extraction
- Form validation and error handling

### Doctor Dashboard (`/doctor-dashboard`)
- Doctor-specific patient views
- Assignment management
- Status tracking and updates

### Admin Panel (`/admin`)
- System administration
- User management
- Configuration settings

## 🔧 API Endpoints

### `/api/extract-patient-data`
- **Method**: POST
- **Purpose**: AI-powered PDF data extraction
- **Input**: PDF file upload
- **Output**: Structured patient data JSON

### `/api/submit-patient-form`
- **Method**: POST
- **Purpose**: Patient form submission
- **Input**: Patient form data
- **Output**: Submission confirmation with referral ID

## 🎨 UI Components

The application uses a comprehensive set of reusable UI components based on shadcn/ui:

- **Form Components**: Input, Label, Textarea, Select
- **Navigation**: Tabs, Dropdown Menu
- **Feedback**: Toast, Progress, Badge
- **Layout**: Card, Separator, Dialog
- **Data Display**: Table, Avatar
- **Interactive**: Button, various form controls

## 🔄 State Management

The application uses Zustand for state management with the following stores:

- **Patient Store**: Patient data, CRUD operations
- **Doctor Store**: Doctor information and assignments
- **UI Store**: Modal states, loading states, notifications

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel
The application is optimized for Vercel deployment:
```bash
npm run build
# Deploy using Vercel CLI or GitHub integration
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key for PDF processing | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL | No |

## 📝 Development Notes

### Key Design Decisions
- **Custom Form System**: Replaced Google Forms/Sheets with custom solution for better control
- **AI Integration**: Leveraged Google Gemini for intelligent PDF data extraction
- **Modern Stack**: Used Next.js 14 App Router for optimal performance
- **Type Safety**: Full TypeScript implementation for better developer experience

### Performance Optimizations
- Server-side rendering with Next.js
- Optimized bundle splitting
- Lazy loading for heavy components
- Efficient state management with Zustand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments for implementation details

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**