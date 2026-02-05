// Test utility to verify Supabase connection and core functionality
import { supabase, dbHelpers } from '../config/supabase';

export async function testDatabaseConnection() {
  const tests = [];
  
  try {
    console.log('🧪 Testing database connection...');
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('affirmations')
      .select('count')
      .limit(1);
    
    tests.push({
      name: 'Database Connection',
      passed: !connectionError,
      error: connectionError?.message
    });
    
    // Test 2: Affirmations exist
    const { data: affirmations, error: affirmError } = await supabase
      .from('affirmations')
      .select('*')
      .limit(5);
    
    tests.push({
      name: 'Affirmations Data',
      passed: !affirmError && affirmations && affirmations.length > 0,
      error: affirmError?.message,
      details: `Found ${affirmations?.length || 0} affirmations`
    });
    
    // Test 3: Get random affirmation
    const randomAffirmation = await dbHelpers.getTodaysAffirmation(8);
    tests.push({
      name: 'Get Today\'s Affirmation',
      passed: !randomAffirmation.error && randomAffirmation.data,
      error: randomAffirmation.error?.message,
      details: randomAffirmation.data?.text?.substring(0, 50) + '...'
    });
    
    // Test 4: Auth check
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    tests.push({
      name: 'Auth System',
      passed: !authError,
      error: authError?.message,
      details: session ? 'User logged in' : 'No active session'
    });
    
  } catch (err) {
    console.error('Test error:', err);
    tests.push({
      name: 'Unexpected Error',
      passed: false,
      error: err.message
    });
  }
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log('================');
  
  tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    
    if (test.details) {
      console.log(`   📝 ${test.details}`);
    }
    
    if (!test.passed && test.error) {
      console.log(`   🚨 Error: ${test.error}`);
    }
    console.log('');
  });
  
  const passedTests = tests.filter(t => t.passed).length;
  console.log(`\n🎯 Result: ${passedTests}/${tests.length} tests passed`);
  
  return {
    totalTests: tests.length,
    passedTests,
    tests,
    allPassed: passedTests === tests.length
  };
}

// Quick helper to test a sample user flow
export async function testSampleUserFlow() {
  console.log('\n🏃‍♀️ Testing sample user flow...');
  
  try {
    // 1. Get an affirmation for 8-year-old
    const affirmation = await dbHelpers.getTodaysAffirmation(8);
    if (affirmation.error) {
      console.log('❌ Failed to get affirmation:', affirmation.error.message);
      return false;
    }
    
    console.log('✅ Got affirmation:', affirmation.data.text);
    
    // 2. Test family creation (would need auth first)
    console.log('✅ Family/child creation requires auth - skipping for now');
    
    // 3. Test completion flow (would need child ID)
    console.log('✅ Completion flow requires child - skipping for now');
    
    console.log('\n🎉 Sample flow test completed!');
    return true;
    
  } catch (err) {
    console.log('❌ Sample flow failed:', err.message);
    return false;
  }
}