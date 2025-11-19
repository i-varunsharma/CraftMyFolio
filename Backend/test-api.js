// Simple test script to check if API is working
const testAPI = async () => {
  try {
    console.log('🧪 Testing API endpoints...\n');
    
    // Test 1: Basic server connection
    console.log('1. Testing server connection...');
    const serverTest = await fetch('http://localhost:5000/api/test');
    const serverData = await serverTest.json();
    console.log('✅ Server:', serverData.message);
    
    // Test 2: Database connection
    console.log('\n2. Testing database connection...');
    const dbTest = await fetch('http://localhost:5000/api/db-test');
    const dbData = await dbTest.json();
    console.log('✅ Database:', dbData.message);
    console.log('📊 User count:', dbData.userCount);
    
    // Test 3: Signup
    console.log('\n3. Testing signup...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const signupResponse = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    
    const signupResult = await signupResponse.json();
    if (signupResponse.ok) {
      console.log('✅ Signup successful:', signupResult.user.email);
      
      // Test 4: Login
      console.log('\n4. Testing login...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password
        })
      });
      
      const loginResult = await loginResponse.json();
      if (loginResponse.ok) {
        console.log('✅ Login successful:', loginResult.user.name);
        console.log('🔑 Token received:', loginResult.token.substring(0, 20) + '...');
      } else {
        console.log('❌ Login failed:', loginResult.message);
      }
    } else {
      console.log('❌ Signup failed:', signupResult.message);
    }
    
    console.log('\n🎉 API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Start backend: cd Backend && npm run dev');
    console.log('2. Check MongoDB connection in .env file');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;