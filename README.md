# LXLabs Hospitality Training Platform

An AI-powered English conversation practice platform designed specifically for Cambodian hospitality professionals. Master front desk skills through interactive voice training with advanced AI agents.

## 🎯 About This Platform

This platform provides immersive, voice-first English training for hospitality workers in Cambodia. Using cutting-edge AI voice technology, learners practice real-world scenarios they'll encounter at hotel front desks, improving their confidence and professional English skills.

### Key Features

- **Voice-First Learning**: Practice speaking and listening with AI-powered conversation partners
- **Hospitality-Specific Scenarios**: Focus on front desk interactions, guest services, and common hospitality situations
- **Cultural Context**: Training adapted for Cambodian learners with relevant cultural considerations
- **Real-Time Feedback**: Instant pronunciation tips, grammar corrections, and vocabulary guidance
- **Progress Tracking**: Monitor learning progress through interactive step-by-step lessons

## 🚀 Technology Stack

Built with modern web technologies for optimal performance:

- **Next.js 15** - React framework for production
- **Realtime Voice API** - Low-latency voice conversations
- **Agents SDK** - Advanced agent orchestration
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive design
- **Vercel** - Optimized deployment platform

## 🏨 Training Modules

### Front Desk Professional Curriculum

1. **Welcome Guest** 👋 - Greeting guests warmly and professionally
2. **Check Booking** 📋 - Verifying reservations and guest information
3. **Ask for Name** 👤 - Collecting guest details accurately
4. **Request ID** 🆔 - Handling identification verification
5. **Assign Room** 🔑 - Room allocation and key distribution
6. **Share Info** ℹ️ - Providing hotel amenities and local information

### AI Training Partners

- **🎯 Training Coordinator** - Guides learning sessions and provides structured practice
- **👨‍💼 Front Desk Learner** - Role-play as the hotel employee
- **🧳 Hotel Guest** - Various guest personas with different needs and backgrounds
- **📚 Language Coach** - Provides pronunciation and grammar feedback

## 💻 Setup & Installation

### Prerequisites

- Node.js 18+ installed
- API key with realtime voice access

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/khopilot/lxlabs-voice-v1.git
   cd lxlabs-voice-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.sample .env.local
   # Add your API key to .env.local
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎓 How to Use

1. **Start a Session**: Click "Start Session" to begin your training
2. **Choose Mode**: Select between voice activation or push-to-talk
3. **Practice Scenarios**: Engage in realistic front desk conversations
4. **Receive Feedback**: Get real-time tips on pronunciation and grammar
5. **Track Progress**: Monitor completion of training steps
6. **Review Performance**: Use transcript to review and improve

## 🛡️ Safety & Moderation

The platform includes built-in content moderation to ensure:
- Appropriate conversation content
- Professional language standards
- Safe learning environment
- Cultural sensitivity

## 🌐 Deployment

The platform is optimized for deployment on Vercel:

```bash
npm run build
npm start
```

For production deployment, ensure:
- Environment variables are properly configured
- API limits are appropriate for expected usage
- Content delivery network is optimized for your target region

## 🤝 Contributing

This platform is designed specifically for LXLabs hospitality training programs. For questions about customization or enterprise deployment, please contact the LXLabs team.

## 📄 License

MIT License - see LICENSE file for details.

## 🏆 About LXLabs

LXLabs is dedicated to providing innovative training solutions for the hospitality industry in Southeast Asia, combining cutting-edge technology with deep cultural understanding to deliver effective professional development programs.

---

**Built with ❤️ for Cambodian hospitality professionals**
