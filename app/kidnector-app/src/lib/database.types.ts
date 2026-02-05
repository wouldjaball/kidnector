export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          email: string
          parent_name: string
          created_at: string
          updated_at: string
          subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_expires_at: string | null
          trial_ends_at: string
          revenucat_customer_id: string | null
          timezone: string
          onboarding_completed: boolean
        }
        Insert: {
          id?: string
          email: string
          parent_name: string
          created_at?: string
          updated_at?: string
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_expires_at?: string | null
          trial_ends_at?: string
          revenucat_customer_id?: string | null
          timezone?: string
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          email?: string
          parent_name?: string
          created_at?: string
          updated_at?: string
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_expires_at?: string | null
          trial_ends_at?: string
          revenucat_customer_id?: string | null
          timezone?: string
          onboarding_completed?: boolean
        }
      }
      children: {
        Row: {
          id: string
          family_id: string
          name: string
          age: number
          avatar: string
          daily_screen_time_minutes: number
          reminder_time: string
          reminder_enabled: boolean
          current_streak: number
          longest_streak: number
          total_completions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          age: number
          avatar?: string
          daily_screen_time_minutes?: number
          reminder_time?: string
          reminder_enabled?: boolean
          current_streak?: number
          longest_streak?: number
          total_completions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          age?: number
          avatar?: string
          daily_screen_time_minutes?: number
          reminder_time?: string
          reminder_enabled?: boolean
          current_streak?: number
          longest_streak?: number
          total_completions?: number
          created_at?: string
          updated_at?: string
        }
      }
      affirmations: {
        Row: {
          id: string
          text: string
          age_min: number
          age_max: number
          category: string
          difficulty: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          text: string
          age_min?: number
          age_max?: number
          category: string
          difficulty?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          text?: string
          age_min?: number
          age_max?: number
          category?: string
          difficulty?: string
          is_active?: boolean
          created_at?: string
        }
      }
      completions: {
        Row: {
          id: string
          child_id: string
          family_id: string
          affirmation_id: string | null
          custom_affirmation_text: string | null
          recording_url: string | null
          recording_type: 'audio' | 'video'
          recording_duration_seconds: number | null
          submitted_at: string
          status: 'pending' | 'approved' | 'redo_requested'
          redo_reason: string | null
          approved_at: string | null
          approved_by: string | null
          screen_time_earned_minutes: number | null
          completion_date: string
        }
        Insert: {
          id?: string
          child_id: string
          family_id: string
          affirmation_id?: string | null
          custom_affirmation_text?: string | null
          recording_url?: string | null
          recording_type?: 'audio' | 'video'
          recording_duration_seconds?: number | null
          submitted_at?: string
          status?: 'pending' | 'approved' | 'redo_requested'
          redo_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          screen_time_earned_minutes?: number | null
          completion_date?: string
        }
        Update: {
          id?: string
          child_id?: string
          family_id?: string
          affirmation_id?: string | null
          custom_affirmation_text?: string | null
          recording_url?: string | null
          recording_type?: 'audio' | 'video'
          recording_duration_seconds?: number | null
          submitted_at?: string
          status?: 'pending' | 'approved' | 'redo_requested'
          redo_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          screen_time_earned_minutes?: number | null
          completion_date?: string
        }
      }
      custom_affirmations: {
        Row: {
          id: string
          family_id: string
          child_id: string | null
          text: string
          is_active: boolean
          use_count: number
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          child_id?: string | null
          text: string
          is_active?: boolean
          use_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          child_id?: string | null
          text?: string
          is_active?: boolean
          use_count?: number
          created_at?: string
        }
      }
      push_tokens: {
        Row: {
          id: string
          family_id: string
          child_id: string | null
          expo_push_token: string
          device_type: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          child_id?: string | null
          expo_push_token: string
          device_type?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          child_id?: string | null
          expo_push_token?: string
          device_type?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_daily_affirmation: {
        Args: { p_child_id: string }
        Returns: { id: string; text: string; category: string }[]
      }
    }
  }
}

// Convenience types
export type Family = Database['public']['Tables']['families']['Row']
export type Child = Database['public']['Tables']['children']['Row']
export type Affirmation = Database['public']['Tables']['affirmations']['Row']
export type Completion = Database['public']['Tables']['completions']['Row']
export type CustomAffirmation = Database['public']['Tables']['custom_affirmations']['Row']
