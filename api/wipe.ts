import { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../src/server/logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

  try {
    const { data, error } = await supabase.rpc("wipe_cache_older_than", { days: 14 });
    if (error) throw error;
    res.json({ wiped: true, deleted: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
