# TCM Tongue Map 🌿

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai" alt="OpenAI">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase">
</p>

<p align="center">
  <b>AI-Powered Traditional Chinese Medicine Tongue Diagnosis</b>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 🌟 Features

### Core Functionality

| Feature | Description | Status |
|---------|-------------|--------|
| **📸 Tongue Photo Analysis** | Upload or capture tongue photos for instant AI-powered diagnosis | ✅ Live |
| **🤖 GPT-4 Vision Integration** | Advanced tongue analysis using OpenAI's GPT-4 Vision model | ✅ Live |
| **🔐 User Authentication** | Secure sign-up/login with email/password via Supabase Auth | ✅ Live |
| **📊 Personal Dashboard** | View and manage your complete scan history | ✅ Live |
| **💾 Scan Persistence** | Save and revisit past tongue analyses (registered users) | ✅ Live |
| **💳 Stripe Integration** | Payment processing ready for future monetization | ✅ Live |

### TCM Diagnostic Features

- **Tongue Zone Analysis**: Detailed assessment of tip (Heart/Lungs), center (Spleen/Stomach), root (Kidneys), and sides (Liver/Gallbladder)
- **Pattern Recognition**: Identifies primary and secondary TCM patterns (Zang Fu, Eight Principles)
- **Coat Analysis**: Color, thickness, and distribution of tongue coating
- **Body Assessment**: Color, shape, and moisture level evaluation
- **Herbal Recommendations**: Traditional formula suggestions based on diagnosis
- **Wellness Advice**: Personalized diet, lifestyle, and habit recommendations
- **Severity Assessment**: Mild, moderate, or significant condition classification

### User Experience

- **Mobile-Optimized**: Responsive design with mobile-first approach
- **Real-time Analysis**: Instant results powered by AI
- **Anonymous Usage**: Try the app without creating an account
- **Persistent History**: Save scans with a free account
- **Beautiful UI**: Modern interface with TCM-inspired color palette

---

## 🎯 Demo

