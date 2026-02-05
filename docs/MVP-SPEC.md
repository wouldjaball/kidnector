# Kidnector MVP Specification
*Screen time earned through affirmations*

## The One-Liner
Kids complete daily affirmations to unlock screen time. No affirmation = no iPad.

## Target Market
- **Primary:** Moms of kids ages 6-12
- **Pain point:** Daily screen time battles, kids won't get off devices
- **Desire:** Raise confident, emotionally healthy kids without constant fighting

## Revenue Model
- **Price:** $9.99/month per family (annual: $79.99/year)
- **Goal:** 1,000 subscribers = $10k/month
- **Existing audience:** 4,000 email subscribers (Kidnections newsletter)

---

## Core User Flow

### Parent Flow
1. Download app → Create family account
2. Add child(ren) with name + age
3. Set daily screen time allowance (e.g., 60 minutes)
4. Choose affirmation source:
   - Kidnector library (age-appropriate)
   - Custom affirmations
5. Set reminder time (morning recommended)
6. Receive notification when child completes affirmation
7. Approve → Child's screen time unlocks

### Child Flow
1. Get morning notification: "Time to earn your screen time!"
2. Open app → See today's affirmation
3. Record themselves saying it (video or audio)
4. Submit → Wait for parent approval
5. Approved → See countdown timer for earned screen time
6. Streak counter builds daily

---

## MVP Features (7-Day Build)

### Must Have (Day 1-5)
- [ ] Parent account creation (email/password)
- [ ] Add child profile (name, age, avatar selection)
- [ ] Set daily screen time allowance
- [ ] Daily affirmation display (from preset library)
- [ ] Child records audio/video of affirmation
- [ ] Parent receives push notification
- [ ] Parent approves/requests redo
- [ ] Screen time countdown timer for child
- [ ] Streak counter (consecutive days)
- [ ] Basic push notifications

### Nice to Have (Day 6-7)
- [ ] Custom affirmations by parent
- [ ] Multiple children support
- [ ] Streak rewards/badges
- [ ] Weekly parent summary email
- [ ] Share streak to social

### Post-MVP
- [ ] Apple Screen Time API integration (actual device blocking)
- [ ] Sibling leaderboards
- [ ] Affirmation categories (confidence, kindness, gratitude, etc.)
- [ ] Report cards for teachers
- [ ] Family challenges

---

## Technical Architecture

### Stack
- **Frontend:** React Native (Expo) - iOS + Android
- **Backend:** Supabase (Auth, Database, Storage, Push)
- **Payments:** RevenueCat (handles App Store/Play Store subscriptions)
- **Notifications:** Expo Push Notifications

### Database Schema (Supabase)

```sql
-- Families (parent accounts)
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  parent_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'trial', -- trial, active, cancelled
  subscription_expires_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/Los_Angeles'
);

-- Children
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  avatar TEXT,
  daily_screen_time_minutes INTEGER DEFAULT 60,
  reminder_time TIME DEFAULT '07:00',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affirmations Library
CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  age_min INTEGER DEFAULT 6,
  age_max INTEGER DEFAULT 12,
  category TEXT, -- confidence, kindness, gratitude, growth
  is_active BOOLEAN DEFAULT true
);

-- Daily Completions
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  affirmation_id UUID REFERENCES affirmations(id),
  custom_affirmation_text TEXT, -- if parent wrote custom
  recording_url TEXT, -- Supabase Storage URL
  recording_type TEXT, -- 'audio' or 'video'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, approved, redo_requested
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES families(id),
  screen_time_earned_minutes INTEGER,
  date DATE DEFAULT CURRENT_DATE
);

-- Custom Affirmations (parent-created)
CREATE TABLE custom_affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id), -- NULL = all children
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Notification Tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT, -- ios, android
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints (Supabase Edge Functions or direct)

```
POST /auth/signup - Parent creates account
POST /auth/login - Parent/child login
POST /children - Add child to family
GET /children - List family's children
GET /affirmation/today/:childId - Get today's affirmation
POST /completion - Child submits recording
PATCH /completion/:id/approve - Parent approves
PATCH /completion/:id/redo - Parent requests redo
GET /streaks/:childId - Get streak data
GET /family/summary - Weekly summary for parent
```

### File Storage (Supabase Storage)
- Bucket: `recordings`
- Path: `/{family_id}/{child_id}/{date}.mp4` or `.m4a`
- Retention: 30 days (auto-delete old recordings)

---

## Screens (MVP)

### Parent Screens
1. **Onboarding** - Create account, add first child
2. **Dashboard** - Today's status for each child, pending approvals
3. **Child Detail** - Streaks, history, settings for that child
4. **Approval** - Play recording, approve/redo buttons
5. **Settings** - Account, subscription, notifications

### Child Screens
1. **Home** - Today's affirmation, record button, streak counter
2. **Recording** - Camera/mic view, timer, submit button
3. **Waiting** - "Waiting for parent approval" state
4. **Unlocked** - Screen time countdown, celebration animation
5. **Streak** - Calendar view of streak, badges earned

---

## Paywall Strategy

### Free Trial
- 7 days full access
- No credit card required upfront
- Push notification on day 5: "3 days left in your trial!"
- Day 7: Paywall blocks recording submission

### Paywall Placement
- After trial expires → Hard paywall on child's record screen
- "Your trial ended. Subscribe to keep earning screen time!"

### Pricing Display
- Monthly: $9.99/month
- Annual: $79.99/year (save 33%) ← Highlight this
- Use RevenueCat for subscription management

---

## Launch Plan

### Week 1: Build MVP
- Day 1-2: Auth + database + parent onboarding
- Day 3-4: Child recording flow + approval
- Day 5: Streak tracking + notifications
- Day 6: Paywall + RevenueCat integration
- Day 7: Testing + polish

### Week 2: Soft Launch
- Deploy to TestFlight (iOS) + Internal Testing (Android)
- Invite 50 families from email list for beta
- Collect feedback, fix bugs

### Week 3: Landing Page + Pre-Launch
- Landing page live with waitlist
- Email sequence to 4,000 subscribers
- TikTok content creation begins

### Week 4: Public Launch
- App Store + Play Store submission
- Launch email to full list
- TikTok posts go live
- Goal: 250 paid subscribers first month

---

## Success Metrics

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| Downloads | 100 | 1,000 | 5,000 |
| Trial starts | 80 | 800 | 4,000 |
| Paid subscribers | 20 | 250 | 1,000 |
| MRR | $200 | $2,500 | $10,000 |
| Retention (M1) | - | 60% | 70% |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Kids hate it | Make it fun: animations, badges, celebrations |
| Parents forget to approve | Push notifications + auto-approve option |
| Recording issues | Support both audio-only and video |
| App Store rejection | Follow guidelines strictly, no "parental control" claims |
| Low conversion | Test pricing, add annual discount, improve onboarding |

---

## Next Steps
1. ✅ Spec complete
2. [ ] Set up Expo project
3. [ ] Create Supabase project + schema
4. [ ] Build auth + onboarding
5. [ ] Build recording flow
6. [ ] Build approval flow
7. [ ] Add streaks + notifications
8. [ ] Integrate RevenueCat
9. [ ] Landing page
10. [ ] Beta test with 50 families
