import { Session } from "@supabase/supabase-js";
import { supabase } from "./client";

export async function ensureAnonymousAuth(): Promise<Session> {
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

  if (!result.data.session) {
    throw new Error("Anonymous session was not created");
  }

  console.log("anonymous session", result.data.session);

  return result.data.session;
}
