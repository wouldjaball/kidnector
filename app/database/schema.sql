-- =====================================================
-- Kidnector Database Schema
-- Ready to paste into Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Families (parent accounts, linked to Supabase Auth)
CREATE TABLE families (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  parent_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled')),
  subscription_expires_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/Los_Angeles'
);

-- Children
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 1 AND age <= 18),
  avatar TEXT,
  daily_screen_time_minutes INTEGER DEFAULT 60 CHECK (daily_screen_time_minutes >= 0 AND daily_screen_time_minutes <= 480),
  reminder_time TIME DEFAULT '07:00',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affirmations Library (pre-populated)
CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  age_min INTEGER DEFAULT 6,
  age_max INTEGER DEFAULT 12,
  category TEXT CHECK (category IN ('confidence', 'kindness', 'gratitude', 'growth', 'resilience')),
  is_active BOOLEAN DEFAULT true
);

-- Daily Completions
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  affirmation_id UUID REFERENCES affirmations(id),
  custom_affirmation_text TEXT,
  recording_url TEXT,
  recording_type TEXT CHECK (recording_type IN ('audio', 'video')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'redo_requested')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES families(id),
  screen_time_earned_minutes INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Ensure one completion per child per day
  UNIQUE(child_id, date)
);

-- Custom Affirmations (parent-created)
CREATE TABLE custom_affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE, -- NULL = all children
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Notification Tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT CHECK (device_type IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_children_family_id ON children(family_id);
CREATE INDEX idx_completions_child_id ON completions(child_id);
CREATE INDEX idx_completions_date ON completions(date);
CREATE INDEX idx_completions_status ON completions(status);
CREATE INDEX idx_affirmations_active ON affirmations(is_active) WHERE is_active = true;
CREATE INDEX idx_custom_affirmations_family ON custom_affirmations(family_id);
CREATE INDEX idx_push_tokens_family ON push_tokens(family_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;

-- Families: users can only see/edit their own family
CREATE POLICY "Users can view own family" ON families
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own family" ON families
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Children: users can only see/edit their own children
CREATE POLICY "Users can view own children" ON children
  FOR SELECT USING (auth.uid() = family_id);
  
CREATE POLICY "Users can insert own children" ON children
  FOR INSERT WITH CHECK (auth.uid() = family_id);
  
CREATE POLICY "Users can update own children" ON children
  FOR UPDATE USING (auth.uid() = family_id);
  
CREATE POLICY "Users can delete own children" ON children
  FOR DELETE USING (auth.uid() = family_id);

-- Completions: users can see/edit completions for their children
CREATE POLICY "Users can view own completions" ON completions
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE family_id = auth.uid())
  );
  
CREATE POLICY "Users can insert completions for own children" ON completions
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE family_id = auth.uid())
  );
  
CREATE POLICY "Users can update completions for own children" ON completions
  FOR UPDATE USING (
    child_id IN (SELECT id FROM children WHERE family_id = auth.uid())
  );

-- Custom affirmations: users can manage their own
CREATE POLICY "Users can view own custom affirmations" ON custom_affirmations
  FOR SELECT USING (auth.uid() = family_id);
  
CREATE POLICY "Users can insert own custom affirmations" ON custom_affirmations
  FOR INSERT WITH CHECK (auth.uid() = family_id);
  
CREATE POLICY "Users can update own custom affirmations" ON custom_affirmations
  FOR UPDATE USING (auth.uid() = family_id);
  
CREATE POLICY "Users can delete own custom affirmations" ON custom_affirmations
  FOR DELETE USING (auth.uid() = family_id);

-- Push tokens: users can manage their own
CREATE POLICY "Users can view own push tokens" ON push_tokens
  FOR SELECT USING (auth.uid() = family_id);
  
CREATE POLICY "Users can insert own push tokens" ON push_tokens
  FOR INSERT WITH CHECK (auth.uid() = family_id);
  
CREATE POLICY "Users can delete own push tokens" ON push_tokens
  FOR DELETE USING (auth.uid() = family_id);

-- Affirmations: everyone can read active affirmations
CREATE POLICY "Anyone can view active affirmations" ON affirmations
  FOR SELECT USING (is_active = true);

-- =====================================================
-- SEED DATA: Sample Affirmations
-- =====================================================

INSERT INTO affirmations (text, age_min, age_max, category) VALUES
-- Confidence
('I am capable of achieving great things today!', 6, 12, 'confidence'),
('I believe in myself and my abilities.', 6, 12, 'confidence'),
('I am strong, smart, and kind.', 6, 10, 'confidence'),
('My voice matters and I deserve to be heard.', 8, 12, 'confidence'),
('I am proud of who I am becoming.', 6, 12, 'confidence'),

-- Kindness
('I choose to be kind to myself and others today.', 6, 12, 'kindness'),
('My kindness makes the world a better place.', 6, 10, 'kindness'),
('I spread joy and positivity wherever I go.', 6, 12, 'kindness'),
('I am a good friend and I treat others with respect.', 6, 12, 'kindness'),
('I forgive others because holding grudges hurts me.', 8, 12, 'kindness'),

-- Gratitude
('I am grateful for my family who loves me.', 6, 12, 'gratitude'),
('Today I will focus on the good things in my life.', 6, 12, 'gratitude'),
('I appreciate all the blessings in my life, big and small.', 7, 12, 'gratitude'),
('I am thankful for this new day full of possibilities.', 6, 12, 'gratitude'),
('I find joy in the simple things around me.', 6, 10, 'gratitude'),

-- Growth
('Mistakes help me learn and grow stronger.', 6, 12, 'growth'),
('I am not afraid to try new things.', 6, 12, 'growth'),
('Every challenge is an opportunity to grow.', 8, 12, 'growth'),
('I get better every day with practice and patience.', 6, 12, 'growth'),
('My brain grows stronger when I work on hard things.', 6, 12, 'growth'),

-- Resilience
('I can handle hard things because I am resilient.', 7, 12, 'resilience'),
('When things get tough, I get tougher.', 8, 12, 'resilience'),
('I bounce back from setbacks stronger than before.', 8, 12, 'resilience'),
('I am brave enough to face any challenge.', 6, 12, 'resilience'),
('No matter what happens, I will be okay.', 6, 12, 'resilience');

-- =====================================================
-- STORAGE BUCKET
-- Run this in the Supabase Dashboard > Storage
-- =====================================================
-- 
-- 1. Create a bucket named "recordings"
-- 2. Set it to public (for easy playback)
-- 3. Add policy: authenticated users can upload to their own folder
--
-- Example storage policy (paste in Storage > Policies):
--
-- CREATE POLICY "Users can upload own recordings"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'recordings' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );
--
-- CREATE POLICY "Anyone can view recordings"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'recordings');
