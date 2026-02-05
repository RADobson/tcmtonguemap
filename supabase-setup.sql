-- TCM Tongue Map Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tongue_scans table
CREATE TABLE IF NOT EXISTS tongue_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  image_url TEXT,
  primary_pattern TEXT NOT NULL,
  coat TEXT,
  color TEXT,
  shape TEXT,
  moisture TEXT,
  recommendations TEXT,
  recommended_formula TEXT
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_tongue_scans_user_id ON tongue_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_tongue_scans_created_at ON tongue_scans(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tongue_scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-runs)
DROP POLICY IF EXISTS "Users can view their own scans" ON tongue_scans;
DROP POLICY IF EXISTS "Users can insert their own scans" ON tongue_scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON tongue_scans;

-- Create RLS policies
-- Users can only view their own scans
CREATE POLICY "Users can view their own scans" ON tongue_scans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert scans for themselves
CREATE POLICY "Users can insert their own scans" ON tongue_scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scans
CREATE POLICY "Users can delete their own scans" ON tongue_scans
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Storage bucket setup for tongue images
-- ============================================

-- Create storage bucket for tongue images
-- Note: Run this in the Supabase Dashboard > Storage > Create a new bucket
-- Bucket name: tongue-images
-- Make it public: Yes (or configure policies below)

-- If you want to use SQL to set up storage policies:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tongue-images', 'tongue-images', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies (run after creating the bucket)
-- DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public read access for tongue images" ON storage.objects;

-- CREATE POLICY "Users can upload their own images" ON storage.objects
--   FOR INSERT
--   WITH CHECK (
--     bucket_id = 'tongue-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Public read access for tongue images" ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'tongue-images');
