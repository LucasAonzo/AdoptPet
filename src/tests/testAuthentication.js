// Test script to verify user authentication functionality
const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const supabaseUrl = 'https://naryyzfncswysrbrzizo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnl5emZuY3N3eXNyYnJ6aXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNzgsImV4cCI6MjA1NjI0MTA3OH0.ZFWy1MGtxvOMmAEytWZQaHYQUwLi_TcqGSVzlNu2LqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials - generate a unique email to avoid collisions
const timestamp = new Date().getTime();
const TEST_USER_EMAIL = `test+${timestamp}@gmail.com`;
const TEST_USER_PASSWORD = 'Password123!';
const TEST_USER_NAME = 'Test User';

// Test functions
const testSignUp = async () => {
  console.log('\n🔍 TESTING USER SIGN UP');
  console.log(`Attempting to create a new user with email: ${TEST_USER_EMAIL}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    
    if (error) {
      console.error('❌ Sign up failed:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ Sign up successful!');
    console.log(`Created user with ID: ${data.user.id}`);
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email: TEST_USER_EMAIL,
        name: TEST_USER_NAME,
      }]);
    
    if (profileError) {
      console.warn('⚠️ User created but profile creation failed:', profileError.message);
    } else {
      console.log('✅ User profile created successfully');
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('❌ Unexpected error during sign up:', error.message);
    return { success: false, error };
  }
};

const testSignIn = async () => {
  console.log('\n🔍 TESTING USER SIGN IN');
  console.log(`Attempting to sign in as ${TEST_USER_EMAIL}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    
    if (error) {
      console.error('❌ Sign in failed:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ Sign in successful!');
    console.log(`Authenticated as: ${data.user.email} (${data.user.id})`);
    console.log('Session token received:', !!data.session.access_token);
    
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('❌ Unexpected error during sign in:', error.message);
    return { success: false, error };
  }
};

const testSessionManagement = async (session) => {
  console.log('\n🔍 TESTING SESSION MANAGEMENT');
  
  try {
    // Test getting user from session
    console.log('Attempting to get user from session...');
    
    // Set the session manually (simulating app startup with existing session)
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Getting user from session failed:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ Successfully retrieved user from session!');
    console.log(`User: ${data.user.email} (${data.user.id})`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error during session test:', error.message);
    return { success: false, error };
  }
};

const testSignOut = async () => {
  console.log('\n🔍 TESTING USER SIGN OUT');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out failed:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ Sign out successful!');
    
    // Verify we can't get the user after signing out
    const { data, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError) {
      console.log('✅ Verified: Unable to get user after sign out (expected)');
    } else if (!data.user) {
      console.log('✅ Verified: No user returned after sign out (expected)');
    } else {
      console.warn('⚠️ Unexpected: User still available after sign out');
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error during sign out:', error.message);
    return { success: false, error };
  }
};

// Main test execution
const runAllTests = async () => {
  console.log('🚀 STARTING AUTHENTICATION TESTS');
  console.log('===============================');
  console.log(`Test User Email: ${TEST_USER_EMAIL}`);
  console.log(`Test User Password: ${TEST_USER_PASSWORD}`);
  console.log('===============================');
  
  // Step 1: Sign Up
  const signUpResult = await testSignUp();
  if (!signUpResult.success) {
    console.log('\n❌ Authentication tests aborted due to sign up failure');
    return;
  }
  
  // Step 2: Sign In
  const signInResult = await testSignIn();
  if (!signInResult.success) {
    console.log('\n❌ Authentication tests aborted due to sign in failure');
    return;
  }
  
  // Step 3: Test Session Management
  const sessionResult = await testSessionManagement(signInResult.session);
  if (!sessionResult.success) {
    console.log('\n❌ Session management test failed');
  }
  
  // Step 4: Sign Out
  const signOutResult = await testSignOut();
  if (!signOutResult.success) {
    console.log('\n❌ Sign out test failed');
  }
  
  console.log('\n===============================');
  console.log('📋 AUTHENTICATION TEST SUMMARY');
  console.log('===============================');
  console.log(`Sign Up: ${signUpResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Sign In: ${signInResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Session Management: ${sessionResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Sign Out: ${signOutResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (signUpResult.success && signInResult.success && sessionResult.success && signOutResult.success) {
    console.log('\n✅ ALL AUTHENTICATION TESTS PASSED!');
    console.log('\nTest User Credentials for future tests:');
    console.log(`Email: ${TEST_USER_EMAIL}`);
    console.log(`Password: ${TEST_USER_PASSWORD}`);
  } else {
    console.log('\n❌ SOME AUTHENTICATION TESTS FAILED');
  }
};

// Run all tests
runAllTests()
  .catch(error => {
    console.error('❌ Test execution failed:', error);
  }); 