**Live URL**: [https://tcmtonguemap.app](https://tcmtonguemap.app) *(replace with your actual URL)*

### Quick Walkthrough

1. **Homepage**: Upload a tongue photo or capture one with your camera
2. **Analysis**: AI analyzes the image using TCM diagnostic principles
3. **Results**: View detailed breakdown of patterns, zones, and recommendations
4. **Save**: Create an account to save your scan history
5. **Dashboard**: Review past analyses and track changes over time

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **Lucide React** - Icon library

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **OpenAI GPT-4 Vision** - AI tongue analysis
- **Supabase** - Backend-as-a-Service
  - **Auth** - User authentication and session management
  - **PostgreSQL** - Relational database
  - **Storage** - Image file storage
  - **Row Level Security** - Data protection

### Payments
- **Stripe** - Payment processing (test mode ready)
- **@stripe/stripe-js** - Stripe client library

### Development Tools
- **ESLint** - Code linting
- **PostCSS + Autoprefixer** - CSS processing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17.0 or later
- **npm** 9.0.0 or later (or pnpm/yarn)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tcmtonguemap.git
cd tcmtonguemap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings > API** and copy:
   - Project URL
   - Anon/Public API Key
4. Go to **SQL Editor** and run the contents of [`supabase-setup.sql`](./supabase-setup.sql)
5. Go to **Storage** and create a new bucket:
   - Name: `tongue-images`
   - Make it public: Yes
6. Go to **Authentication > Providers** and ensure **Email** is enabled

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# OpenAI API Key (Required for tongue analysis)
# Get yours at: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here

# Supabase Configuration (Required for auth and database)
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (Optional - for payments)
# Get these from your Stripe dashboard
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Required Environment Variables

| Variable | Description | Required | Source |
|----------|-------------|----------|--------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 Vision | ✅ Yes | [OpenAI Dashboard](https://platform.openai.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes | Supabase Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes | Supabase Project Settings > API |

#### Optional Environment Variables

| Variable | Description | Required | Source |
|----------|-------------|----------|--------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | ❌ No | [Stripe Dashboard](https://dashboard.stripe.com) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ❌ No | [Stripe Dashboard](https://dashboard.stripe.com) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | ❌ No | Stripe Developer > Webhooks |
| `NEXT_PUBLIC_APP_URL` | Application base URL | ❌ No | Your domain or localhost |

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
tcmtonguemap/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   └── analyze/        # API route for tongue analysis
│   │   │       └── route.ts
│   │   ├── dashboard/          # Protected user dashboard
│   │   │   └── page.tsx
│   │   ├── login/              # Login page
│   │   │   └── page.tsx
│   │   ├── signup/             # Signup page
│   │   │   └── page.tsx
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/             # React components
│   │   ├── AnalysisResults.tsx # Analysis display component
│   │   ├── AuthProvider.tsx    # Authentication context
│   │   ├── ImageUploader.tsx   # Image upload/capture component
│   │   ├── Navigation.tsx      # Header navigation
│   │   ├── ScanHistory.tsx     # Dashboard scan history
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   └── supabase/           # Supabase clients
│   │       ├── client.ts       # Browser client
│   │       ├── server.ts       # Server client
│   │       └── middleware.ts   # Auth middleware
│   └── middleware.ts           # Next.js middleware (route protection)
├── public/                     # Static assets
├── .env.local.example          # Environment template
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.js           # PostCSS configuration
├── supabase-setup.sql          # Database setup script
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework preset: Next.js

3. **Configure Environment Variables**
   - Add all variables from `.env.local` to Vercel's environment variables
   - Mark `OPENAI_API_KEY` and `STRIPE_SECRET_KEY` as sensitive

4. **Deploy**
   - Vercel will automatically build and deploy your app
   - Each push to `main` branch triggers a new deployment

### Custom Server

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Environment-Specific Notes

- **Production**: Set `NODE_ENV=production`
- **Supabase**: Update your site URL in Supabase Auth settings
- **Stripe**: Use production keys (`sk_live_`, `pk_live_`) for real payments

---

## 🔐 Security

### Data Protection

- **Row Level Security (RLS)** enabled on all database tables
- Users can only access their own scan data
- Secure session management via Supabase SSR
- Protected API routes verify authentication

### Privacy

- Images are stored securely in Supabase Storage
- All data is encrypted at rest and in transit
- Compliant with Privacy Act 1988 (Australian Privacy Principles)
- Users can delete their data at any time

### API Security

- API routes validate authentication tokens
- Rate limiting recommended for production
- Input validation on all endpoints

---

## 🗄️ Database Schema

### `tongue_scans` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to `auth.users` (Supabase Auth) |
| `created_at` | Timestamp | When the scan was created |
| `image_url` | Text | URL to stored tongue image (optional) |
| `primary_pattern` | Text | Main TCM pattern identified |
| `coat` | Text | Tongue coating analysis |
| `color` | Text | Tongue body color |
| `shape` | Text | Tongue shape analysis |
| `moisture` | Text | Moisture level |
| `recommendations` | Text | Wellness recommendations |
| `recommended_formula` | Text | Suggested herbal formula |

### Storage

- **Bucket**: `tongue-images`
- **Public**: Yes (images accessible via URL)
- **Organization**: Images organized by user ID

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Development Guidelines

#### Code Style

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Run `npm run lint` before committing
- Use meaningful variable and function names

#### Component Guidelines

- Use functional components with hooks
- Keep components focused and single-responsibility
- Use Tailwind CSS for styling
- Ensure components are accessible (ARIA labels, keyboard navigation)

#### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(analysis): add support for GPT-4 Turbo model
fix(auth): resolve login redirect issue
docs(readme): update deployment instructions
```

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass and there are no linting errors
3. Update the version numbers if releasing a new version
4. Your PR will be reviewed by maintainers
5. Once approved, your PR will be merged

### Reporting Issues

When reporting issues, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: How to recreate the problem
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**: Browser, OS, Node version

### Feature Requests

We love new ideas! For feature requests:

1. Check if the feature has already been requested
2. Open a new issue with the "feature request" label
3. Describe the feature and its use case
4. Discuss implementation ideas if you have them

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] MVP: Photo upload + AI analysis
- [x] User accounts & authentication
- [x] Personal dashboard with scan history
- [x] Mobile-responsive design

### Phase 2: Enhanced Experience 🚧
- [ ] Detailed PDF reports
- [ ] Progress tracking over time
- [ ] Comparison between scans
- [ ] Dark mode support

### Phase 3: Monetization 💰
- [ ] Premium subscription tier
- [ ] Advanced analysis features
- [ ] Unlimited scan history
- [ ] Priority support

### Phase 4: Ecosystem 🌐
- [ ] E-commerce integration (herbal formulas)
- [ ] Practitioner directory
- [ ] Telehealth consultation booking
- [ ] TCM Clinic Management System

### Phase 5: AI Enhancement 🤖
- [ ] Fine-tuned TCM-specific models
- [ ] Multi-image analysis
- [ ] Predictive health insights
- [ ] Integration with wearable devices

---

## 📜 Disclaimer

**Important**: This application provides educational information only and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult with a qualified TCM practitioner or healthcare provider before making any health-related decisions.

- The AI analysis is based on pattern recognition and should be used as a reference tool only
- Results may vary and should be interpreted by qualified practitioners
- Do not use this app for emergency medical situations
- Seek immediate medical attention for serious health concerns

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 Vision API
- **Supabase** for the excellent backend-as-a-service platform
- **Vercel** for seamless deployment and hosting
- **The TCM Community** for the ancient wisdom of tongue diagnosis
- **Contributors** who help improve this project

---

## 📞 Support

- **Documentation**: [https://docs.tcmtonguemap.app](https://docs.tcmtonguemap.app) *(placeholder)*
- **Issues**: [GitHub Issues](https://github.com/yourusername/tcmtonguemap/issues)
- **Email**: support@tcmtonguemap.app *(placeholder)*
- **Discord**: [Join our community](https://discord.gg/tcmtonguemap) *(placeholder)*

---

<p align="center">
  Made with ❤️ for the TCM community
</p>

<p align="center">
  <a href="https://tcmtonguemap.app">tcmtonguemap.app</a>
</p>
