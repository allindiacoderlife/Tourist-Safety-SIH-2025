// SOS System Test Script
// Run this in your terminal to test the SOS API endpoints

const testSOSSystem = async () => {
  const baseURL = 'http://10.68.145.252:7001/api';
  
  console.log('🚨 Testing SOS System...\n');

  // Test data
  const testSOSData = {
    email: 'test@example.com',
    phone: '+1234567890',
    location: {
      address: '123 Test Street, Test City',
      latitude: 37.7749,
      longitude: -122.4194
    },
    message: 'Test Emergency Alert',
    emergencyType: 'medical',
    priority: 'high'
  };

  try {
    // Test SOS Alert
    console.log('📡 Sending SOS Alert...');
    const response = await fetch(`${baseURL}/sos/alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSOSData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SOS Alert sent successfully!');
      console.log('📋 Response:', result);
      
      if (result.data && result.data.id) {
        console.log('🆔 Alert ID:', result.data.id);
        
        // Test SOS History
        console.log('\n📚 Testing SOS History...');
        const historyResponse = await fetch(`${baseURL}/sos/history?email=${testSOSData.email}`);
        
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          console.log('✅ SOS History retrieved successfully!');
          console.log('📊 History Count:', historyResult.data.length);
        } else {
          console.log('❌ SOS History test failed');
        }
      }
    } else {
      console.log('❌ SOS Alert failed:', result);
    }
  } catch (error) {
    console.error('🔥 Test Error:', error.message);
    console.log('\n📝 Troubleshooting Tips:');
    console.log('1. Make sure backend server is running on port 7001');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Verify network connectivity to 10.68.145.252');
    console.log('4. Ensure SMTP email configuration is set up');
  }
};

// Run the test
testSOSSystem();