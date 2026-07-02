import { createBrowserClient, DEFAULT_COOKIE_OPTIONS } from "@supabase/ssr";

DEFAULT_COOKIE_OPTIONS.maxAge = undefined;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
