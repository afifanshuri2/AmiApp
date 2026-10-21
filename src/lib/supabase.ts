import { createClient } from "@supabase/supabase-js";
// Public client configuration. RLS protects the data; this key grants no admin access.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://cxvovxdmhgoyrnfxzkpi.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_GsjPZgWPZrq6YiMY7ASpWw_bZukEcQl";
export const supabase = url && key ? createClient(url, key) : null;
// Supabase Auth owns password hashing, uniqueness, sessions, and rate limits.
// The user only sees a username. These addresses never receive email.
export const usernameEmail = (username: string) =>
  `${username.trim().toLowerCase()}@users.amiapp.invalid`;
