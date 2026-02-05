-- Kidnector Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- FAMILIES (Parent accounts)
-- =============================================
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  parent_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'trial', -- trial, active, cancelled, expired
  subscription_expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  revenucat_customer_id TEXT,
  timezone TEXT DEFAULT 'America/Los_Angeles',
  onboarding_completed BOOLEAN DEFAULT false
);

-- RLS for families
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own family" ON families
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (auth.uid()::text = id::text);

-- =============================================
-- CHILDREN
-- =============================================
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 3 AND age <= 18),
  avatar TEXT DEFAULT 'default', -- avatar identifier
  daily_screen_time_minutes INTEGER DEFAULT 60 CHECK (daily_screen_time_minutes >= 0),
  reminder_time TIME DEFAULT '07:00',
  reminder_enabled BOOLEAN DEFAULT true,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster family lookups
CREATE INDEX idx_children_family_id ON children(family_id);

-- RLS for children
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own children" ON children
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE auth.uid()::text = id::text)
  );

-- =============================================
-- AFFIRMATIONS LIBRARY
-- =============================================
CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  age_min INTEGER DEFAULT 6,
  age_max INTEGER DEFAULT 12,
  category TEXT NOT NULL, -- confidence, kindness, gratitude, growth, courage
  difficulty TEXT DEFAULT 'easy', -- easy, medium, hard (word count/complexity)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed affirmations
INSERT INTO affirmations (text, age_min, age_max, category) VALUES
-- Confidence
('I am capable of doing hard things.', 6, 12, 'confidence'),
('I believe in myself and my abilities.', 6, 12, 'confidence'),
('I am strong, smart, and brave.', 6, 10, 'confidence'),
('My voice matters and deserves to be heard.', 8, 12, 'confidence'),
('I can learn anything I put my mind to.', 6, 12, 'confidence'),
('I am proud of who I am becoming.', 8, 12, 'confidence'),
('I trust myself to make good choices.', 7, 12, 'confidence'),
('I am enough, just as I am.', 6, 12, 'confidence'),
('My mistakes help me learn and grow.', 6, 12, 'confidence'),
('I have unique gifts to share with the world.', 8, 12, 'confidence'),

-- Kindness
('I choose to be kind to others today.', 6, 12, 'kindness'),
('My kindness makes the world a better place.', 6, 12, 'kindness'),
('I treat others the way I want to be treated.', 6, 12, 'kindness'),
('I look for ways to help people around me.', 6, 12, 'kindness'),
('My words have the power to lift others up.', 8, 12, 'kindness'),
('I am a good friend who cares about others.', 6, 10, 'kindness'),
('I spread joy wherever I go.', 6, 10, 'kindness'),
('I forgive others when they make mistakes.', 7, 12, 'kindness'),

-- Gratitude
('I am grateful for my family who loves me.', 6, 12, 'gratitude'),
('I appreciate the good things in my life.', 6, 12, 'gratitude'),
('Today is a gift and I will make the most of it.', 8, 12, 'gratitude'),
('I am thankful for my healthy body.', 6, 12, 'gratitude'),
('I notice and appreciate the little things.', 8, 12, 'gratitude'),
('I am blessed with people who care about me.', 6, 12, 'gratitude'),

-- Growth
('Every day I am getting better and better.', 6, 12, 'growth'),
('I welcome challenges because they help me grow.', 8, 12, 'growth'),
('I am curious and love to learn new things.', 6, 12, 'growth'),
('I don''t have to be perfect to be amazing.', 7, 12, 'growth'),
('When things are hard, I keep trying.', 6, 12, 'growth'),
('I am patient with myself as I learn.', 7, 12, 'growth'),

-- Courage
('I am brave enough to try new things.', 6, 12, 'courage'),
('I face my fears with courage.', 7, 12, 'courage'),
('I can do scary things with a brave heart.', 6, 10, 'courage'),
('I stand up for what is right.', 8, 12, 'courage'),
('Being nervous means I am about to do something brave.', 8, 12, 'courage');

-- =============================================
-- COMPLETIONS (Daily submissions)
-- =============================================
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  affirmation_id UUID REFERENCES affirmations(id),
  custom_affirmation_text TEXT, -- if parent set custom
  recording_url TEXT, -- Supabase Storage path
  recording_type TEXT DEFAULT 'video', -- 'audio' or 'video'
  recording_duration_seconds INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, approved, redo_requested
  redo_reason TEXT, -- if parent requests redo
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES families(id),
  screen_time_earned_minutes INTEGER,
  completion_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(child_id, completion_date) -- One completion per child per day
);

