import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _service: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!_service) _service = createClient(url, key);
  return _service;
}

export function getAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_anon) _anon = createClient(url, key);
  return _anon;
}
