#!/usr/bin/env node

/**
 * Kidnector Setup Script
 * Helps initialize the project and verify configuration
 */

const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} (missing: ${filePath})`);
    return false;
  }
}

function checkEnvVar(key, description) {
  // Read from .env file if it exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasVar = envContent.includes(`${key}=`) && !envContent.includes(`${key}=your-`);
    if (hasVar) {
      console.log(`✅ ${description}`);
      return true;
    }
  }
  
  console.log(`❌ ${description} (${key} not configured)`);
  return false;
}

function main() {
  console.log('🚀 Kidnector Setup Check\n');

  // Check required files
  const requiredFiles = [
    ['.env', 'Environment configuration'],
    ['package.json', 'Package configuration'],
    ['src/lib/supabase.ts', 'Supabase client'],
    ['src/lib/AuthContext.tsx', 'Authentication context'],
    ['src/navigation/AppNavigator.tsx', 'Navigation setup'],
  ];

  let allFilesExist = true;
  for (const [file, desc] of requiredFiles) {
    if (!checkFile(path.join(__dirname, file), desc)) {
      allFilesExist = false;
    }
  }

  console.log('');

  // Check environment variables
  const requiredEnvVars = [
    ['EXPO_PUBLIC_SUPABASE_URL', 'Supabase project URL'],
    ['EXPO_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anonymous key'],
  ];

  let allEnvVarsSet = true;
  for (const [envVar, desc] of requiredEnvVars) {
    if (!checkEnvVar(envVar, desc)) {
      allEnvVarsSet = false;
    }
  }

  console.log('');

  // Final status
  if (allFilesExist && allEnvVarsSet) {
    console.log('🎉 Setup looks good! Run "npm start" to launch the app.');
  } else {
    console.log('⚠️  Setup incomplete. Please address the issues above.');
    
    if (!allFilesExist) {
      console.log('\n📁 Missing files should be created from the repository.');
    }
    
    if (!allEnvVarsSet) {
      console.log('\n🔧 To fix environment variables:');
      console.log('   1. Copy .env.example to .env');
      console.log('   2. Fill in your Supabase project credentials');
      console.log('   3. Get these from: https://app.supabase.com/project/your-project/settings/api');
    }
  }

  console.log('\n📚 For full setup instructions, see README.md');
}

main();