# TCM Tongue Map

AI-powered Traditional Chinese Medicine tongue diagnosis app with user authentication.

## Features

- 📸 Upload or capture tongue photos
- 🤖 AI analysis using GPT-4 Vision
- 🌿 Personalized TCM pattern insights
- 💊 Herbal formula recommendations
- 🔐 User authentication with Supabase
- 📊 Personal dashboard with scan history
- 🔗 Affiliate/e-commerce integration ready

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tcmtonguemap
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy:
   - Project URL
   - Anon/Public API Key
3. Go to **SQL Editor** and run the contents of `supabase-setup.sql`
4. Go to **Storage** and create a new bucket called `tongue-images` (make it public)
5. Go to **Authentication > Providers** and ensure Email is enabled

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

Required variables:
- `OPENAI_API_KEY` - Your OpenAI API key (for GPT-4 Vision analysis)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/analyze/    # Protected API route for tongue analysis
│   ├── dashboard/      # User dashboard (protected)
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   └── page.tsx        # Home page
├── components/
│   ├── AuthProvider.tsx    # Auth context provider
│   ├── Navigation.tsx      # Header navigation
│   ├── ImageUploader.tsx   # Image upload component
│   └── AnalysisResults.tsx # Results display
├── lib/
│   └── supabase/
│       ├── client.ts   # Browser Supabase client
│       ├── server.ts   # Server Supabase client
│       └── middleware.ts # Auth middleware
└── middleware.ts       # Next.js middleware for route protection
```

## Authentication Flow

1. **Anonymous Users**: Can analyze tongue photos but results are not saved
2. **Registered Users**: 
   - Scans are automatically saved to their account
   - Access to personal dashboard with scan history
   - View detailed past analyses

## Database Schema

### `tongue_scans` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| created_at | Timestamp | When the scan was created |
| image_url | Text | URL to stored image (optional) |
| primary_pattern | Text | Main TCM pattern identified |
| coat | Text | Tongue coating analysis |
| color | Text | Tongue body color |
| shape | Text | Tongue shape analysis |
| moisture | Text | Moisture level |
| recommendations | Text | Wellness recommendations |
| recommended_formula | Text | Suggested herbal formula |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **TypeScript**: 5
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 Vision
- **Auth & Database**: Supabase
- **Icons**: Lucide React

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Protected API routes verify authentication
- Secure session handling via Supabase SSR

## Roadmap

- [x] MVP: Photo upload + AI analysis
- [x] User accounts & scan history
- [x] Personal dashboard
- [ ] Detailed PDF reports
- [ ] E-commerce integration (Fusion Health, etc.)
- [ ] Practitioner directory (Phase 2)
- [ ] TCM Clinic Management System (Phase 2)

## Disclaimer

This app provides educational information only and is not a substitute for professional medical advice. Always consult with a qualified TCM practitioner or healthcare provider.

## License

MIT
