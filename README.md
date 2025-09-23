This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## CampusCare Documentation

- Architecture: docs/ARCHITECTURE.md
- Tech Stack: docs/TECH_STACK.md
- API Spec: docs/API_SPEC.md
- Database Schema: docs/DB_SCHEMA.md
- Security & Privacy: docs/SECURITY_PRIVACY.md
- Deployment & Costs: docs/DEPLOYMENT_COSTS.md
- Getting Started (near-zero-cost): docs/GETTING_STARTED.md

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### CampusCare Quick Start

1) Copy `.env.example` to `.env.local` and set your Supabase and Gemini keys.
2) (Optional) Apply the minimal schema to Supabase: `supabase/sql/initial.sql` (see `docs/GETTING_STARTED.md`).
3) Start dev server and open `/chat` to try the private-mode chat UI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
