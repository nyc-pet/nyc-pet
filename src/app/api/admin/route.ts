import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = "rr@rubayath.com";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: `Not admin` }, { status: 401 });
    }

    const { action, postId } = await req.json();

    if (action === "approve") {
      const { error } = await supabase.from("pet_posts").update({ approved: true }).eq("id", postId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const { error } = await supabase.from("pet_posts").delete().eq("id", postId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
