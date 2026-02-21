/**
 * Test script for bot detection API
 * Run with: node test/test-requests.js
 */

const BASE_URL = process.env.WORKER_URL || 'http://localhost:8787';

const testCases = [
  {
    name: 'Legitimate Chrome Browser',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://google.com/',
      'Cookie': 'session=abc123'
    },
    expectedClassification: 'human',
    expectedScore: '<0.3'
  },
  {
    name: 'Firefox Browser',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    },
    expectedClassification: 'human',
    expectedScore: '<0.4'
  },
  {
    name: 'Obvious Bot - Python Requests',
    headers: {
      'User-Agent': 'python-requests/2.31.0',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': '*/*',
      'Connection': 'keep-alive'
    },
    expectedClassification: 'bot',
    expectedScore: '>0.6'
  },
  {
    name: 'Obvious Bot - Curl',
    headers: {
      'User-Agent': 'curl/8.4.0',
      'Accept': '*/*'
    },
    expectedClassification: 'bot',
    expectedScore: '>0.7'
  },
  {
    name: 'Suspicious - No User Agent',
    headers: {
      'Accept': '*/*'
    },
    expectedClassification: 'bot',
    expectedScore: '>0.5'
  },
  {
    name: 'Suspicious - Minimal Headers',
    headers: {
      'User-Agent': 'Bot'
    },
    expectedClassification: 'suspicious_or_bot',
    expectedScore: '>0.5'
  },
  {
    name: 'Web Scraper',
    headers: {
      'User-Agent': 'ScrapyBot/1.0 (+http://scraper.example.com)',
      'Accept': 'text/html'
    },
    expectedClassification: 'bot',
    expectedScore: '>0.6'
  },
  {
    name: 'Search Engine Bot',
    headers: {
      'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Encoding': 'gzip, deflate'
    },
    expectedClassification: 'bot',
    expectedScore: '>0.5'
  },
  {
    name: 'Mobile Safari',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br'
    },
    expectedClassification: 'human',
    expectedScore: '<0.3'
  },
  {
    name: 'Postman/API Client',
    headers: {
      'User-Agent': 'PostmanRuntime/7.36.0',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br'
    },
    expectedClassification: 'bot',
    expectedScore: '>0.6'
  }
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${testCase.name}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/check`, {
      method: 'GET',
      headers: testCase.headers
    });
    
    const latency = Date.now() - startTime;
    const data = await response.json();
    
    // Display results
    console.log(`\n📊 Results:`);
    console.log(`   Bot Score: ${(data.botScore * 100).toFixed(1)}%`);
    console.log(`   Classification: ${data.classification}`);
    console.log(`   Confidence: ${(data.confidence * 100).toFixed(1)}%`);
    console.log(`   Processing Time: ${data.metadata.processingTimeMs}ms`);
    console.log(`   Network Latency: ${latency}ms`);
    console.log(`   ML Enabled: ${data.scoring.mlEnabled ? 'Yes' : 'No'}`);
    
    // Show detection signals
    if (data.scoring.heuristic.signals && data.scoring.heuristic.signals.length > 0) {
      console.log(`\n🎯 Detection Signals (${data.scoring.heuristic.signalCount}):`);
      data.scoring.heuristic.signals.forEach(signal => {
        console.log(`   - ${signal.signal} (weight: ${signal.weight}): ${signal.reason}`);
      });
    }
    
    // Validation
    const scoreNum = data.botScore;
    let passed = true;
    
    if (testCase.expectedScore.startsWith('>')) {
      const threshold = parseFloat(testCase.expectedScore.substring(1));
      passed = scoreNum > threshold;
      console.log(`\n✓ Expected: ${testCase.expectedScore} → ${passed ? 'PASS' : 'FAIL'}`);
    } else if (testCase.expectedScore.startsWith('<')) {
      const threshold = parseFloat(testCase.expectedScore.substring(1));
      passed = scoreNum < threshold;
      console.log(`\n✓ Expected: ${testCase.expectedScore} → ${passed ? 'PASS' : 'FAIL'}`);
    }
    
    return {
      name: testCase.name,
      passed,
      score: scoreNum,
      classification: data.classification,
      latency: latency,
      processingTime: data.metadata.processingTimeMs
    };
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return {
      name: testCase.name,
      passed: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Bot Detection Tests');
  console.log(`Target: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  // Performance metrics
  const validResults = results.filter(r => !r.error);
  if (validResults.length > 0) {
    const avgLatency = validResults.reduce((sum, r) => sum + r.latency, 0) / validResults.length;
    const avgProcessing = validResults.reduce((sum, r) => sum + r.processingTime, 0) / validResults.length;
    
    console.log(`\n⚡ Performance:`);
    console.log(`   Avg Network Latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`   Avg Processing Time: ${avgProcessing.toFixed(2)}ms`);
    console.log(`   Max Latency: ${Math.max(...validResults.map(r => r.latency))}ms`);
    console.log(`   Min Latency: ${Math.min(...validResults.map(r => r.latency))}ms`);
  }
  
  // Individual results table
  console.log(`\n📋 Detailed Results:\n`);
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    const score = r.score !== undefined ? `${(r.score * 100).toFixed(1)}%` : 'N/A';
    console.log(`${status} ${r.name.padEnd(35)} | Score: ${score.padEnd(8)} | ${r.classification || r.error}`);
  });
  
  console.log('\n');
}

// Run tests
runAllTests().catch(console.error);
