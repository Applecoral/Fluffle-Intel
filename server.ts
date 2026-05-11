import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy route for MegaETH Etherscan to avoid CORS
  app.get("/api/megaeth-proxy", async (req, res) => {
    const targetUrl = new URL("https://mega.etherscan.io/api");
    
    // Add all query params from the client
    Object.keys(req.query).forEach(key => {
      targetUrl.searchParams.append(key, req.query[key] as string);
    });

    try {
      const response = await fetch(targetUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from MegaETH explorer" });
    }
  });

  // Proxy route for MegaETH Terminal API
  app.get("/api/terminal-proxy/leaderboard", async (req, res) => {
    const { limit = 100, offset = 0 } = req.query;
    // Using terminal.megaeth.com which is verified reachable
    const targetUrl = `https://terminal.megaeth.com/api/v1/leaderboard?limit=${limit}&offset=${offset}`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
      if (response.status === 404) {
        return res.json({ users: [], status: "not_available" });
      }

      if (!response.ok) {
        throw new Error(`Terminal API responded with ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Leaderboard Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from MegaETH leaderboard" });
    }
  });

  // Proxy route for MegaETH Terminal API - User specific
  app.get("/api/terminal-proxy/user/:address", async (req, res) => {
    const { address } = req.params;
    const targetUrl = `https://terminal.megaeth.com/api/v1/user/${address.toLowerCase()}`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (response.status === 404) {
        return res.json({ status: "not_found", points: 0, weekly_points: 0 });
      }

      if (!response.ok) {
        throw new Error(`Terminal API responded with ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Terminal Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from MegaETH terminal" });
    }
  }); 

  // Proxy route for Miniblocks API
  app.get("/api/miniblocks-proxy/address/:address/transactions", async (req, res) => {
    const { address } = req.params;
    // Standard Miniblocks API might be v1 or direct. Let's use lowercased address.
    const targetUrl = `https://miniblocks.io/api/address/${address.toLowerCase()}/transactions`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        console.error(`Miniblocks error: ${response.status} for ${address}`);
        return res.status(response.status).json({ error: "Failed to fetch from Miniblocks", details: await response.text() });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Miniblocks Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from Miniblocks" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
