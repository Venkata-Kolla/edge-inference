# Integration Examples

How to integrate bot detection into your existing applications.

## Client-Side Integration

### JavaScript Fetch

```javascript
// Check if current request is from a bot
async function checkIfBot() {
  try {
    const response = await fetch('https://your-worker.dev/api/check');
    const data = await response.json();
    
    if (data.botScore > 0.6) {
      console.warn('High bot probability:', data.botScore);
      // Take action: show CAPTCHA, rate limit, etc.
      showCaptcha();
    }
    
    return data;
  } catch (error) {
    console.error('Bot check failed:', error);
    // Fail open - allow request if check fails
    return null;
  }
}

// Use in your app
checkIfBot().then(result => {
  if (result && result.classification === 'bot_high_confidence') {
    // Block or challenge
    document.getElementById('submit-btn').disabled = true;
    alert('Automated requests are not allowed');
  }
});
```

### React Hook

```javascript
import { useState, useEffect } from 'react';

function useBotDetection(endpoint = 'https://your-worker.dev/api/check') {
  const [botScore, setBotScore] = useState(null);
  const [isBot, setIsBot] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBot() {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        setBotScore(data.botScore);
        setIsBot(data.botScore > 0.6);
      } catch (error) {
        console.error('Bot detection failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkBot();
  }, [endpoint]);

  return { botScore, isBot, loading };
}

// Usage
function MyForm() {
  const { isBot, loading } = useBotDetection();
  
  if (loading) return <div>Loading...</div>;
  
  if (isBot) {
    return <div>Please complete CAPTCHA to continue</div>;
  }
  
  return <form>...</form>;
}
```

## Server-Side Integration

### Node.js/Express Middleware

```javascript
// middleware/botDetection.js
async function botDetectionMiddleware(req, res, next) {
  // Forward headers to bot detection endpoint
  const headers = {
    'User-Agent': req.get('user-agent'),
    'Accept': req.get('accept'),
    'Accept-Language': req.get('accept-language'),
    'Accept-Encoding': req.get('accept-encoding'),
    'Referer': req.get('referer'),
    'Cookie': req.get('cookie')
  };
  
  try {
    const response = await fetch('https://your-worker.dev/api/check', {
      headers: headers
    });
    
    const botData = await response.json();
    
    // Attach to request for downstream use
    req.botDetection = botData;
    
    // Block high-confidence bots
    if (botData.botScore > 0.8) {
      return res.status(403).json({
        error: 'Automated requests not allowed',
        botScore: botData.botScore
      });
    }
    
    // Challenge suspicious requests
    if (botData.botScore > 0.6 && !req.session.captchaVerified) {
      return res.status(429).json({
        error: 'Please complete CAPTCHA',
        challengeRequired: true,
        botScore: botData.botScore
      });
    }
    
    next();
  } catch (error) {
    console.error('Bot detection error:', error);
    // Fail open - allow request if detection fails
    next();
  }
}

// Apply to routes
app.post('/api/submit', botDetectionMiddleware, (req, res) => {
  // Your handler
  res.json({ success: true });
});
```

### Python/FastAPI

```python
from fastapi import FastAPI, Request, HTTPException
import httpx

app = FastAPI()

async def check_bot(request: Request) -> dict:
    """Check if request is from a bot"""
    headers = {
        'User-Agent': request.headers.get('user-agent', ''),
        'Accept': request.headers.get('accept', ''),
        'Accept-Language': request.headers.get('accept-language', ''),
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                'https://your-worker.dev/api/check',
                headers=headers,
                timeout=1.0  # 1 second timeout
            )
            return response.json()
        except Exception as e:
            print(f"Bot detection failed: {e}")
            # Fail open
            return {'botScore': 0, 'classification': 'unknown'}

@app.post("/api/submit")
async def submit_form(request: Request):
    # Check for bot
    bot_result = await check_bot(request)
    
    if bot_result['botScore'] > 0.8:
        raise HTTPException(
            status_code=403,
            detail=f"Bot detected: {bot_result['classification']}"
        )
    
    # Process legitimate request
    return {"success": True}
```

### PHP

```php
<?php
function checkBot() {
    $headers = [
        'User-Agent: ' . $_SERVER['HTTP_USER_AGENT'] ?? '',
        'Accept: ' . $_SERVER['HTTP_ACCEPT'] ?? '',
        'Accept-Language: ' . $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''
    ];
    
    $ch = curl_init('https://your-worker.dev/api/check');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1); // 1 second timeout
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        // Fail open
        return ['botScore' => 0, 'classification' => 'unknown'];
    }
    
    return json_decode($response, true);
}

// Use in your code
$botResult = checkBot();

if ($botResult['botScore'] > 0.8) {
    http_response_code(403);
    die(json_encode(['error' => 'Bot detected']));
}

// Continue with normal processing
?>
```

## Advanced Integrations

### Worker-to-Worker (Cloudflare)

If your app is also on Workers, you can call the bot detection directly:

