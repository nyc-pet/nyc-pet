-- Run this in your Supabase SQL Editor at https://supabase.com/dashboard

create table if not exists pet_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  status text check (status in ('lost', 'found', 'reunited')) not null,
  species text check (species in ('dog', 'cat', 'bird', 'rabbit', 'other')) not null,
  breed text,
  name text,
  color text not null,
  description text not null,
  last_seen_date date not null,
  last_seen_address text not null,
  lat numeric(9,6) not null,
  lng numeric(9,6) not null,
  borough text not null,
  photo_url text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text
);

-- Allow anyone to read posts
alter table pet_posts enable row level security;

create policy "Anyone can view pet posts"
  on pet_posts for select using (true);

create policy "Anyone can insert pet posts"
  on pet_posts for insert with check (true);

create policy "Anyone can update their posts"
  on pet_posts for update using (true);

-- Storage bucket for pet photos
insert into storage.buckets (id, name, public)
  values ('pet-photos', 'pet-photos', true)
  on conflict do nothing;

create policy "Anyone can upload pet photos"
  on storage.objects for insert
  with check (bucket_id = 'pet-photos');

create policy "Pet photos are public"
  on storage.objects for select
  using (bucket_id = 'pet-photos');
