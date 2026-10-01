/**
 * Supabase Client Integration & Configuration
 * Provides Supabase client instance with fallback to local WebSocket server sync
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase (configured when user connects their Supabase project)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Helper to subscribe to Supabase table changes if configured
 */
export function subscribeToTableChanges(
  table: string,
  callback: (payload: any) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
