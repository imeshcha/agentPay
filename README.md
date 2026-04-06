# Arc Agent Pay

AI-powered blockchain payment agent built on Arc testnet.
Send USDC payments using plain English chat commands.

## Features
- Connect MetaMask wallet
- Smart account creation (ERC-4337)
- Pay by chat: "Pay 5 USDC to 0x..."
- Save contacts: "Save 0x123 as Alice"
- Pay by name: "Pay 5 USDC to Alice"
- Transaction receipts with ArcScan links

## Tech Stack
- Frontend: Next.js 14, RainbowKit, Tailwind CSS
- Backend: Node.js, Express
- AI: Groq LLM
- Blockchain: Arc Testnet (Chain ID: 5042002)
- Database: Supabase

## Quick Start

### Frontend
cd frontend
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev

### Backend
cd backend
npm install
cp .env.example .env
node index.js

## Environment Variables

### frontend/.env.local
NEXT_PUBLIC_ZERODEV_PROJECT_ID=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

### backend/.env
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SESSION_ENCRYPTION_SECRET=
PORT=4000

## Arc Testnet
- RPC: https://rpc.testnet.arc.network
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com