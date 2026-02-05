-- ============================================
-- TCM Tongue Map - Stripe Subscription Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Subscriptions Table
-- Stores Stripe subscription data linked to users
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused')),
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- RLS Policies for subscriptions
-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own subscription
CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- ============================================
-- Daily Scans Table
-- Tracks free tier scan usage (1 scan per day)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scan_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scan_date)
);

-- Enable RLS on daily_scans
ALTER TABLE daily_scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own daily scans" ON daily_scans;
DROP POLICY IF EXISTS "Users can insert own daily scans" ON daily_scans;
DROP POLICY IF EXISTS "Users can update own daily scans" ON daily_scans;

-- RLS Policies for daily_scans
CREATE POLICY "Users can view own daily scans" ON daily_scans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily scans" ON daily_scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily scans" ON daily_scans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for daily scans
CREATE INDEX IF NOT EXISTS idx_daily_scans_user_date ON daily_scans(user_id, scan_date);

-- ============================================
-- Update trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_daily_scans_updated_at ON daily_scans;

-- Create triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_scans_updated_at
  BEFORE UPDATE ON daily_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to create subscription on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, tier)
  VALUES (NEW.id, 'active', 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create free subscription for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- View for subscription status
-- ============================================
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT 
  s.user_id,
  s.status,
  s.tier,
  s.current_period_end,
  s.cancel_at_period_end,
  CASE 
    WHEN s.tier = 'premium' AND s.status = 'active' THEN TRUE
    ELSE FALSE
  END as has_premium,
  CASE 
    WHEN s.tier = 'free' THEN TRUE
    ELSE FALSE
  END as is_free_tier
FROM subscriptions s;

-- ============================================
-- Function to check scan availability
-- ============================================
CREATE OR REPLACE FUNCTION can_user_scan(p_user_id UUID)
RETURNS TABLE(
  can_scan BOOLEAN,
  tier TEXT,
  scans_today INTEGER,
  scans_remaining INTEGER,
  message TEXT
) AS $$
DECLARE
  v_tier TEXT;
  v_scans_today INTEGER;
  v_can_scan BOOLEAN;
  v_message TEXT;
  v_scans_remaining INTEGER;
BEGIN
  -- Get user's tier
  SELECT s.tier INTO v_tier
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  LIMIT 1;
  
  -- Default to free if no subscription found
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;
  
  -- Premium users have unlimited scans
  IF v_tier = 'premium' THEN
    v_can_scan := TRUE;
    v_scans_today := 0;
    v_scans_remaining := -1; -- Unlimited
    v_message := 'Premium - Unlimited scans available';
  ELSE
    -- Free tier: check daily scan count
    SELECT COALESCE(ds.scan_count, 0) INTO v_scans_today
    FROM daily_scans ds
    WHERE ds.user_id = p_user_id
      AND ds.scan_date = CURRENT_DATE;
    
    IF v_scans_today IS NULL THEN
      v_scans_today := 0;
    END IF;
    
    -- Free tier limit: 1 scan per day
    IF v_scans_today < 1 THEN
      v_can_scan := TRUE;
      v_scans_remaining := 1 - v_scans_today;
      v_message := 'Free scan available today';
    ELSE
      v_can_scan := FALSE;
      v_scans_remaining := 0;
      v_message := 'Daily scan limit reached. Upgrade to premium for unlimited scans.';
    END IF;
  END IF;
  
  RETURN QUERY SELECT v_can_scan, v_tier, v_scans_today, v_scans_remaining, v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to record a scan (call this from API)
-- ============================================
CREATE OR REPLACE FUNCTION record_scan(p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  scans_today INTEGER
) AS $$
DECLARE
  v_tier TEXT;
  v_can_scan BOOLEAN;
  v_new_count INTEGER;
BEGIN
  -- Check if user can scan
  SELECT c.can_scan, c.tier INTO v_can_scan, v_tier
  FROM can_user_scan(p_user_id) c;
  
  IF NOT v_can_scan THEN
    RETURN QUERY SELECT FALSE, 'Daily scan limit reached. Upgrade to premium for unlimited scans.', 0;
    RETURN;
  END IF;
  
  -- Premium users don't need to track daily scans
  IF v_tier = 'premium' THEN
    RETURN QUERY SELECT TRUE, 'Scan recorded - Premium user', 0;
    RETURN;
  END IF;
  
  -- Insert or update daily scan count
  INSERT INTO daily_scans (user_id, scan_date, scan_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, scan_date)
  DO UPDATE SET 
    scan_count = daily_scans.scan_count + 1,
    updated_at = NOW()
  RETURNING daily_scans.scan_count INTO v_new_count;
  
  RETURN QUERY SELECT TRUE, 'Scan recorded successfully', v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
