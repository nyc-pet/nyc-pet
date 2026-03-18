export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { PetPost } from "@/lib/types";
import EditForm from "./EditForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/profile");

  const { data, error } = await supabase.from("pet_posts").select("*").eq("id", id).single();
  if (error || !data) notFound();

  const post = data as PetPost;
  if (post.user_id !== user.id) redirect("/profile");

  return <EditForm post={post} />;
}
