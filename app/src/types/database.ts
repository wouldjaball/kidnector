export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          email: string;
          parent_name: string;
          created_at: string;
          subscription_status: 'trial' | 'active' | 'cancelled';
          subscription_expires_at: string | null;
          timezone: string;
        };
        Insert: {
          id?: string;
          email: string;
          parent_name: string;
          created_at?: string;
          subscription_status?: 'trial' | 'active' | 'cancelled';
          subscription_expires_at?: string | null;
          timezone?: string;
        };
        Update: {
          id?: string;
          email?: string;
          parent_name?: string;
          created_at?: string;
          subscription_status?: 'trial' | 'active' | 'cancelled';
          subscription_expires_at?: string | null;
          timezone?: string;
        };
      };
      children: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          age: number | null;
          avatar: string | null;
          daily_screen_time_minutes: number;
          reminder_time: string;
          current_streak: number;
          longest_streak: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          age?: number | null;
          avatar?: string | null;
          daily_screen_time_minutes?: number;
          reminder_time?: string;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          age?: number | null;
          avatar?: string | null;
          daily_screen_time_minutes?: number;
          reminder_time?: string;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
        };
      };
      affirmations: {
        Row: {
          id: string;
          text: string;
          age_min: number;
          age_max: number;
          category: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          text: string;
          age_min?: number;
          age_max?: number;
          category?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          text?: string;
          age_min?: number;
          age_max?: number;
          category?: string | null;
          is_active?: boolean;
        };
      };
      completions: {
        Row: {
          id: string;
          child_id: string;
          affirmation_id: string | null;
          custom_affirmation_text: string | null;
          recording_url: string | null;
          recording_type: 'audio' | 'video' | null;
          submitted_at: string;
          status: 'pending' | 'approved' | 'redo_requested';
          approved_at: string | null;
          approved_by: string | null;
          screen_time_earned_minutes: number | null;
          date: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          affirmation_id?: string | null;
          custom_affirmation_text?: string | null;
          recording_url?: string | null;
          recording_type?: 'audio' | 'video' | null;
          submitted_at?: string;
          status?: 'pending' | 'approved' | 'redo_requested';
          approved_at?: string | null;
          approved_by?: string | null;
          screen_time_earned_minutes?: number | null;
          date?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          affirmation_id?: string | null;
          custom_affirmation_text?: string | null;
          recording_url?: string | null;
          recording_type?: 'audio' | 'video' | null;
          submitted_at?: string;
          status?: 'pending' | 'approved' | 'redo_requested';
          approved_at?: string | null;
          approved_by?: string | null;
          screen_time_earned_minutes?: number | null;
          date?: string;
        };
      };
      custom_affirmations: {
        Row: {
          id: string;
          family_id: string;
          child_id: string | null;
          text: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          child_id?: string | null;
          text: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          child_id?: string | null;
          text?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      push_tokens: {
        Row: {
          id: string;
          family_id: string;
          token: string;
          device_type: 'ios' | 'android' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          token: string;
          device_type?: 'ios' | 'android' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          token?: string;
          device_type?: 'ios' | 'android' | null;
          created_at?: string;
        };
      };
    };
  };
}
