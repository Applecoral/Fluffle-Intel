#🐇 Fluffle Intel

> Transaction intelligence for the MegaETH ecosystem.

Enter a wallet address, get a clear picture of what it's actually doing on-chain.

---

## Overview

Raw transaction data is noise. Fluffle Intel cuts through it by decoding input data and mapping contract addresses to the protocols they belong to.

Instead of `0x5f575529...`, you see **"Swapped on Kumbaya"** or **"Deposited to Teko Finance"**.

---

## Features

- **Transaction Decoding** — Hundreds of function selectors mapped to plain English descriptions
- **Protocol Identification** — Automatic tagging for Kumbaya, Teko Finance, GMX, Prism, and more
- **Terminal Sync** — Pulls rank, points, and season progress from the MegaETH leaderboard
- **Smart Caching** — Supabase-backed cache layer to reduce redundant RPC and API calls

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js / Express |
| Web3 | viem (MegaETH Mainnet RPC) |
| Database | Supabase |
| Animation | Framer Motion |

---

## Getting Started

### Prerequisites

- Node.js v18+
- A Supabase project

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/fluffle-intel.git
cd fluffle-intel

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Open `.env` and fill in the following:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret_string
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key used for server-side cache operations |
| `CRON_SECRET` | Secret string for triggering scheduled cache cleanup |

### Run

```bash
npm run dev
```

---

## How It Works

1. A wallet address is submitted via the UI
2. The Express backend checks Supabase for a cached report
3. On a cache miss, it queries the MegaETH Blockscout API for recent transactions
4. Each transaction is decoded — protocol identified by `to` address, action identified by `input` data
5. The wallet is cross-referenced with the MegaETH Terminal for rank and points
6. Results are returned as a structured intelligence report

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)
