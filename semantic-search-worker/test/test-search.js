/**
 * Test script for Semantic Search API
 * Run with: node test/test-search.js
 */

const BASE_URL = process.env.WORKER_URL || 'http://localhost:8787';

const testQueries = [
  {
    name: 'Account Access Issue',
    query: "can't log in to my account",
    expectedTopics: ['password', 'login', 'account locked'],
    description: 'Should find password reset and account lock articles'
  },
  {
    name: 'Payment Update',
    query: "change my credit card",
    expectedTopics: ['billing', 'payment'],
    description: 'Should find billing information update article'
  },
  {
    name: 'Mobile Access',
    query: "download app for phone",
    expectedTopics: ['mobile', 'app'],
    description: 'Should find mobile app download article'
  },
  {
    name: 'Security Setup',
    query: "make my account more secure",
    expectedTopics: ['2fa', 'security', 'authentication'],
    description: 'Should find two-factor authentication article'
  },
  {
    name: 'API Usage',
    query: "how many API calls can I make",
    expectedTopics: ['rate limit', 'api'],
    description: 'Should find API rate limits article'
  },
  {
    name: 'Team Management',
    query: "add someone to my workspace",
    expectedTopics: ['team', 'permissions', 'invite'],
    description: 'Should find team member permissions article'
  },
  {
    name: 'Data Export',
    query: "backup all my data",
    expectedTopics: ['export', 'backup', 'data'],
    description: 'Should find data export article'
  },
  {
    name: 'Subscription Cancel',
    query: "stop my subscription",
    expectedTopics: ['cancel', 'subscription', 'billing'],
    description: 'Should find subscription cancellation article'
  }
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  console.log(`${'='.repeat(70)}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testCase.query })
    });
    
    const networkLatency = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Display results
    console.log(`\n📊 Results:`);
    console.log(`   Method: ${data.metadata.mlEnabled ? 'Semantic (ML)' : 'Keyword'}`);
    console.log(`   Processing Time: ${data.metadata.processingTimeMs}ms`);
    console.log(`   Network Latency: ${networkLatency}ms`);
    console.log(`   Total Documents: ${data.metadata.totalDocuments}`);
    
    console.log(`\n🎯 Top 3 Results:`);
    data.results.slice(0, 3).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.title}`);
      console.log(`      Relevance: ${result.relevanceScore}%`);
      console.log(`      Category: ${result.category}`);
    });
    
    // Semantic vs Keyword comparison
    if (data.keywordComparison && data.metadata.mlEnabled) {
      console.log(`\n📈 Semantic vs Keyword Comparison:`);
      console.log(`   Semantic #1: ${data.results[0].title} (${data.results[0].relevanceScore}%)`);
      console.log(`   Keyword #1:  ${data.keywordComparison[0].title} (${data.keywordComparison[0].relevanceScore}%)`);
      
      const different = data.results[0].id !== data.keywordComparison[0].id;
      if (different) {
        console.log(`   ✓ Semantic search found different (potentially better) result!`);
      }
    }
    
    // Validation
    const topResult = data.results[0];
    const topResultText = `${topResult.title} ${topResult.content}`.toLowerCase();
    
    let passed = false;
    const foundTopics = [];
    
    for (const topic of testCase.expectedTopics) {
      if (topResultText.includes(topic.toLowerCase())) {
        foundTopics.push(topic);
      }
    }
    
    passed = foundTopics.length > 0;
    
    console.log(`\n✓ Expected topics: ${testCase.expectedTopics.join(', ')}`);
    console.log(`✓ Found topics: ${foundTopics.length > 0 ? foundTopics.join(', ') : 'none'}`);
    console.log(`✓ Test: ${passed ? 'PASS ✅' : 'FAIL ❌'}`);
    
    return {
      name: testCase.name,
      query: testCase.query,
      passed,
      topResult: topResult.title,
      relevance: topResult.relevanceScore,
      processingTime: data.metadata.processingTimeMs,
      networkLatency,
      mlEnabled: data.metadata.mlEnabled
    };
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return {
      name: testCase.name,
      query: testCase.query,
      passed: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Semantic Search Tests');
  console.log(`Target: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const testCase of testQueries) {
    const result = await runTest(testCase);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const failed = results.filter(r => !r.passed && !r.error).length;
  const errors = results.filter(r => r.error).length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Errors: ${errors} ⚠️`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  // Performance metrics
  const validResults = results.filter(r => !r.error && r.processingTime);
  if (validResults.length > 0) {
    const avgProcessing = validResults.reduce((sum, r) => sum + r.processingTime, 0) / validResults.length;
    const avgNetwork = validResults.reduce((sum, r) => sum + r.networkLatency, 0) / validResults.length;
    const avgRelevance = validResults.reduce((sum, r) => sum + r.relevance, 0) / validResults.length;
    
    console.log(`\n⚡ Performance Metrics:`);
    console.log(`   Avg Processing Time: ${avgProcessing.toFixed(2)}ms`);
    console.log(`   Avg Network Latency: ${avgNetwork.toFixed(2)}ms`);
    console.log(`   Avg Relevance Score: ${avgRelevance.toFixed(1)}%`);
    console.log(`   ML Enabled: ${validResults[0].mlEnabled ? 'Yes' : 'No'}`);
  }
  
  // Individual results table
  console.log(`\n📋 Detailed Results:\n`);
  results.forEach(r => {
    const status = r.error ? '⚠️ ' : r.passed ? '✅' : '❌';
    const time = r.processingTime ? `${r.processingTime}ms` : 'N/A';
    const relevance = r.relevance ? `${r.relevance}%` : 'N/A';
    console.log(`${status} ${r.name.padEnd(25)} | ${time.padEnd(8)} | Relevance: ${relevance.padEnd(6)} | ${r.topResult || r.error || 'No result'}`);
  });
  
  console.log('\n');
  
  // Exit with appropriate code
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch(console.error);
