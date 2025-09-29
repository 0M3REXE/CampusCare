# CampusCare 🎓💚

A privacy-first, AI-driven mental health platform designed specifically for higher education students. CampusCare provides 24/7 conversational support, peer networking, wellness resources, and early risk detection—all while maintaining strict privacy controls and institutional compliance.

## ✨ Features

### 🤖 AI-Powered Mental Health Support
- **24/7 Conversational AI**: Empathetic chat support powered by Google Gemini
- **Voice & Text Chat**: Browser-based voice interaction with text fallback
- **Privacy Controls**: Toggle between standard and private modes for sensitive conversations
- **Multilingual Support**: Natural language support for diverse student populations
- **Crisis Detection**: Early risk assessment with automatic escalation to counselors

### 👥 Peer Social Networking
- **Smart Matching**: AI-powered peer matching based on interests and compatibility
- **Safe Spaces**: Moderated peer-to-peer conversations and support groups
- **Interest-Based Communities**: Connect with students sharing similar experiences
- **Real-time Messaging**: Secure, encrypted peer communications

### 📚 Wellness Media Hub
- **Curated Content**: Mindfulness videos, guided meditations, and wellness resources
- **AI Recommendations**: Personalized content suggestions based on mood and needs
- **Accessibility Features**: Subtitles, translations, and screen reader support
- **Progress Tracking**: Monitor engagement with wellness activities

### 📊 Institutional Insights (Admin)
- **Privacy-Preserved Analytics**: Aggregate insights without compromising individual privacy
- **Risk Trend Monitoring**: Early warning systems for campus mental health trends
- **Resource Utilization**: Track effectiveness of support programs
- **Compliance Reporting**: FERPA and HIPAA-compliant data handling

## 🛠️ Technologies Used

### Frontend & UI
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Modern component library
- **Chart.js** - Data visualization for dashboards
- **Lucide Icons** - Beautiful, consistent iconography

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL 15 with pgvector for embeddings
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions for live features
  - Authentication and authorization
- **Vercel** - Serverless deployment platform
- **Node.js Runtime** - Server-side JavaScript execution

### AI & Machine Learning
- **Google Gemini 1.5 Flash** - Conversational AI and text generation
- **Google Text Embeddings 004** - Semantic search and matching
- **pgvector** - Vector similarity search in PostgreSQL
- **Custom Risk Assessment** - Rule-based mental health risk evaluation

### Voice & Communication
- **Web Speech API** - Browser-native speech-to-text/text-to-speech
- **Vapi Integration** - Professional voice AI (optional upgrade)
- **Real-time Messaging** - WebSocket-based live chat

### Privacy & Security
- **Row Level Security (RLS)** - Database-level access control
- **End-to-End Privacy** - Private mode with no persistent storage
- **FERPA/HIPAA Compliance** - Educational and health data protection
- **JWT Authentication** - Secure session management

## 📋 Documentation

- [🏗️ Architecture](docs/ARCHITECTURE.md) - System design and data flows
- [⚡ Tech Stack](docs/TECH_STACK.md) - Detailed technology breakdown
- [🔌 API Specification](docs/API_SPEC.md) - REST API documentation
- [🗄️ Database Schema](docs/DB_SCHEMA.md) - Data model and relationships
- [🔒 Security & Privacy](docs/SECURITY_PRIVACY.md) - Compliance and data protection
- [🚀 Deployment Guide](docs/DEPLOYMENT_COSTS.md) - Hosting and cost optimization
- [⚡ Quick Start](docs/GETTING_STARTED.md) - Developer setup guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account (free tier)
- Google AI API key (free tier available)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/0M3REXE/CampusCare.git
   cd CampusCare
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `GEMINI_API_KEY` - Google AI API key

4. **Set up database schema**
   ```bash
   # Apply the initial schema to your Supabase project
   # See docs/GETTING_STARTED.md for detailed instructions
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000) and try the `/chat` endpoint for AI conversations.

## 🏥 Mental Health & Crisis Resources

CampusCare is designed to complement, not replace, professional mental health services. If you or someone you know is in crisis:

- **Emergency**: Call 911 or go to your nearest emergency room
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988
- **Campus Counseling**: Contact your institution's counseling center

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## 💬 Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/0M3REXE/CampusCare/issues)
- 💡 [Discussions](https://github.com/0M3REXE/CampusCare/discussions)

---

Built with ❤️ for student mental health and wellbeing.
