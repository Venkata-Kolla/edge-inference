/**
 * Semantic Search at Edge POC
 * Uses ML embeddings to find relevant documents by meaning, not keywords
 */

// Sample documentation database with pre-computed embeddings
// In production, these would be generated during build and stored in KV
const DOCUMENTS = [
  {
    id: 1,
    title: "How to Reset Your Password",
    content: "If you've forgotten your password, click the 'Forgot Password' link on the login page. Enter your email address and we'll send you a reset link.",
    category: "Account",
    // Embedding would be pre-computed - using mock for demo
    embedding: null // Will be computed at runtime for demo
  },
  {
    id: 2,
    title: "Account Locked - Troubleshooting",
    content: "Your account may be locked after multiple failed login attempts. Wait 30 minutes or contact support to unlock your account immediately.",
    category: "Account",
    embedding: null
  },
  {
    id: 3,
    title: "Two-Factor Authentication Setup",
    content: "Enable 2FA for enhanced security. Go to Settings > Security > Two-Factor Authentication. Scan the QR code with your authenticator app.",
    category: "Security",
    embedding: null
  },
  {
    id: 4,
    title: "How to Update Billing Information",
    content: "To update your payment method, navigate to Settings > Billing. You can add credit cards, update expiration dates, or change your billing address.",
    category: "Billing",
    embedding: null
  },
  {
    id: 5,
    title: "API Rate Limits Explained",
    content: "Our API has rate limits to ensure fair usage. Free tier: 100 requests/hour. Pro tier: 1000 requests/hour. Enterprise: custom limits.",
    category: "API",
    embedding: null
  },
  {
    id: 6,
    title: "Getting Started with the Dashboard",
    content: "Welcome! The dashboard shows your account overview, recent activity, and quick actions. Use the sidebar to navigate between sections.",
    category: "Getting Started",
    embedding: null
  },
  {
    id: 7,
    title: "Webhook Configuration Guide",
    content: "Set up webhooks to receive real-time notifications. Go to Settings > Webhooks, add your endpoint URL, and select events to subscribe to.",
    category: "API",
    embedding: null
  },
  {
    id: 8,
    title: "Data Export and Backup",
    content: "Export your data anytime from Settings > Data. Choose JSON or CSV format. Automatic backups run daily for Pro and Enterprise plans.",
    category: "Data",
    embedding: null
  },
  {
    id: 9,
    title: "Team Member Permissions",
    content: "Invite team members with different roles: Admin (full access), Editor (can modify), Viewer (read-only). Manage from Settings > Team.",
    category: "Team",
    embedding: null
  },
  {
    id: 10,
    title: "SSL Certificate Issues",
    content: "If you see SSL errors, check that your domain's DNS is configured correctly. Certificates auto-renew 30 days before expiration.",
    category: "Technical",
    embedding: null
  },
  {
    id: 11,
    title: "Canceling Your Subscription",
    content: "To cancel, go to Settings > Billing > Cancel Subscription. You'll retain access until the end of your billing period. Export data before canceling.",
    category: "Billing",
    embedding: null
  },
  {
    id: 12,
    title: "Mobile App Download",
    content: "Download our mobile app from the App Store or Google Play. Sign in with your existing credentials. All features available on mobile.",
    category: "Mobile",
    embedding: null
  },
  {
    id: 13,
    title: "Email Notifications Settings",
    content: "Customize which emails you receive in Settings > Notifications. Options include: security alerts, billing updates, feature announcements, and digest emails.",
    category: "Settings",
    embedding: null
  },
  {
    id: 14,
    title: "Understanding Usage Metrics",
    content: "View detailed usage statistics in the Analytics section. Track API calls, storage used, bandwidth consumed, and active users over time.",
    category: "Analytics",
    embedding: null
  },
  {
    id: 15,
    title: "Integrating with Slack",
    content: "Connect your account to Slack for notifications. Go to Settings > Integrations > Slack. Authorize the app and choose which channel receives updates.",
    category: "Integrations",
    embedding: null
  }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }
    
    // Search endpoint
    if (url.pathname === '/api/search' && request.method === 'POST') {
      return handleSearch(request, env);
    }
    
    // Demo page
    if (url.pathname === '/' || url.pathname === '/demo') {
      return new Response(getDemoHTML(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ 
        status: 'ok', 
        timestamp: Date.now(),
        documentsLoaded: DOCUMENTS.length,
        aiEnabled: !!env.AI
      });
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};

