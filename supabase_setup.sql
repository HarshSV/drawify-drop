-- Run this SQL in your Supabase project SQL Editor (https://supabase.com dashboard)
-- to create the drawings history table.

create table if not exists drawings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  prompt text not null,
  type text not null, -- 'text-to-drawing' or 'improve-drawing'
  original_image_url text, -- Base64 encoded original drawing (null for text-to-drawing)
  improved_image_url text not null -- Base64 encoded generated output drawing
);

-- Enable Row Level Security (RLS)
alter table drawings enable row level security;

-- Create policy to allow anonymous inserts (for the frontend/server actions)
create policy "Allow anonymous inserts" on drawings
  for insert
  with check (true);

-- Create policy to allow anonymous select (to view history)
create policy "Allow anonymous select" on drawings
  for select
  using (true);
