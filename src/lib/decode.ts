import { getSupabase } from "../server/logic.js";

const FOURBYTE_API = 'https://www.4byte.directory/signatures/?format=json&hex=';

export async function lookupSelector(selector: string): Promise<string | null> {
  const clean = selector.toLowerCase().replace('0x', '').slice(0, 8);
  if (clean.length !== 8) return null;
  
  const supabase = getSupabase();
  
  // 1. Check existing Supabase cache for this selector
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('selectors_cache')
        .select('text_signature')
        .eq('selector', `0x${clean}`)
        .single();
        
      if (data && !error) {
        return data.text_signature;
      }
    } catch (e) {
      console.warn("Supabase selector lookup failed:", e);
    }
  }

  // 2. Lookup on 4byte.directory
  try {
    const res = await fetch(`${FOURBYTE_API}${clean}`);
    if (!res.ok) return null;
    const data = await res.json();
    const signature = data.results?.[0]?.text_signature || null;
    
    // 3. Store the result back to Supabase
    if (signature && supabase) {
      try {
        await supabase.from('selectors_cache').upsert({
          selector: `0x${clean}`,
          text_signature: signature,
          cached_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Failed to store selector in Supabase:", e);
      }
    }
    
    return signature;
  } catch {
    return null;
  }
}