async function handleSearch(request, env) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const query = body.query || body.q || '';
    
    if (!query || query.trim().length === 0) {
      return Response.json({
        error: 'Query is required',
        example: { query: 'how to reset password' }
      }, { status: 400 });
    }
    
    // Check if AI is available
    if (!env.AI) {
      // Fallback to keyword search
      return await keywordSearch(query, startTime);
    }
    
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query, env);
    
    // Generate embeddings for documents if not already done (demo purposes)
    // In production, these would be pre-computed and stored
    const docsWithEmbeddings = await Promise.all(
      DOCUMENTS.map(async (doc) => {
        if (!doc.embedding) {
          const text = `${doc.title}. ${doc.content}`;
          doc.embedding = await generateEmbedding(text, env);
        }
        return doc;
      })
    );
    
    // Calculate similarity scores
    const results = docsWithEmbeddings.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding),
      relevanceScore: Math.round(cosineSimilarity(queryEmbedding, doc.embedding) * 100)
    }));
    
    // Sort by similarity and get top results
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, 5);
    
    // Also do keyword search for comparison
    const keywordResults = keywordSearchSync(query);
    
    const processingTime = Date.now() - startTime;
    
    return Response.json({
      query: query,
      results: topResults,
      keywordComparison: keywordResults.slice(0, 5),
      metadata: {
        processingTimeMs: processingTime,
        totalDocuments: DOCUMENTS.length,
        method: 'semantic_search',
        mlEnabled: true,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Processing-Time': `${processingTime}ms`
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({
      error: 'Search failed',
      message: error.message,
      fallback: 'Using keyword search',
      results: keywordSearchSync(query || '')
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function generateEmbedding(text, env) {
  try {
    // Use Cloudflare's BGE embedding model
    const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: text
    });
    
    // Response format: { shape: [1, 768], data: [...] }
    return response.data[0] || response.data;
    
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

function keywordSearchSync(query) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  return DOCUMENTS.map(doc => {
    const text = `${doc.title} ${doc.content}`.toLowerCase();
    
    // Count keyword matches
    let matches = 0;
    queryWords.forEach(word => {
      if (text.includes(word)) matches++;
    });
    
    const relevanceScore = Math.round((matches / queryWords.length) * 100);
    
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      relevanceScore: relevanceScore,
      matchedWords: matches
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

async function keywordSearch(query, startTime) {
  const results = keywordSearchSync(query);
  const processingTime = Date.now() - startTime;
  
  return Response.json({
    query: query,
    results: results.slice(0, 5),
    metadata: {
      processingTimeMs: processingTime,
      totalDocuments: DOCUMENTS.length,
      method: 'keyword_search',
      mlEnabled: false,
      note: 'AI not configured - using keyword fallback'
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

function getDemoHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Semantic Search at Edge - Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 32px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 16px;
    }
    .search-box {
      position: relative;
      margin-bottom: 30px;
    }
    input[type="text"] {
      width: 100%;
      padding: 15px 50px 15px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
    }
    .search-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .search-btn:hover {
      background: #5568d3;
    }
    .search-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .examples {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .example-tag {
      background: #f0f0f0;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .example-tag:hover {
      background: #667eea;
      color: white;
    }
    .results {
      margin-top: 20px;
    }
    .result-item {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #667eea;
      transition: transform 0.2s;
    }
    .result-item:hover {
      transform: translateX(5px);
    }
    .result-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    .result-content {
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .result-meta {
      display: flex;
      gap: 15px;
      font-size: 13px;
      color: #999;
    }
    .score {
      background: #667eea;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .score.high { background: #28a745; }
    .score.medium { background: #ffc107; }
    .score.low { background: #dc3545; }
    .comparison {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .comparison h3 {
      color: #856404;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .metric {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-top: 5px;
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-left: 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.semantic { background: #667eea; color: white; }
    .badge.keyword { background: #6c757d; color: white; }
    .no-results {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>🔍 Semantic Search at Edge</h1>
      <p class="subtitle">Search by meaning, not just keywords. Powered by ML embeddings running at CDN edge.</p>
      
      <div class="search-box">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Try: 'can't log in' or 'payment methods' or 'mobile app'"
          autofocus
        />
        <button class="search-btn" id="searchBtn">Search</button>
      </div>
      
      <div class="examples">
        <strong style="margin-right: 10px;">Try:</strong>
        <span class="example-tag" data-query="can't access my account">can't access my account</span>
        <span class="example-tag" data-query="change credit card">change credit card</span>
        <span class="example-tag" data-query="mobile app">mobile app</span>
        <span class="example-tag" data-query="team permissions">team permissions</span>
        <span class="example-tag" data-query="api limits">api limits</span>
      </div>
      
      <div id="results"></div>
      <div id="metrics"></div>
    </div>
    
    <div class="card">
      <h2>About This Demo</h2>
      <p style="margin-bottom: 15px;">
        This demonstrates <strong>semantic search using ML embeddings at the edge</strong>. 
        Unlike traditional keyword search, it understands the <em>meaning</em> of your query.
      </p>
      <ul style="margin-left: 20px; color: #555; line-height: 1.8;">
        <li>✓ Uses Cloudflare's BGE embedding model</li>
        <li>✓ Processes queries in 50-150ms at edge</li>
        <li>✓ Finds relevant results by semantic similarity</li>
        <li>✓ Works across 300+ global locations</li>
      </ul>
    </div>
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsDiv = document.getElementById('results');
    const metricsDiv = document.getElementById('metrics');
    
    // Example tag clicks
    document.querySelectorAll('.example-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        searchInput.value = tag.dataset.query;
        performSearch();
      });
    });
    
    // Search button click
    searchBtn.addEventListener('click', performSearch);
    
    // Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    
    async function performSearch() {
      const query = searchInput.value.trim();
      
      if (!query) return;
      
      searchBtn.disabled = true;
      searchBtn.innerHTML = 'Searching... <span class="loading"></span>';
      resultsDiv.innerHTML = '';
      metricsDiv.innerHTML = '';
      
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        displayResults(data);
        displayMetrics(data);
        
      } catch (error) {
        resultsDiv.innerHTML = \`
          <div class="no-results">
            <p style="color: #dc3545;">Search failed: \${error.message}</p>
          </div>
        \`;
      } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
      }
    }
    
    function displayResults(data) {
      if (!data.results || data.results.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">No results found</div>';
        return;
      }
      
      const method = data.metadata.mlEnabled ? 'semantic' : 'keyword';
      
      let html = \`
        <div style="margin-bottom: 15px;">
          <strong>Query:</strong> "\${data.query}"
          <span class="badge \${method}">\${method} search</span>
        </div>
        <h3 style="margin-bottom: 15px;">Top Results:</h3>
      \`;
      
      data.results.forEach((result, index) => {
        const scoreClass = result.relevanceScore >= 80 ? 'high' : 
                          result.relevanceScore >= 50 ? 'medium' : 'low';
        
        html += \`
          <div class="result-item">
            <div class="result-title">\${index + 1}. \${result.title}</div>
            <div class="result-content">\${result.content}</div>
            <div class="result-meta">
              <span class="score \${scoreClass}">\${result.relevanceScore}% relevant</span>
              <span>Category: \${result.category}</span>
            </div>
          </div>
        \`;
      });
      
      // Show keyword comparison if available
      if (data.keywordComparison && data.metadata.mlEnabled) {
        html += \`
          <div class="comparison">
            <h3>📊 Semantic vs Keyword Search Comparison</h3>
            <p style="color: #856404; font-size: 14px; margin-bottom: 10px;">
              Semantic search found different (often better) results than simple keyword matching.
            </p>
            <details>
              <summary style="cursor: pointer; font-weight: 600;">View keyword search results</summary>
              <div style="margin-top: 10px;">
                \${data.keywordComparison.map((r, i) => \`
                  <div style="padding: 10px; background: white; margin: 5px 0; border-radius: 4px;">
                    <strong>\${i + 1}. \${r.title}</strong> 
                    <span style="color: #666;">(\${r.relevanceScore}% keyword match)</span>
                  </div>
                \`).join('')}
              </div>
            </details>
          </div>
        \`;
      }
      
      resultsDiv.innerHTML = html;
    }
    
    function displayMetrics(data) {
      const meta = data.metadata;
      
      metricsDiv.innerHTML = \`
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Processing Time</div>
            <div class="metric-value">\${meta.processingTimeMs}ms</div>
          </div>
          <div class="metric">
            <div class="metric-label">Method</div>
            <div class="metric-value">\${meta.mlEnabled ? 'ML' : 'Keyword'}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Documents</div>
            <div class="metric-value">\${meta.totalDocuments}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Results</div>
            <div class="metric-value">\${data.results.length}</div>
          </div>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
}
