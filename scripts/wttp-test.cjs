#!/usr/bin/env node

const { wttp } = require('wttp-handler');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Test WTTP site deployment
 * This script tests that the deployed site is accessible and working correctly
 */
async function testWTTPSite() {
    console.log('🧪 Testing WTTP Site Deployment...');
    
    const siteAddress = process.env.WTTP_SITE_ADDRESS;
    
    if (!siteAddress) {
        console.error('❌ WTTP_SITE_ADDRESS not set in environment variables');
        console.log('💡 Deploy the contract first: npm run wttp:deploy-contract');
        process.exit(1);
    }
    
    console.log('📝 Test Configuration:');
    console.log('├── Site Address:', siteAddress);
    console.log('├── Site URL:', `wttp://${siteAddress}/`);
    
    const testCases = [
        { path: '/', description: 'Main index page' },
        { path: '/index.html', description: 'Index HTML file' },
        { path: '/favicon.ico', description: 'Favicon' },
        { path: '/robots.txt', description: 'Robots.txt' }
    ];
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    console.log('\n🔄 Running tests...');
    
    try {
        for (const testCase of testCases) {
            const url = `wttp://${siteAddress}${testCase.path}`;
            
            try {
                console.log(`\n📤 Testing ${testCase.description}...`);
                console.log(`   URL: ${url}`);
                
                const response = await wttp.fetch(url, {
                    method: 'GET',
                    timeout: 10000 // 10 second timeout
                });
                
                if (response.status === 200) {
                    const contentLength = response.headers.get('content-length') || 'unknown';
                    const contentType = response.headers.get('content-type') || 'unknown';
                    
                    console.log(`✅ ${testCase.description} - OK`);
                    console.log(`   Status: ${response.status}`);
                    console.log(`   Content-Type: ${contentType}`);
                    console.log(`   Content-Length: ${contentLength} bytes`);
                    
                    passedTests++;
                } else {
                    console.log(`❌ ${testCase.description} - FAILED`);
                    console.log(`   Status: ${response.status}`);
                    console.log(`   Status Text: ${response.statusText}`);
                }
            } catch (testError) {
                console.log(`❌ ${testCase.description} - ERROR`);
                console.log(`   Error: ${testError.message}`);
            }
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n📊 Test Results:');
        console.log(`├── Passed: ${passedTests}/${totalTests}`);
        console.log(`├── Failed: ${totalTests - passedTests}/${totalTests}`);
        console.log(`├── Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 All tests passed! WTTP site is working correctly.');
            console.log('\n🌐 Your site is live at:');
            console.log(`   wttp://${siteAddress}/`);
            
            console.log('\n📱 Access your site using:');
            console.log('├── WTTP-compatible browsers');
            console.log('├── Browser extensions that support wttp:// protocol');
            console.log('├── WTTP proxy services');
            
        } else {
            console.log('\n⚠️  Some tests failed. Check the deployment and try again.');
            console.log('\n🔧 Troubleshooting:');
            console.log('├── Verify the contract is deployed correctly');
            console.log('├── Check that content was uploaded successfully');
            console.log('├── Ensure the network is accessible');
            console.log('├── Try running: npm run wttp:deploy-content');
        }
        
        return passedTests === totalTests;
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        return false;
    }
}

// Performance test
async function performanceTest() {
    console.log('\n⚡ Running Performance Test...');
    
    const siteAddress = process.env.WTTP_SITE_ADDRESS;
    if (!siteAddress) return;
    
    const url = `wttp://${siteAddress}/`;
    const iterations = 3;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        try {
            const start = Date.now();
            const response = await wttp.fetch(url, { method: 'GET' });
            const end = Date.now();
            
            if (response.status === 200) {
                times.push(end - start);
                console.log(`├── Test ${i + 1}: ${end - start}ms`);
            }
        } catch (error) {
            console.log(`├── Test ${i + 1}: Failed (${error.message})`);
        }
    }
    
    if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        console.log('📊 Performance Results:');
        console.log(`├── Average: ${avg.toFixed(0)}ms`);
        console.log(`├── Fastest: ${min}ms`);
        console.log(`├── Slowest: ${max}ms`);
        
        if (avg < 1000) {
            console.log('✅ Good performance (< 1s average)');
        } else if (avg < 3000) {
            console.log('⚠️  Moderate performance (1-3s average)');
        } else {
            console.log('❌ Slow performance (> 3s average)');
        }
    }
}

// Main execution
async function main() {
    try {
        const basicTestsPassed = await testWTTPSite();
        
        if (basicTestsPassed) {
            await performanceTest();
        }
        
        process.exit(basicTestsPassed ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testWTTPSite, performanceTest };
