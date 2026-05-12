# 🐇 Fluffle Intel

**Fluffle Intel** is a tactical intelligence layer built for **MegaETH Terminal Season 1**. It's designed to help you decode the chaos of the ecosystem, track the smartest farmers, and optimize your own strategy through clear, interpreted transaction data.

Think of it as your tactical HUD for the MegaETH ecosystem. No more staring at raw hash strings—we turn "0x..." into "Swapped on Kumbaya" or "Deposited to Teko Finance."

---

## ⚡ Core Features

-   **Deep Transaction Decoding**: We map hundreds of smart contract selectors to human-readable sentences.
-   **Protocol Intelligence**: Automatically identifies popular MegaETH protocols like Kumbaya, Teko, GMX, and Prism.
-   **Live Terminal Integration**: Syncs directly with the MegaETH Terminal leaderboard to track points, ranks, and dominant protocols.
-   **Smart Caching**: High-performance caching layer using Supabase to keep intelligence fast and reducing rate-limit friction.
-   **Tactical HUD UI**: A high-contrast, "terminal-aesthetic" interface designed for fast scanning and tactical decision-making.

---

## 🛠 Tech Stack

-   **Frontend**: React 19 + Vite + Tailwind CSS 4.
-   **Backend**: Node.js / Express (Full-stack configuration).
-   **Web3 Connectivity**: `viem` for RPC calls to the MegaETH Mainnet.
-   **Intelligence Layer**: Custom registry for protocol addresses and function selectors.
-   **Database**: Supabase for transaction and profile caching.
-   **Motion**: Framer Motion for that smooth tactical feel.

---

## 🚀 Getting Started

### Prerequisites

You'll need a few environment variables to unlock the full tactical capability:

-   `SUPABASE_URL`: Your Supabase project URL.
-   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for internal caching).
-   `CRON_SECRET`: A secret string for triggering cache cleanup tasks.
-   `GEMINI_API_KEY`: (Optional) For AI-driven transaction interpretation.

### Installation

1.  **Clone it**: Grab the repo.
2.  **Install dependencies**: `npm install`.
3.  **Set up environment**: Copy `.env.example` to `.env` and fill in your keys.
4.  **Launch**: `npm run dev`.

---

## 📖 How it Works

When you enter a wallet address:
1.  **Server-side processing**: Our Express backend checks if we have a fresh report in the Supabase cache.
2.  **Blockscout Discovery**: If not cached, we query the MegaETH Blockscout API for recent activity.
3.  **Decoding Engine**: Every transaction gets passed through our registry. We look at the `to` address to identify the protocol and the `input` data to identify the action.
4.  **Terminal Sync**: We cross-reference the wallet with the MegaETH official terminal to show their current rank and season progress.
5.  **Intelligence Report**: You get a beautiful, interpreted feed of exactly what that whale is doing.

---

## 🎨 Aesthetic

The UI follows a "Tactical Minimalist" philosophy. High information density, monochromatic base with functional blue accents, and mono fonts where they matter. It's built for those who spend their days in the terminal.

---

*Built with ❤️ for the MegaETH Community. See you on the leaderboard.*
