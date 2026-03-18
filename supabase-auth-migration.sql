-- Run this in your Supabase SQL Editor

-- 1. Add user_id column to pet_posts
alter table pet_posts
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- 2. Drop old open policies
drop policy if exists "Anyone can insert pet posts" on pet_posts;
drop policy if exists "Anyone can update their posts" on pet_posts;

-- 3. Only logged-in users can create posts
create policy "Authenticated users can insert posts"
  on pet_posts for insert
  with check (auth.uid() = user_id);

-- 4. Only the post owner can update their post
create policy "Owner can update their post"
  on pet_posts for update
  using (auth.uid() = user_id);
