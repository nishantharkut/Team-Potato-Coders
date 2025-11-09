# Uproot - AI Career Coach

<div align="center">

![Uproot Logo](public/logo-uproot.webp)

**An AI-powered career coaching platform that helps professionals accelerate their career growth through intelligent resume building, cover letter generation, interview preparation, and industry insights.**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Relationships](#database-relationships)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Uproot** is a comprehensive career development platform that leverages artificial intelligence to help professionals:

- Create ATS-optimized resumes with AI assistance
- Generate personalized cover letters
- Practice interviews with AI-powered mock sessions
- Track career progress with detailed analytics
- Access real-time industry insights and market trends
- Schedule automated calls for career coaching
- Get personalized career guidance through an AI chatbot

The platform follows a freemium business model with tiered subscriptions (Free, Basic, Pro) and supports both traditional payment methods (Stripe) and Web3 payments.

---

## ✨ Features

### Core Features

1. **AI-Powered Resume Builder**
   - ATS (Applicant Tracking System) optimization
   - Multiple resume versions with version control
   - Cloud-based storage with Cloudinary integration
   - PDF export capabilities
   - Public sharing links

2. **Cover Letter Generator**
   - AI-generated personalized cover letters
   - Job description analysis
   - Multiple drafts and iterations
   - Company and role-specific customization

3. **Interview Preparation System**
   - AI-powered mock interviews
   - Role-specific questions
   - Performance assessments with scores
   - Improvement tips and feedback
   - Category-based quiz system

4. **Industry Insights Dashboard**
   - Real-time industry trends
   - Salary range data
   - Growth rate analysis
   - Market outlook
   - Recommended skills
   - Key trends identification

5. **Scheduled Call Automation**
   - Automated call scheduling
   - Call logs and transcripts
   - Recording storage
   - Status tracking

6. **AI Career Chatbot**
   - 24/7 career guidance
   - Personalized recommendations
   - Industry-specific advice

7. **Subscription Management**
   - Multiple subscription tiers (Free, Basic, Pro)
   - Stripe integration for payments
   - Web3/Blockchain payment support
   - Usage tracking and limits
   - Subscription cancellation and renewal

8. **User Authentication & Authorization**
   - NextAuth.js integration
   - OAuth provider support
   - Email/password authentication
   - Password reset functionality
   - Email verification

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15.1.7** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Server-side API
- **NextAuth.js 5.0** - Authentication
- **Prisma 6.4.1** - ORM
- **PostgreSQL** - Database
- **Node.js** - Runtime environment

### AI & External Services
- **OpenAI GPT-4** - AI-powered features
- **Cloudinary** - File storage and image processing
- **Stripe** - Payment processing
- **Inngest** - Background job processing
- **Resend** - Email service
- **Ethers.js** - Web3 integration

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Zod** - Schema validation

---

## 🗄 Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o| Subscription : "has"
    User ||--o{ Resume : "creates"
    User ||--o{ CoverLetter : "creates"
    User ||--o{ Assessment : "takes"
    User ||--o{ ScheduledCall : "schedules"
    User ||--o{ CallLog : "has"
    User ||--o{ UsageTracking : "tracks"
    IndustryInsight ||--o{ User : "has"
    
    Resume ||--o{ ResumeVersion : "has"
    
    ScheduledCall ||--o| CallLog : "generates"
    
    User {
        string id PK
        string email UK
        string name
        string imageUrl
        string industry
        datetime createdAt
        datetime updatedAt
        string bio
        int experience
        string[] skills
        string stripeCustomerId UK
        string walletAddress UK
        datetime emailVerified
        string password
        datetime passwordResetExpires
        string passwordResetToken UK
    }
    
    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }
    
    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }
    
    VerificationToken {
        string identifier
        string token UK
        datetime expires
    }
    
    Subscription {
        string id PK
        string userId FK UK
        string stripeSubscriptionId UK
        string tier
        string status
        datetime currentPeriodStart
        datetime currentPeriodEnd
        boolean cancelAtPeriodEnd
        datetime canceledAt
        datetime createdAt
        datetime updatedAt
        string stripeCustomerId
        string stripePriceId
        string paymentMethod
        string transactionHash
        string walletAddress
    }
    
    Resume {
        string id PK
        string userId FK
        datetime createdAt
        datetime updatedAt
        string currentVersionId
        string publicLinkId UK
        string title
    }
    
    ResumeVersion {
        string id PK
        string resumeId FK
        int versionNumber
        boolean isCurrent
        string content
        string cloudinaryUrl
        string fileName
        float atsScore
        string feedback
        datetime createdAt
        datetime updatedAt
    }
    
    CoverLetter {
        string id PK
        string userId FK
        string content
        string jobDescription
        string companyName
        string jobTitle
        string status
        datetime createdAt
        datetime updatedAt
    }
    
    Assessment {
        string id PK
        string userId FK
        float quizScore
        json[] questions
        string category
        string improvementTip
        datetime createdAt
        datetime updatedAt
    }
    
    ScheduledCall {
        string id PK
        string userId FK
        string phoneNumber
        datetime scheduledTime
        string recipientName
        string status
        string inngestEventId
        datetime createdAt
        datetime updatedAt
    }
    
    CallLog {
        string id PK
        string userId FK
        string scheduledCallId FK UK
        string phoneNumber
        string recipientName
        string status
        int duration
        datetime startedAt
        datetime endedAt
        string recordingUrl
        string transcript
        string errorMessage
        datetime createdAt
        datetime updatedAt
    }
    
    UsageTracking {
        string id PK
        string userId FK
        string feature
        int count
        datetime createdAt
        datetime updatedAt
        datetime month
    }
    
    IndustryInsight {
        string id PK
        string industry UK
        json[] salaryRanges
        float growthRate
        string demandLevel
        string[] topSkills
        string marketOutlook
        string[] keyTrends
        string[] recommendedSkills
        datetime lastUpdated
        datetime nextUpdate
    }
```

### Database Models Description

#### User
Central entity representing platform users. Stores profile information, authentication data, and references to all user-related entities.

**Key Fields:**
- `id`: Unique identifier (UUID)
- `email`: Unique email address
- `stripeCustomerId`: Stripe customer ID for payments
- `walletAddress`: Web3 wallet address for blockchain payments
- `industry`: References IndustryInsight model
- `skills`: Array of user skills

#### Account
OAuth account information for users who sign in via third-party providers (Google, GitHub, etc.).

#### Session
User session tokens for authentication management via NextAuth.js.

#### VerificationToken
Email verification tokens for account verification.

#### Subscription
User subscription information including tier, status, payment method, and billing details. Supports both Stripe and Web3 payments.

**Subscription Tiers:**
- `Free`: Basic features with limited usage
- `Basic`: $9.99/month - Enhanced features
- `Pro`: $19.99/month - Unlimited access

#### Resume
Resume container that can have multiple versions. Each resume has a unique public link for sharing.

#### ResumeVersion
Individual version of a resume with content, ATS score, feedback, and file storage information.

#### CoverLetter
AI-generated cover letters with job-specific information and status tracking.

#### Assessment
Interview quiz results with scores, questions, categories, and improvement tips.

#### ScheduledCall
Scheduled call information with phone numbers, timing, and status. Linked to Inngest for automation.

#### CallLog
Call execution logs with duration, transcripts, recordings, and error information.

#### UsageTracking
Feature usage tracking per user per month. Tracks usage counts for subscription limit enforcement.

#### IndustryInsight
Industry-specific insights including salary ranges, growth rates, skills, trends, and market outlook.

---

## 📁 Project Structure

```
Team-Potato-Coders/
├── prisma/
│   ├── migrations/          # Database migration files
│   └── schema.prisma        # Prisma schema definition
├── public/                  # Static assets
│   ├── logo-uproot.ico
│   └── logo-uproot.webp
├── src/
│   ├── actions/             # Server actions
│   │   ├── calls.js
│   │   ├── cover-letter.js
│   │   ├── dashboard.js
│   │   ├── interview.js
│   │   ├── resume.js
│   │   ├── subscription.js
│   │   ├── usage.js
│   │   └── user.js
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Authentication routes
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (main)/          # Main application routes
│   │   │   ├── dashboard/
│   │   │   ├── resume/
│   │   │   ├── ai-cover-letter/
│   │   │   ├── interview/
│   │   │   ├── pricing/
│   │   │   ├── schedule-call/
│   │   │   ├── settings/
│   │   │   └── subscription/
│   │   ├── api/             # API routes
│   │   │   ├── auth/
│   │   │   ├── calls/
│   │   │   ├── chat/
│   │   │   ├── resume/
│   │   │   ├── stripe/
│   │   │   ├── subscription/
│   │   │   ├── usage/
│   │   │   └── wallet/
│   │   ├── lib/             # Library utilities
│   │   └── globals.css
│   ├── components/          # React components
│   │   ├── ui/              # UI components
│   │   ├── header.jsx
│   │   ├── hero.jsx
│   │   ├── chatbot.jsx
│   │   └── ...
│   ├── data/                # Static data
│   │   ├── features.js
│   │   ├── faqs.js
│   │   ├── howItWorks.js
│   │   └── industries.js
│   ├── hooks/               # Custom React hooks
│   │   ├── use-fetch.js
│   │   └── useWeb3.js
│   ├── lib/                 # Utility libraries
│   │   ├── prisma.js
│   │   ├── stripe.js
│   │   ├── cloudinary.js
│   │   ├── auth.js
│   │   ├── web3.js
│   │   └── ...
│   ├── auth.js              # NextAuth configuration
│   ├── auth.config.js       # Auth configuration
│   └── middleware.js        # Next.js middleware
├── scripts/                 # Utility scripts
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind CSS configuration
└── README.md               # Project documentation
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **pnpm** (or npm/yarn)
- **Git**

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Team-Potato-Coders.git
   cd Team-Potato-Coders
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in all required environment variables (see [Environment Variables](#environment-variables))

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma migrate dev
   
   # (Optional) Seed the database
   pnpm prisma db seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/uproot?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Resend (Email)
RESEND_API_KEY="your-resend-api-key"

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Web3 (Optional)
WEB3_PROVIDER_URL="your-web3-provider-url"

# PhonePe (Payment Gateway - Optional)
PHONEPE_MERCHANT_ID="your-phonepe-merchant-id"
PHONEPE_SALT_KEY="your-phonepe-salt-key"
PHONEPE_SALT_INDEX="your-phonepe-salt-index"
```

---

## 📖 Usage

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Database Management

```bash
# Create a new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations to production
pnpm prisma migrate deploy

# Open Prisma Studio (Database GUI)
pnpm prisma studio

# Reset database (WARNING: Deletes all data)
pnpm prisma migrate reset
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/reset-password` - Password reset request
- `POST /api/auth/password-reset` - Verify password reset token

### Resume
- `POST /api/resume/upload` - Upload resume file
- `GET /resume/public/[publicLinkId]` - Public resume view

### Subscription
- `GET /api/subscription/current` - Get current subscription
- `POST /api/subscription/web3` - Process Web3 payment
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler
- `POST /api/stripe/verify-session` - Verify Stripe session
- `POST /api/stripe/customer-portal` - Access Stripe customer portal

### Usage
- `GET /api/usage/current` - Get current usage statistics

### Calls
- `POST /api/calls/schedule` - Schedule a call
- `GET /api/calls/logs` - Get call logs

### Chat
- `POST /api/chat` - AI chatbot endpoint

### Wallet
- `POST /api/wallet/link` - Link Web3 wallet

### Contact
- `POST /api/contact-us` - Contact form submission

---

## 🔗 Database Relationships

### One-to-Many Relationships

1. **User → Account** (1:N)
   - One user can have multiple OAuth accounts

2. **User → Session** (1:N)
   - One user can have multiple active sessions

3. **User → Resume** (1:N)
   - One user can create multiple resumes

4. **User → CoverLetter** (1:N)
   - One user can create multiple cover letters

5. **User → Assessment** (1:N)
   - One user can take multiple assessments

6. **User → ScheduledCall** (1:N)
   - One user can schedule multiple calls

7. **User → CallLog** (1:N)
   - One user can have multiple call logs

8. **User → UsageTracking** (1:N)
   - One user can have multiple usage tracking records

9. **Resume → ResumeVersion** (1:N)
   - One resume can have multiple versions

10. **IndustryInsight → User** (1:N)
    - One industry can have multiple users

### One-to-One Relationships

1. **User → Subscription** (1:1)
   - One user has exactly one subscription

2. **ScheduledCall → CallLog** (1:1)
   - One scheduled call generates one call log

### Many-to-Many Relationships

None directly defined, but implemented through junction fields.

### Key Constraints

- **Unique Constraints:**
  - User email (unique)
  - User stripeCustomerId (unique)
  - User walletAddress (unique)
  - Resume publicLinkId (unique)
  - Subscription userId (unique)
  - Subscription stripeSubscriptionId (unique)
  - Account provider + providerAccountId (unique)
  - Session sessionToken (unique)

- **Indexes:**
  - Foreign key fields are indexed for performance
  - Frequently queried fields (status, createdAt, month) are indexed
  - Composite indexes for unique constraints

- **Cascade Deletes:**
  - Account, Session, Subscription, UsageTracking are deleted when User is deleted
  - ResumeVersion is deleted when Resume is deleted

---

## 🧪 Testing

```bash
# Run tests (if implemented)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use TypeScript for type safety
- Follow Next.js best practices
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Team Potato Coders** - NIT Delhi DBMS End Semester Project

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- OpenAI for AI capabilities
- All open-source contributors

---

## 📞 Support

For support, email support@uproot.com or create an issue in the repository.

---

## 🗺 Roadmap

- [ ] Enterprise tier implementation
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] API documentation with Swagger
- [ ] Multi-language support
- [ ] Enhanced Web3 integration
- [ ] Video interview practice
- [ ] LinkedIn integration

---

**Made with ❤️ by Team Potato Coders**
