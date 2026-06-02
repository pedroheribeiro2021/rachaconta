import { supabase } from "./client";

export async function ensureAnonymousAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return session;
  }

  const result = await supabase.auth.signInAnonymously();

  if (result.error) {
    throw result.error;
  }

  return result.data.session;
}
