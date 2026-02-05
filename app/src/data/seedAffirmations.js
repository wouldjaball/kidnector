// Seed data for affirmations table
// Run this script once to populate the database with sample affirmations

import { supabase } from '../config/supabase';

const sampleAffirmations = [
  {
    text: "I am kind to my family and friends",
    age_min: 6,
    age_max: 12,
    category: "kindness"
  },
  {
    text: "I am brave and can handle new challenges",
    age_min: 6,
    age_max: 12,
    category: "confidence"
  },
  {
    text: "I am grateful for the people who love me",
    age_min: 6,
    age_max: 12,
    category: "gratitude"
  },
  {
    text: "I learn from my mistakes and keep growing",
    age_min: 7,
    age_max: 12,
    category: "growth"
  },
  {
    text: "I am a good friend who listens and cares",
    age_min: 6,
    age_max: 12,
    category: "kindness"
  },
  {
    text: "I can control my emotions when I'm upset",
    age_min: 8,
    age_max: 12,
    category: "confidence"
  },
  {
    text: "I am thankful for my home and family",
    age_min: 6,
    age_max: 10,
    category: "gratitude"
  },
  {
    text: "I try my best even when things are hard",
    age_min: 7,
    age_max: 12,
    category: "growth"
  },
  {
    text: "I use my words kindly, not to hurt others",
    age_min: 6,
    age_max: 12,
    category: "kindness"
  },
  {
    text: "I believe in myself and my abilities",
    age_min: 8,
    age_max: 12,
    category: "confidence"
  },
  {
    text: "I appreciate the food, toys, and books I have",
    age_min: 6,
    age_max: 10,
    category: "gratitude"
  },
  {
    text: "When I make a mistake, I say sorry and do better",
    age_min: 7,
    age_max: 12,
    category: "growth"
  },
  {
    text: "I help others when they need me",
    age_min: 6,
    age_max: 12,
    category: "kindness"
  },
  {
    text: "I can speak up for what I believe is right",
    age_min: 9,
    age_max: 12,
    category: "confidence"
  },
  {
    text: "I say thank you to people who help me",
    age_min: 6,
    age_max: 10,
    category: "gratitude"
  },
  {
    text: "I keep practicing until I get better at things",
    age_min: 7,
    age_max: 12,
    category: "growth"
  },
  {
    text: "I include others and don't leave anyone out",
    age_min: 7,
    age_max: 12,
    category: "kindness"
  },
  {
    text: "I am proud of the unique person I am",
    age_min: 8,
    age_max: 12,
    category: "confidence"
  },
  {
    text: "I notice the beautiful things around me every day",
    age_min: 6,
    age_max: 12,
    category: "gratitude"
  },
  {
    text: "I ask questions when I don't understand something",
    age_min: 7,
    age_max: 12,
    category: "growth"
  }
];

export async function seedAffirmations() {
  try {
    console.log('Starting to seed affirmations...');
    
    // Check if affirmations already exist
    const { data: existingAffirmations, error: checkError } = await supabase
      .from('affirmations')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing affirmations:', checkError);
      return;
    }
    
    if (existingAffirmations && existingAffirmations.length > 0) {
      console.log('Affirmations already exist, skipping seed');
      return;
    }
    
    // Insert sample affirmations
    const { data, error } = await supabase
      .from('affirmations')
      .insert(sampleAffirmations)
      .select();
    
    if (error) {
      console.error('Error seeding affirmations:', error);
      return;
    }
    
    console.log(`Successfully seeded ${data.length} affirmations!`);
    return data;
    
  } catch (err) {
    console.error('Unexpected error seeding affirmations:', err);
  }
}

// Utility function to get a random affirmation for testing
export async function getRandomAffirmation(age = 8) {
  try {
    const { data, error } = await supabase
      .from('affirmations')
      .select('*')
      .lte('age_min', age)
      .gte('age_max', age)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching affirmations:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No affirmations found for age', age);
      return null;
    }
    
    // Return random affirmation
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
    
  } catch (err) {
    console.error('Error getting random affirmation:', err);
    return null;
  }
}