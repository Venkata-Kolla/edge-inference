/**
 * Edge Bot Detection POC
 * Analyzes HTTP requests at CDN edge to detect bot-like behavior
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // API endpoint for bot detection
    if (url.pathname === '/api/check') {
      return handleBotCheck(request, env);
    }
    
    // Demo page
    if (url.pathname === '/' || url.pathname === '/demo') {
      return new Response(getDemoHTML(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', timestamp: Date.now() });
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};

async function handleBotCheck(request, env) {
  const startTime = Date.now();
  
  try {
    // Extract request features
    const features = extractRequestFeatures(request);
    
    // Calculate bot score using heuristics
    const heuristicScore = calculateHeuristicScore(features);
    
    // Optional: Enhance with ML model (if Workers AI is configured)
    let mlScore = null;
    let mlEnabled = false;
    
    if (env.AI) {
      mlEnabled = true;
      mlScore = await calculateMLScore(features, env);
    }
    
    // Combine scores (use ML if available, otherwise heuristic)
    const finalScore = mlScore !== null ? mlScore : heuristicScore.score;
    const classification = classifyBot(finalScore);
    
    const processingTime = Date.now() - startTime;
    
    return Response.json({
      botScore: finalScore,
      classification: classification,
      confidence: getConfidence(finalScore),
      features: features,
      scoring: {
        heuristic: heuristicScore,
        ml: mlScore,
        mlEnabled: mlEnabled
      },
      metadata: {
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        edge: true
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'X-Bot-Score': finalScore.toFixed(3),
        'X-Processing-Time': `${processingTime}ms`
      }
    });
    
  } catch (error) {
    return Response.json({
      error: 'Bot detection failed',
      message: error.message
    }, { status: 500 });
  }
}

function extractRequestFeatures(request) {
  const headers = Object.fromEntries(request.headers);
  const url = new URL(request.url);
  
  return {
    userAgent: headers['user-agent'] || '',
    acceptLanguage: headers['accept-language'] || '',
    acceptEncoding: headers['accept-encoding'] || '',
    accept: headers['accept'] || '',
    referer: headers['referer'] || '',
    connection: headers['connection'] || '',
    method: request.method,
    
    // Header analysis
    hasUserAgent: !!headers['user-agent'],
    hasAcceptLanguage: !!headers['accept-language'],
    hasAccept: !!headers['accept'],
    headerCount: Object.keys(headers).length,
    
    // Browser fingerprints
    hasCookies: !!headers['cookie'],
    hasReferer: !!headers['referer'],
    
    // Request characteristics  
    path: url.pathname,
    hasQueryString: url.search.length > 0,
    
    // Additional signals
    cfData: {
      country: headers['cf-ipcountry'] || 'unknown',
      ray: headers['cf-ray'] || 'unknown'
    }
  };
}

function calculateHeuristicScore(features) {
  let score = 0;
  const signals = [];
  
  // User-Agent analysis (30 points)
  if (!features.hasUserAgent) {
    score += 30;
    signals.push({ signal: 'missing_user_agent', weight: 30, reason: 'No User-Agent header' });
  } else {
    const ua = features.userAgent.toLowerCase();
    
    // Known bot patterns
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
      'java', 'http', 'axios', 'postman', 'insomnia'
    ];
    
    if (botPatterns.some(pattern => ua.includes(pattern))) {
      score += 25;
      signals.push({ signal: 'bot_user_agent', weight: 25, reason: 'User-Agent contains bot keywords' });
    }
    
    // Very short or suspicious UA
    if (ua.length < 20) {
      score += 15;
      signals.push({ signal: 'short_user_agent', weight: 15, reason: 'Unusually short User-Agent' });
    }
  }
  
  // Browser headers (25 points)
  if (!features.hasAcceptLanguage) {
    score += 12;
    signals.push({ signal: 'missing_accept_language', weight: 12, reason: 'No Accept-Language header' });
  }
  
  if (!features.hasAccept) {
    score += 13;
    signals.push({ signal: 'missing_accept', weight: 13, reason: 'No Accept header' });
  }
  
  // Header count analysis (15 points)
  if (features.headerCount < 5) {
    score += 15;
    signals.push({ signal: 'few_headers', weight: 15, reason: `Only ${features.headerCount} headers` });
  } else if (features.headerCount > 30) {
    score += 10;
    signals.push({ signal: 'many_headers', weight: 10, reason: `Unusual ${features.headerCount} headers` });
  }
  
  // Browser fingerprints (20 points)
  if (!features.hasCookies) {
    score += 10;
    signals.push({ signal: 'no_cookies', weight: 10, reason: 'No cookies sent' });
  }
  
  if (!features.hasReferer && features.method === 'GET') {
    score += 10;
    signals.push({ signal: 'no_referer', weight: 10, reason: 'No referer on GET request' });
  }
  
  // Encoding analysis (10 points)
  const encoding = features.acceptEncoding.toLowerCase();
  if (!encoding.includes('gzip') && !encoding.includes('deflate')) {
    score += 10;
    signals.push({ signal: 'unusual_encoding', weight: 10, reason: 'No standard compression support' });
  }
  
  // Normalize to 0-1 scale
  const normalizedScore = Math.min(score / 100, 1);
  
  return {
    score: normalizedScore,
    rawScore: score,
    signals: signals,
    signalCount: signals.length
  };
}

async function calculateMLScore(features, env) {
  try {
    // Prepare feature vector for ML model
    const featureText = `
User-Agent: ${features.userAgent}
Accept-Language: ${features.acceptLanguage}
Accept: ${features.accept}
Headers: ${features.headerCount}
Has Cookies: ${features.hasCookies}
Has Referer: ${features.hasReferer}
Method: ${features.method}
`.trim();

    // Use Workers AI for classification
    // Note: This is a simplified example - in production you'd fine-tune a model
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      prompt: `Analyze this HTTP request and determine if it's from a bot or human browser. Reply ONLY with a number between 0 (definitely human) and 1 (definitely bot).

Request details:
${featureText}

Bot probability (0-1):`,
      max_tokens: 10
    });
    
    // Parse the response
    const text = response.response || '';
    const match = text.match(/0?\.\d+|[01]/);
    
    if (match) {
      return parseFloat(match[0]);
    }
    
    return null;
    
  } catch (error) {
    console.error('ML scoring failed:', error);
    return null;
  }
}

function classifyBot(score) {
  if (score >= 0.8) return 'bot_high_confidence';
  if (score >= 0.6) return 'bot_likely';
  if (score >= 0.4) return 'suspicious';
  if (score >= 0.2) return 'human_likely';
  return 'human_high_confidence';
}

function getConfidence(score) {
  // Distance from 0.5 indicates confidence
  const distance = Math.abs(score - 0.5);
  return Math.min(distance * 2, 1);
}

function getDemoHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edge Bot Detection Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 800px;
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
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
    .result {
      margin-top: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .score {
      font-size: 48px;
      font-weight: bold;
      margin: 20px 0;
    }
    .score.human { color: #28a745; }
    .score.suspicious { color: #ffc107; }
    .score.bot { color: #dc3545; }
    .classification {
      font-size: 24px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .metric:last-child {
      border-bottom: none;
    }
    .metric-label {
      font-weight: 600;
      color: #555;
    }
    .metric-value {
      color: #333;
      font-family: 'Courier New', monospace;
    }
    .signals {
      margin-top: 20px;
    }
    .signal-item {
      background: white;
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      border-left: 3px solid #dc3545;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
    .badge.ml { background: #667eea; color: white; }
    .badge.heuristic { background: #6c757d; color: white; }
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
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
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>🤖 Edge Bot Detection Demo</h1>
      <p class="subtitle">Real-time bot detection running at CDN edge</p>
      
      <button onclick="checkBot()" id="checkBtn">
        Analyze This Request
      </button>
      
      <div id="result"></div>
    </div>
    
    <div class="card">
      <h2>About This Demo</h2>
      <p style="margin-bottom: 15px;">
        This proof-of-concept demonstrates bot detection running at the CDN edge using Cloudflare Workers.
        Click the button above to analyze your current request for bot-like behavior.
      </p>
      <ul style="margin-left: 20px; color: #555;">
        <li>✓ Sub-10ms processing latency</li>
        <li>✓ No origin server required</li>
        <li>✓ Heuristic + optional ML scoring</li>
        <li>✓ Runs in 300+ edge locations</li>
      </ul>
    </div>
  </div>

  <script>
    async function checkBot() {
      const btn = document.getElementById('checkBtn');
      const resultDiv = document.getElementById('result');
      
      btn.disabled = true;
      btn.innerHTML = 'Analyzing... <span class="loading"></span>';
      
      try {
        const response = await fetch('/api/check');
        const data = await response.json();
        
        displayResult(data);
      } catch (error) {
        resultDiv.innerHTML = \`<div class="result"><p style="color: #dc3545;">Error: \${error.message}</p></div>\`;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Analyze This Request';
      }
    }
    
    function displayResult(data) {
      const scoreClass = data.botScore >= 0.6 ? 'bot' : data.botScore >= 0.4 ? 'suspicious' : 'human';
      const scoringMethod = data.scoring.mlEnabled ? 'ML-Enhanced' : 'Heuristic';
      
      let signalsHTML = '';
      if (data.scoring.heuristic.signals) {
        signalsHTML = \`
          <div class="signals">
            <strong>Detection Signals (\${data.scoring.heuristic.signalCount}):</strong>
            \${data.scoring.heuristic.signals.map(s => \`
              <div class="signal-item">
                <strong>\${s.signal}</strong> (weight: \${s.weight})
                <br><small>\${s.reason}</small>
              </div>
            \`).join('')}
          </div>
        \`;
      }
      
      document.getElementById('result').innerHTML = \`
        <div class="result">
          <div class="classification" style="color: var(--color)">
            \${data.classification.replace(/_/g, ' ')}
            <span class="badge \${data.scoring.mlEnabled ? 'ml' : 'heuristic'}">\${scoringMethod}</span>
          </div>
          
          <div class="score \${scoreClass}">
            \${(data.botScore * 100).toFixed(1)}%
          </div>
          <p style="color: #666; margin-bottom: 20px;">Bot Probability</p>
          
          <div class="metric">
            <span class="metric-label">Confidence</span>
            <span class="metric-value">\${(data.confidence * 100).toFixed(1)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Processing Time</span>
            <span class="metric-value">\${data.metadata.processingTimeMs}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">User-Agent</span>
            <span class="metric-value">\${data.features.userAgent.substring(0, 50)}...</span>
          </div>
          <div class="metric">
            <span class="metric-label">Headers Sent</span>
            <span class="metric-value">\${data.features.headerCount}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Edge Location</span>
            <span class="metric-value">\${data.features.cfData.country}</span>
          </div>
          
          \${signalsHTML}
          
          <details style="margin-top: 20px;">
            <summary style="cursor: pointer; font-weight: 600; color: #667eea;">View Full Response</summary>
            <pre>\${JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
}
