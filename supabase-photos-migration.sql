-- Run this in your Supabase SQL Editor
alter table pet_posts
  add column if not exists photo_url_2 text,
  add column if not exists photo_url_3 text;
