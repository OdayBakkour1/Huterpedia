# Hunterpedia

**Intelligence. Curated. Real-Time.**

![Hunterpedia Logo](public/HunterPedia%20Png-01.png)

## The Intelligence Edge You Can't Afford to Miss

Hunterpedia is the world's first real-time cybersecurity news aggregator — giving you a unified view of global threats, breaches, and vulnerabilities. Stay ahead of emerging threats with curated intelligence from over 200 trusted sources.

## Key Features

- **Real-Time Aggregation**: Live threat intel from global sources
- **AI-Powered Relevance**: Noise reduction via intelligent filtering
- **200+ Global Sources**: Comprehensive coverage worldwide
- **Threat Actor Tracking**: APT groups and attribution intel
- **CVE Alerts**: Instant vulnerability notifications
- **Analyst Summaries**: Ready-to-use intelligence reports

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: KazaWallet integration
- **AI**: Gemini API for article summarization
- **Deployment**: Vercel (frontend), Supabase (backend)

## Project Structure

```
Hunterpedia/
│
├── src/                  # Main frontend source code
│   ├── components/       # React components (UI, admin, profile, payment, etc.)
│   ├── pages/            # Route-based pages (Checkout, Pricing, Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React context providers (Auth, Theme)
│   ├── utils/            # Utility/helper functions
│   ├── types/            # TypeScript type definitions
│   ├── integrations/     # Supabase client/types
│   └── index.css         # Global styles
│
├── supabase/
│   ├── functions/        # Supabase Edge Functions (backend logic)
│   │   ├── create-payment/
│   │   ├── webhook-handler/
│   │   ├── fetch-news/
│   │   ├── fetch-threat-actors/
│   │   ├── summarize-article/
│   │   └── generate-description/
│   └── migrations/       # Database migrations
│
├── public/               # Static assets
├── package.json          # Project dependencies and scripts
└── ...                   # Config files, etc.
```

## Core Functionality

### For Users

- **Personalized Feed**: Customize your intelligence feed based on sources, categories, and tags
- **AI Summaries**: Get AI-generated summaries of complex articles with one click
- **Bookmarking**: Save important articles for later reference
- **Real-Time Updates**: Automatic feed refreshing with the latest intelligence

### For Admins

- **User Management**: Manage users, roles, and subscriptions
- **Content Management**: Add and manage news sources and articles
- **Analytics Dashboard**: Track system metrics and user engagement
- **Coupon Management**: Create and manage promotional codes

## Subscription Model

- **Free Trial**: 7-day access to all premium features
- **Premium Plan**: $5/month for full access to all features
- **Enterprise**: Custom solutions for organizations (contact us)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/hunterpedia.git
   cd hunterpedia
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Deployment

The application is deployed using Vercel for the frontend and Supabase for the backend services.

### Frontend Deployment

```
npm run build
```

### Backend Deployment

Supabase Edge Functions are deployed using the Supabase CLI:

```
supabase functions deploy <function-name>
```

## Contributing

We welcome contributions to Hunterpedia! Please feel free to submit pull requests or open issues to improve the platform.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact us at contact@hunterpedia.site.

---

Built with ❤️ by the Hunterpedia Team