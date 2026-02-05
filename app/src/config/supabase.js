import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://jtaiirdzypgxdytfirer.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YWlpcmR6eXBneGR5dGZpcmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDg0NDIsImV4cCI6MjA4NTgyNDQ0Mn0.1I6fFRUdcR5fKVAiixb3mhV5AGO3wN0eAEJUpA8dv98';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database helper functions
export const dbHelpers = {
  // Family operations
  async createFamily(email, parentName) {
    const { data, error } = await supabase
      .from('families')
      .insert([{ email, parent_name: parentName }])
      .select()
      .single();
    return { data, error };
  },

  async getFamily(userId) {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Children operations
  async addChild(familyId, name, age, avatar) {
    const { data, error } = await supabase
      .from('children')
      .insert([{ 
        family_id: familyId, 
        name, 
        age, 
        avatar,
        daily_screen_time_minutes: 60,
        current_streak: 0 
      }])
      .select()
      .single();
    return { data, error };
  },

  async getChildren(familyId) {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  // Affirmations
  async getTodaysAffirmation(childAge) {
    const { data, error } = await supabase
      .from('affirmations')
      .select('*')
      .lte('age_min', childAge)
      .gte('age_max', childAge)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return { data, error };
  },

  // Completions
  async submitCompletion(childId, affirmationId, recordingUrl, recordingType, earnedMinutes) {
    const { data, error } = await supabase
      .from('completions')
      .insert([{
        child_id: childId,
        affirmation_id: affirmationId,
        recording_url: recordingUrl,
        recording_type: recordingType,
        status: 'pending',
        screen_time_earned_minutes: earnedMinutes
      }])
      .select()
      .single();
    return { data, error };
  },

  async approveCompletion(completionId, approvedBy) {
    const { data, error } = await supabase
      .from('completions')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString(),
        approved_by: approvedBy 
      })
      .eq('id', completionId)
      .select()
      .single();
    return { data, error };
  },

  async requestRedo(completionId) {
    const { data, error } = await supabase
      .from('completions')
      .update({ status: 'redo_requested' })
      .eq('id', completionId)
      .select()
      .single();
    return { data, error };
  },

  // Get today's completion for child
  async getTodaysCompletion(childId) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('completions')
      .select('*, affirmations(*)')
      .eq('child_id', childId)
      .eq('date', today)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    return { data, error };
  },

  // Get pending approvals for family
  async getPendingApprovals(familyId) {
    const { data, error } = await supabase
      .from('completions')
      .select('*, children(name, family_id), affirmations(text)')
      .eq('children.family_id', familyId)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });
    return { data, error };
  },

  // Update streak
  async updateStreak(childId, newStreak) {
    const { data, error } = await supabase
      .from('children')
      .update({ 
        current_streak: newStreak,
        longest_streak: supabase.raw(`GREATEST(longest_streak, ${newStreak})`)
      })
      .eq('id', childId)
      .select()
      .single();
    return { data, error };
  }
};