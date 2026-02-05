# TCM Tongue Map

AI-powered Traditional Chinese Medicine tongue diagnosis app.

## Features

- 📸 Upload or capture tongue photos
- 🤖 AI analysis using GPT-4 Vision
- 🌿 Personalized TCM pattern insights
- 💊 Herbal formula recommendations
- 🔗 Affiliate/e-commerce integration ready

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and add your OpenAI API key
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key for tongue analysis

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- OpenAI GPT-4 Vision

## Roadmap

- [x] MVP: Photo upload + AI analysis
- [ ] User accounts & scan history
- [ ] Detailed PDF reports
- [ ] E-commerce integration (Fusion Health, etc.)
- [ ] Practitioner directory (Phase 2)
- [ ] TCM Clinic Management System (Phase 2)

## Disclaimer

This app provides educational information only and is not a substitute for professional medical advice. Always consult with a qualified TCM practitioner or healthcare provider.

## License

MIT
