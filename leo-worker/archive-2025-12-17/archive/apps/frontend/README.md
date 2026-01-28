# AI Tenant Rights Advisor

A comprehensive web application that empowers tenants with AI-powered legal guidance, document analysis, and communication tools for handling landlord-tenant issues.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd /Users/labheshpatel/apps/app-factory/apps/ai-lawyer/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🔐 Demo Login

The app includes a demo mode that works without any backend server!

### Demo Credentials:
- **Email**: `demo@example.com`
- **Password**: `demo123!`

### How to Login:
1. **Option 1**: Click the "Use Demo Account" button on the sign-in page (auto-fills credentials)
2. **Option 2**: Manually enter the demo credentials above

### Demo Features:
- ✅ No backend server required
- ✅ Full access to all app features with mock data
- ✅ Instant login with mock authentication
- ✅ Clear visual indication of demo mode on login page

## 📱 Features

### 1. AI Legal Advisor Chat
- Real-time legal guidance powered by AI
- California tenant rights expertise
- Legal citations and references
- Conversation history

### 2. Document Review & Analysis
- Upload and analyze lease agreements
- AI-powered issue detection
- Risk assessment (Low/Medium/High)
- Specific clause recommendations

### 3. Property Documentation
- Photo/video capture for move-in/move-out
- AI damage detection
- Timestamped evidence collection
- Digital signature support

### 4. Dispute Resolution Wizard
- Step-by-step dispute guidance
- Evidence organization
- Timeline tracking
- Document generation

### 5. Letter Generator
- Pre-written legal letter templates
- Customizable for specific situations
- Professional formatting
- Delivery tracking

### 6. Security Deposit Tracker
- Automatic interest calculations
- Deduction dispute tools
- Legal timeline reminders
- Evidence linking

### 7. Secure Communications
- Documented landlord communication
- Read receipts
- Attachment support
- Legal record keeping

### 8. Knowledge Base
- Searchable legal articles
- California-specific laws
- Common scenarios
- Step-by-step guides

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Context
- **Data Fetching**: SWR

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (protected)/       # Protected app pages
│   └── api/               # API routes (if any)
├── components/            # Reusable components
│   └── ui/               # ShadCN UI components
├── contexts/             # React contexts
├── lib/                  # Utilities and helpers
├── public/               # Static assets
└── types/                # TypeScript types
```

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Testing Demo Mode

Visit the demo test page to directly test authentication:
```
http://localhost:3000/demo-test
```

## 🐛 Troubleshooting

### Login Issues
1. Clear your browser's localStorage
2. Restart the development server
3. Check browser console for errors
4. Ensure you're using the correct demo credentials

### Build Errors
1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Check for TypeScript errors with `npm run type-check`

## 📝 License

This project is part of the AI App Factory and is used for demonstration purposes.

---

Built with ❤️ using Next.js and ShadCN UI