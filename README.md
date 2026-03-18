# Cogniflow Voice — AI Telephony SaaS

White-labeled AI Telephony SaaS platform built on [Smallest.ai Atoms](https://smallest.ai).

## Stack
- **Backend**: Node.js · Express · Prisma · PostgreSQL · TypeScript
- **Frontend**: Next.js 16 · Tailwind CSS · React Query
- **AI Layer**: Smallest.ai Atoms (TTS: `waves_lightning_v3_1` · SLM: `electron` · STT built-in)

## Architecture Pipeline
```
User Phone Call → Smallest.ai Telephony Bridge
  → STT (~150ms)  → LLM/electron (~300ms) → TTS/lightning (~120ms)
  → Webhook → Cogniflow Backend (Express/Prisma)
  → Analytics Dashboard (Next.js)
```
End-to-end latency: **~500–800ms** (TTFA)

## Getting Started

### 1. Backend
```bash
cd backend
cp .env.example .env   # fill in your credentials
npm install
npx prisma db push
npm run dev            # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

### 3. Webhooks (live calls)
```bash
ngrok http 4000
# Paste the HTTPS URL into Smallest.ai Dashboard → Webhooks
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SMALLEST_AI_API_KEY` | Your Smallest.ai API key |
| `SMALLEST_AI_BASE_URL` | `https://atoms-api.smallest.ai/api/v1` |
| `JWT_SECRET` | Secret for signing auth tokens |
| `WEBHOOK_SECRET` | HMAC secret for webhook validation |

## Features
- ✅ JWT Authentication + Organization multi-tenancy
- ✅ Campaign management with CSV contact upload
- ✅ Live outbound calling via Smallest.ai
- ✅ Real-time analytics dashboard
- ✅ Knowledge Base management
- ✅ Webhook ingestion + call log tracking
- ✅ Phone number management
- ✅ Agent templates
- ✅ Cogniflow white-label branding

## License
MIT