```javascript
// your-app-worker/src/index.js
export default {
  async fetch(request, env) {
    // Call bot detection worker
    const botCheckUrl = 'https://edge-bot-detection.your-subdomain.workers.dev/api/check';
    
    const botResponse = await fetch(botCheckUrl, {
      headers: {
        'User-Agent': request.headers.get('User-Agent'),
        'Accept': request.headers.get('Accept'),
        'Accept-Language': request.headers.get('Accept-Language')
      }
    });
    
    const botData = await botResponse.json();
    
    if (botData.botScore > 0.7) {
      return new Response('Access denied', { status: 403 });
    }
    
    // Continue with your app logic
    return handleRequest(request);
  }
};
```

### API Gateway Integration (AWS)

```javascript
// Lambda@Edge function
exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    
    // Extract headers
    const headers = request.headers;
    
    // Call bot detection
    const botCheck = await fetch('https://your-worker.dev/api/check', {
        headers: {
            'User-Agent': headers['user-agent']?.[0]?.value || '',
            'Accept': headers['accept']?.[0]?.value || ''
        }
    });
    
    const botData = await botCheck.json();
    
    // Block bots
    if (botData.botScore > 0.8) {
        return {
            status: '403',
            statusDescription: 'Forbidden',
            body: 'Bot detected'
        };
    }
    
    // Allow request to origin
    return request;
};
```

### Nginx Integration

```nginx
# nginx.conf

location /api/ {
    # Call bot detection via auth_request
    auth_request /bot-check;
    auth_request_set $bot_score $upstream_http_x_bot_score;
    
    # Add bot score to request headers
    proxy_set_header X-Bot-Score $bot_score;
    
    # Proxy to your backend
    proxy_pass http://backend;
}

location = /bot-check {
    internal;
    proxy_pass https://your-worker.dev/api/check;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}
```

## Rate Limiting Enhancement

Combine bot detection with rate limiting:

```javascript
// Rate limit bots more aggressively
async function getRateLimit(botScore, ip) {
  if (botScore > 0.8) {
    return 10;  // 10 requests per minute for bots
  } else if (botScore > 0.5) {
    return 60;  // 60 requests per minute for suspicious
  } else {
    return 300; // 300 requests per minute for humans
  }
}

// Apply in your rate limiter
const botData = await checkBot(request);
const limit = await getRateLimit(botData.botScore, clientIP);
```

## Analytics Integration

Track bot scores in your analytics:

```javascript
// Google Analytics
gtag('event', 'bot_check', {
  'bot_score': botData.botScore,
  'classification': botData.classification,
  'processing_time': botData.metadata.processingTimeMs
});

// Mixpanel
mixpanel.track('Bot Detection', {
  bot_score: botData.botScore,
  classification: botData.classification,
  signals: botData.scoring.heuristic.signalCount
});

// Custom tracking
await logToDatabase({
  timestamp: Date.now(),
  ip: request.ip,
  botScore: botData.botScore,
  userAgent: request.headers.get('user-agent'),
  path: request.url
});
```

## CAPTCHA Integration

Show CAPTCHA based on bot score:

```javascript
// Frontend
async function submitForm(data) {
  const botCheck = await fetch('https://your-worker.dev/api/check');
  const botData = await botCheck.json();
  
  if (botData.botScore > 0.4) {
    // Show CAPTCHA
    const captchaToken = await showCaptcha();
    data.captchaToken = captchaToken;
  }
  
  // Submit form
  await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// With hCaptcha
if (botData.botScore > 0.4) {
  hcaptcha.render('captcha-container', {
    sitekey: 'your-site-key',
    callback: function(token) {
      // Proceed with submission
      submitFormWithToken(token);
    }
  });
}
```

## Error Handling Best Practices

```javascript
async function checkBotWithFallback(request) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000); // 1s timeout
    
    const response = await fetch('https://your-worker.dev/api/check', {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Bot detection failed:', error);
    
    // Graceful degradation
    return {
      botScore: 0.5,  // Neutral score
      classification: 'unknown',
      error: error.message,
      fallback: true
    };
  }
}
```

## Testing Your Integration

```javascript
// Test with different user agents
const testUserAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',  // Human
  'curl/8.4.0',  // Bot
  'python-requests/2.31.0',  // Bot
];

for (const ua of testUserAgents) {
  const result = await fetch('https://your-worker.dev/api/check', {
    headers: { 'User-Agent': ua }
  });
  const data = await result.json();
  console.log(`${ua}: ${data.botScore}`);
}
```

## Performance Considerations

```javascript
// Cache bot check results for short periods
const cache = new Map();

async function getCachedBotScore(fingerprint) {
  const cached = cache.get(fingerprint);
  
  if (cached && Date.now() - cached.timestamp < 60000) { // 1 min cache
    return cached.data;
  }
  
  const result = await checkBot();
  cache.set(fingerprint, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}

// Generate fingerprint from request
function getFingerprint(request) {
  const ua = request.headers.get('user-agent');
  const ip = request.headers.get('cf-connecting-ip');
  return `${ip}-${ua}`;
}
```

## Monitoring Integration

```javascript
// Prometheus metrics
const botDetectionLatency = new Histogram({
  name: 'bot_detection_latency_seconds',
  help: 'Bot detection latency in seconds'
});

const botScoreGauge = new Gauge({
  name: 'bot_score',
  help: 'Current bot score distribution',
  labelNames: ['classification']
});

// Record metrics
const start = Date.now();
const botData = await checkBot();
const duration = (Date.now() - start) / 1000;

botDetectionLatency.observe(duration);
botScoreGauge.labels(botData.classification).set(botData.botScore);
```