-- Indexes
CREATE INDEX idx_completions_child_id ON completions(child_id);
CREATE INDEX idx_completions_family_id ON completions(family_id);
CREATE INDEX idx_completions_date ON completions(completion_date);
CREATE INDEX idx_completions_status ON completions(status);

-- RLS for completions
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own completions" ON completions
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE auth.uid()::text = id::text)
  );

-- =============================================
-- CUSTOM AFFIRMATIONS (Parent-created)
-- =============================================
CREATE TABLE custom_affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE, -- NULL = all children
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_custom_affirmations_family ON custom_affirmations(family_id);

-- RLS
ALTER TABLE custom_affirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom affirmations" ON custom_affirmations
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE auth.uid()::text = id::text)
  );

-- =============================================
-- PUSH TOKENS
-- =============================================
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE, -- NULL = parent device
  expo_push_token TEXT NOT NULL,
  device_type TEXT, -- ios, android
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(expo_push_token)
);

CREATE INDEX idx_push_tokens_family ON push_tokens(family_id);

-- RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens" ON push_tokens
  FOR ALL USING (
    family_id IN (SELECT id FROM families WHERE auth.uid()::text = id::text)
  );

-- =============================================
-- STREAK HISTORY (for analytics)
-- =============================================
CREATE TABLE streak_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  streak_length INTEGER NOT NULL,
  started_at DATE NOT NULL,
  ended_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_streak_history_child ON streak_history(child_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get today's affirmation for a child
CREATE OR REPLACE FUNCTION get_daily_affirmation(p_child_id UUID)
RETURNS TABLE (
  id UUID,
  text TEXT,
  category TEXT
) AS $$
DECLARE
  v_child_age INTEGER;
  v_family_id UUID;
  v_custom_affirmation RECORD;
BEGIN
  -- Get child's age and family
  SELECT age, family_id INTO v_child_age, v_family_id
  FROM children WHERE children.id = p_child_id;
  
  -- First check for custom affirmation
  SELECT * INTO v_custom_affirmation
  FROM custom_affirmations
  WHERE (child_id = p_child_id OR (child_id IS NULL AND family_id = v_family_id))
    AND is_active = true
  ORDER BY RANDOM()
  LIMIT 1;
  
  IF v_custom_affirmation IS NOT NULL THEN
    RETURN QUERY SELECT 
      v_custom_affirmation.id,
      v_custom_affirmation.text,
      'custom'::TEXT;
    RETURN;
  END IF;
  
  -- Otherwise get from library (seeded random based on date + child_id)
  RETURN QUERY
  SELECT a.id, a.text, a.category
  FROM affirmations a
  WHERE a.is_active = true
    AND a.age_min <= v_child_age
    AND a.age_max >= v_child_age
  ORDER BY md5(p_child_id::text || CURRENT_DATE::text)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak after approval
CREATE OR REPLACE FUNCTION update_streak_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_last_completion DATE;
  v_current_streak INTEGER;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Get the child's last approved completion date (before today)
    SELECT completion_date INTO v_last_completion
    FROM completions
    WHERE child_id = NEW.child_id
      AND status = 'approved'
      AND completion_date < NEW.completion_date
    ORDER BY completion_date DESC
    LIMIT 1;
    
    -- Get current streak
    SELECT current_streak INTO v_current_streak
    FROM children WHERE id = NEW.child_id;
    
    -- Check if streak continues or resets
    IF v_last_completion = NEW.completion_date - 1 THEN
      -- Streak continues
      v_current_streak := v_current_streak + 1;
    ELSE
      -- Streak resets
      v_current_streak := 1;
    END IF;
    
    -- Update child record
    UPDATE children
    SET 
      current_streak = v_current_streak,
      longest_streak = GREATEST(longest_streak, v_current_streak),
      total_completions = total_completions + 1,
      updated_at = NOW()
    WHERE id = NEW.child_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for streak updates
CREATE TRIGGER trigger_update_streak
  AFTER UPDATE ON completions
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_on_approval();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run this in Supabase Dashboard > Storage

-- Create recordings bucket (do this in dashboard):
-- Name: recordings
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: video/mp4, video/quicktime, audio/m4a, audio/mp4

-- Storage policy (run in SQL editor):
-- INSERT INTO storage.policies (bucket_id, name, definition)
-- VALUES (
--   'recordings',
--   'Family can access own recordings',
--   '(bucket_id = ''recordings'' AND auth.uid()::text = (storage.foldername(name))[1])'
-- );
