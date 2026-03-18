export type PetStatus = "lost" | "found" | "reunited";
export type PetSpecies = "dog" | "cat" | "bird" | "rabbit" | "other";

export interface PetPost {
  id: string;
  created_at: string;
  status: PetStatus;
  species: PetSpecies;
  breed: string | null;
  name: string | null;
  color: string;
  description: string;
  last_seen_date: string;
  last_seen_address: string;
  lat: number;
  lng: number;
  borough: string;
  photo_url: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
}
