# Kidnector MVP - Authentication Flow

## 🎯 Overview

Kidnector is a React Native app that helps children build confidence through daily affirmations while earning screen time. This MVP focuses on a complete authentication and onboarding experience with Supabase backend integration.

## ✨ Features Implemented

### 🔐 Authentication Flow
- **Welcome Screen** - Introduces the app concept and value proposition
- **Email/Password Registration** - Complete signup with validation
- **Email Verification** - Handles email confirmation with resend functionality
- **Login** - Secure sign-in with enhanced error handling
- **7-Day Free Trial** - Automatic trial setup and tracking

### 👨‍👩‍👧‍👦 Family Management
- **Family Profile Creation** - Parent name, email, timezone
- **Child Profile Management** - Add children with names, ages, avatars
- **Onboarding Flow** - Guided introduction to app features

### 🛡️ Security & Validation
- **Robust Input Validation** - Email, password, names, ages
- **Secure Storage** - Uses Expo SecureStore for auth tokens
- **Error Handling** - Comprehensive error messages and user feedback

### 📱 User Experience
- **Loading States** - Activity indicators for all async operations
- **Trial Tracking** - Real-time countdown of remaining trial days
- **Responsive Design** - Works on all device sizes
- **Accessibility** - Proper color contrast and text sizing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Expo CLI
- Supabase account

### Setup

1. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. **Database Setup**
   
   The database schema is already defined in `src/lib/database.types.ts`. You need to create these tables in Supabase:

   ```sql
   -- Families table
   CREATE TABLE families (
     id UUID PRIMARY KEY DEFAULT auth.uid(),
     email TEXT UNIQUE NOT NULL,
     parent_name TEXT NOT NULL,
     subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
     subscription_expires_at TIMESTAMP WITH TIME ZONE,
     trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
     revenucat_customer_id TEXT,
     timezone TEXT DEFAULT 'UTC',
     onboarding_completed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Children table
   CREATE TABLE children (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     family_id UUID REFERENCES families(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
     avatar TEXT DEFAULT '👦',
     daily_screen_time_minutes INTEGER DEFAULT 60,
     reminder_time TEXT DEFAULT '07:00',
     reminder_enabled BOOLEAN DEFAULT TRUE,
     current_streak INTEGER DEFAULT 0,
     longest_streak INTEGER DEFAULT 0,
     total_completions INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE families ENABLE ROW LEVEL SECURITY;
   ALTER TABLE children ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   CREATE POLICY "Users can read own family" ON families FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own family" ON families FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can read own children" ON children FOR SELECT USING (auth.uid() = family_id);
   CREATE POLICY "Users can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = family_id);
   CREATE POLICY "Users can update own children" ON children FOR UPDATE USING (auth.uid() = family_id);
   CREATE POLICY "Users can delete own children" ON children FOR DELETE USING (auth.uid() = family_id);
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
src/
├── lib/
│   ├── AuthContext.tsx      # Authentication state management
│   ├── supabase.ts         # Supabase client and helper functions
│   ├── database.types.ts   # TypeScript types for database
│   └── validation.ts       # Input validation utilities
├── navigation/
│   └── AppNavigator.tsx    # Main navigation logic
└── screens/
    ├── WelcomeScreen.tsx         # App introduction
    ├── SignUpScreen.tsx          # Registration form
    ├── LoginScreen.tsx           # Sign-in form
    ├── EmailVerificationScreen.tsx # Email confirmation
    ├── OnboardingScreen.tsx      # Feature introduction
    ├── ParentDashboardScreen.tsx # Main parent interface
    └── AddChildScreen.tsx        # Child profile creation
```

## 🔧 Key Components

### AuthContext
Manages global authentication state with automatic session handling and family/children data loading.

### Validation System
Comprehensive input validation with TypeScript support:
- Email format validation
- Password strength requirements
- Name length and character validation
- Age range validation

### Trial Management
- Automatic 7-day trial setup on registration
- Real-time trial countdown in UI
- Trial status checking before feature access

### Onboarding Flow
- Welcome screen with feature highlights
- Guided introduction to app concepts
- Completion tracking in database

## 🔒 Security Features

- **Secure Token Storage** - Uses Expo SecureStore
- **Row Level Security** - Database policies ensure data isolation
- **Input Sanitization** - All inputs are validated and sanitized
- **Email Verification** - Required before account activation
- **Password Requirements** - Minimum length, complexity rules

## 📊 Trial System

The app includes a complete 7-day trial system:

- **Automatic Setup** - Trial starts on registration
- **Real-time Tracking** - Dashboard shows remaining days
- **Access Control** - Features can check trial status
- **Upgrade Prompts** - Clear calls-to-action for conversion

## 🎨 Design System

The app follows a consistent design system:

- **Colors**: Primary (#667eea), Success (#4caf50), Warning (#ffc107)
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px grid system
- **Components**: Reusable button and input styles

## 🧪 Testing

To test the authentication flow:

1. **Registration**: Create a new account with valid credentials
2. **Email Verification**: Check email and click verification link
3. **Onboarding**: Complete the guided introduction
4. **Child Management**: Add children to test profile creation
5. **Trial Tracking**: Verify trial countdown displays correctly

## 🚧 Next Steps

Future enhancements for the full MVP:

- **Recording System** - Video/audio affirmation recording
- **Approval Workflow** - Parent review and approval process
- **Screen Time Tracking** - Integration with device controls
- **Push Notifications** - Reminder and achievement notifications
- **Subscription Management** - Payment processing with RevenueCat

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types for all new code
3. Include comprehensive error handling
4. Test authentication flows thoroughly
5. Update this README with any new features

## 📄 License

This project is part of the Kidnector MVP development.