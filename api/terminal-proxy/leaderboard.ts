import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { limit = 100, offset = 0 } = req.query;
  const targetUrl = `https://terminal.megaeth.com/api/v1/leaderboard?limit=${limit}&offset=${offset}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (response.status === 404) return res.json({ users: [], status: "not_available" });
    if (!response.ok) throw new Error(`Terminal API responded with ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
