import { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../src/server/logic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

  try {
    const { data, error } = await supabase.rpc("cleanup_expired_cache");
    if (error) throw error;
    res.json({ ok: true, deleted: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
