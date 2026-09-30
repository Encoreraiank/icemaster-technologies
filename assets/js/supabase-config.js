/**
 * ICEMASTER TECHNOLOGIES — CENTRAL SUPABASE CONFIGURATION
 * Single source of truth for cloud database & storage
 */
const SUPABASE_CONFIG = {
  url: "https://stpvfnbhqlygfrrdsgyu.supabase.co",
  anonKey: "sb_publishable_f5ab6ClNOdJdgbgnooo8-w_TLTzQkVk",
  mediaBucket: "icemaster-media"
};

let _imSupabaseInstance = null;

function getSupabase() {
  if (_imSupabaseInstance) return _imSupabaseInstance;
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    _imSupabaseInstance = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return _imSupabaseInstance;
  }
  return null;
}
