import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Conversation {
  id: string;
  created_at: string;
  pet_post_id: string;
  sender_id: string;
  receiver_id: string;
  // joined
  pet_post?: PetPost;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
}

export interface PetPost {
  id: string;
  created_at: string;
  name: string | null;
  species: string;
  breed: string | null;
  color: string | null;
  status: "lost" | "found";
  last_seen_address: string;
  description: string | null;
  photo_url: string | null;
  photo_url_2: string | null;
  photo_url_3: string | null;
  photo_url_4: string | null;
  lat: number;
  lng: number;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  reward: string | null;
  approved: boolean;
  user_id: string | null;
}
