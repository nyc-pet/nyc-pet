import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get("code");
  const tokenHash  = searchParams.get("token_hash");
  const type       = searchParams.get("type") as "magiclink" | "email" | null;
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const supabase = await createClient();

  if (code) {
    // PKCE flow (desktop / standard)
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    // Token-hash flow (mobile email clients)
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
