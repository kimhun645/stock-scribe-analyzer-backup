// Test script for Firebase Authentication integration
// Run with: node test-firebase-auth.js

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from './src/lib/firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test credentials (replace with actual test user)
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

async function testFirebaseAuth() {
  try {
    console.log('🧪 Testing Firebase Authentication...');
    
    // Test 1: Sign in with Firebase
    console.log('\n1. Testing Firebase Sign In...');
    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;
    console.log('✅ Firebase sign in successful:', user.email);
    
    // Test 2: Get Firebase ID Token
    console.log('\n2. Testing Firebase ID Token...');
    const idToken = await user.getIdToken();
    console.log('✅ Firebase ID Token obtained:', idToken.substring(0, 20) + '...');
    
    // Test 3: Test Backend API with Firebase ID Token
    console.log('\n3. Testing Backend API with Firebase ID Token...');
    const API_BASE_URL = 'http://localhost:3001/api';
    
    const response = await fetch(`${API_BASE_URL}/firebase-auth-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ idToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API test successful:', data);
    } else {
      const error = await response.text();
      console.log('❌ Backend API test failed:', error);
    }
    
    // Test 4: Test protected endpoint
    console.log('\n4. Testing protected endpoint...');
    const protectedResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    if (protectedResponse.ok) {
      const products = await protectedResponse.json();
      console.log('✅ Protected endpoint test successful, products count:', products.length);
    } else {
      const error = await protectedResponse.text();
      console.log('❌ Protected endpoint test failed:', error);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFirebaseAuth();
