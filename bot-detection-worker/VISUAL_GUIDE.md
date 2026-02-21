# Visual Architecture Guide

Understanding how edge bot detection works with diagrams.

---

## Overview: What Happens When Someone Visits Your URL

```
┌──────────────────────────────────────────────────────────────────┐
│                    User Types in Browser:                        │
│         https://edge-bot-detection.yourname.workers.dev          │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Internet / DNS Lookup                         │
│  "Where is edge-bot-detection.yourname.workers.dev?"             │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│              Cloudflare's Global Network Responds                │
│  Routes to NEAREST edge location (could be any of 300+ cities)   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  Edge Server  │  ← Could be San Francisco
                   │  (closest to  │  ← Could be London  
                   │   the user)   │  ← Could be Tokyo
                   └───────┬───────┘  ← etc...
                           │
                           │ Your Worker Code Runs Here!
                           ▼
              ┌────────────────────────┐
              │   Bot Detection Code   │
              │   (src/index.js)       │
              │                        │
              │  • Analyzes headers    │
              │  • Calculates score    │
              │  • Returns result      │
              └────────┬───────────────┘
                       │
                       │ Takes 2-5 milliseconds
                       ▼
              ┌────────────────────────┐
              │   Response Sent Back   │
              │   to User's Browser    │
              └────────────────────────┘
```

**Key Point**: Your code runs in the data center closest to the user!
- User in USA → Code runs in USA
- User in Europe → Code runs in Europe
- User in Asia → Code runs in Asia

**Result**: Fast response times globally (usually <50ms total)

---

## Installation Flow: What Each Step Does

```
Step 1: Install Node.js
┌─────────────────────────┐
│   Your Computer         │
│   (No Node.js)          │
└────────┬────────────────┘
         │
         │ Download & Install
         ▼
┌─────────────────────────┐
│   Your Computer         │
│   (Node.js Installed)   │
│   • npm command works   │
│   • Can run JavaScript  │
└─────────────────────────┘

Step 2-3: Create Cloudflare Account
┌─────────────────────────┐
│   Cloudflare Website    │
│   (No account)          │
└────────┬────────────────┘
         │
         │ Sign up
         ▼
┌─────────────────────────┐
│   Cloudflare Dashboard  │
│   (Your account ready)  │
│   • Account ID created  │
│   • Can deploy Workers  │
└─────────────────────────┘

Step 4-5: Install Dependencies
┌─────────────────────────┐
│   Project Folder        │
│   (Just files)          │
└────────┬────────────────┘
         │
         │ npm install
         ▼
┌─────────────────────────┐
│   Project Folder        │
│   (Ready to deploy)     │
│   • Wrangler installed  │
│   • Dependencies ready  │
└─────────────────────────┘

Step 6-7: Configure & Login
┌─────────────────────────┐
│   Your Computer         │
│   (Not connected)       │
└────────┬────────────────┘
         │
         │ wrangler login
         ▼
┌─────────────────────────┐
│   Your Computer         │
│   (Connected to CF)     │
│   • Can deploy code     │
│   • Authenticated       │
└─────────────────────────┘

Step 8: Test Locally
┌─────────────────────────┐
│   npm run dev           │
│   localhost:8787        │
│   (Only you can see)    │
└─────────────────────────┘

Step 9: Deploy Globally!
┌─────────────────────────┐
│   npm run deploy        │
└────────┬────────────────┘
         │
         │ Uploads code
         ▼
┌──────────────────────────────────────────────┐
│           Cloudflare Global Network          │
│  Code deployed to 300+ locations worldwide!  │
│                                              │
│  🌍 New York    🌍 London    🌍 Tokyo        │
│  🌍 Frankfurt   🌍 Sydney    🌍 São Paulo    │
│  🌍 ...and 294 more cities                   │
└──────────────────────────────────────────────┘
         │
         │ Live at:
         ▼
  https://edge-bot-detection
      .yourname.workers.dev
```

---

## How Bot Detection Works: Request Flow

```
1. User Makes Request
┌─────────────────┐
│  User's Browser │
│  or             │
│  Bot Script     │
└────────┬────────┘
         │
         │ Sends HTTP Request with headers:
         │ • User-Agent: Mozilla/5.0...
         │ • Accept: text/html...
         │ • Accept-Language: en-US...
         │ • etc.
         ▼
┌─────────────────────────────────────────────┐
│         Edge Server (Closest Location)       │
│         Your Worker Code Starts              │
└────────┬────────────────────────────────────┘
         │
         ▼

2. Extract Features
┌─────────────────────────────────────────────┐
│  function extractRequestFeatures(request)    │
│                                              │
│  Extracts:                                   │
│  ✓ User-Agent header                         │
│  ✓ Accept-Language header                    │
│  ✓ Number of headers sent                    │
│  ✓ Cookie presence                           │
│  ✓ Referer presence                          │
│  ✓ Request method (GET/POST)                 │
│  ✓ Accept-Encoding                           │
└────────┬────────────────────────────────────┘
         │
         ▼

3. Calculate Score
┌─────────────────────────────────────────────┐
│  function calculateHeuristicScore(features)  │
│                                              │
│  Scoring Logic:                              │
│  ┌──────────────────────────────────────┐   │
│  │ No User-Agent?        → +30 points   │   │
│  │ Contains "bot"?       → +25 points   │   │
│  │ No Accept-Language?   → +12 points   │   │
│  │ Too few headers?      → +15 points   │   │
│  │ No cookies?           → +10 points   │   │
│  │ etc...                                │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Total: 0-100 points                         │
│  Normalized to: 0.0 - 1.0                    │
└────────┬────────────────────────────────────┘
         │
         ▼

4. Classify
┌─────────────────────────────────────────────┐
│  function classifyBot(score)                 │
│                                              │
│  Score   Classification                      │
│  0.0-0.2 → human_high_confidence             │
│  0.2-0.4 → human_likely                      │
│  0.4-0.6 → suspicious                        │
│  0.6-0.8 → bot_likely                        │
│  0.8-1.0 → bot_high_confidence               │
└────────┬────────────────────────────────────┘
         │
         ▼

5. Return Response
┌─────────────────────────────────────────────┐
│  Response JSON:                              │
│  {                                           │
│    "botScore": 0.85,                         │
│    "classification": "bot_high_confidence",  │
│    "confidence": 0.70,                       │
│    "metadata": {                             │
│      "processingTimeMs": 3                   │
│    }                                         │
│  }                                           │
└────────┬────────────────────────────────────┘
         │
         │ Total time: ~3-5 milliseconds
         ▼
┌─────────────────┐
│  User Receives  │
│     Result      │
└─────────────────┘
```

---

## File Structure Explained

```
bot-detection-worker/
│
├── 📄 src/
│   └── index.js                    ← The main code (Worker script)
│                                      • Handles requests
│                                      • Contains bot detection logic
│                                      • Serves the demo page
│                                      • ~300 lines of code
│
├── 📄 test/
│   └── test-requests.js            ← Automated tests
│                                      • Tests 10 different scenarios
│                                      • Validates bot detection works
│                                      • Measures performance
│
├── ⚙️ wrangler.toml                ← Configuration file
│                                      • Tells Cloudflare about your Worker
│                                      • Contains your account ID
│                                      • Deployment settings
│
├── 📦 package.json                 ← NPM configuration
│                                      • Lists dependencies (Wrangler)
│                                      • Defines npm scripts
│                                      • Project metadata
│
├── 📖 README.md                    ← Main documentation
├── 📖 QUICKSTART.md                ← 5-minute guide
├── 📖 DETAILED_INSTALLATION.md     ← This detailed guide (you are here!)
├── 📖 TALK_QA.md                   ← ACM talk Q&A prep
├── 📖 INTEGRATION.md               ← Integration examples
├── 📖 PROJECT_OVERVIEW.md          ← Project summary
│
├── 🚫 .gitignore                   ← Files to ignore in git
│
└── 📁 node_modules/                ← Dependencies (auto-created by npm)
    └── wrangler/                      • Created by "npm install"
                                       • Don't edit this folder
```

**Which files you need to edit**:
- ✏️ `wrangler.toml` - Add your account ID (Step 6)
- ✏️ `src/index.js` - Customize bot detection rules (optional)

**Which files you never edit**:
- ❌ `package.json` - Already configured
- ❌ `node_modules/` - Auto-managed by npm
- ❌ Test files - Unless adding new tests

---

## Demo Page Architecture

When someone visits `https://your-url.workers.dev/`:

```
┌────────────────────────────────────────────────────┐
│              Browser Requests Page                 │
│         GET https://your-url.workers.dev/          │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│              Worker Receives Request               │
│  if (url.pathname === '/' || url.pathname === '/demo') │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│         function getDemoHTML() is called           │
│  Returns HTML/CSS/JavaScript as a string           │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│           HTML Page Sent to Browser                │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │  🎨 Purple gradient background            │    │
│  │  📊 "Edge Bot Detection Demo" title       │    │
│  │  🔘 "Analyze This Request" button         │    │
│  │  📝 Demo explanation                      │    │
│  └──────────────────────────────────────────┘    │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│         User Clicks "Analyze" Button               │
│  JavaScript code runs in browser:                  │
│  fetch('/api/check')                               │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│         Worker Receives API Request                │
│  if (url.pathname === '/api/check')                │
│  → Run bot detection                               │
│  → Return JSON response                            │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│      JavaScript Displays Results on Page           │
│  Shows:                                            │
│  • Bot score (15.0%)                               │
│  • Classification (human_high_confidence)          │
│  • Processing time (3ms)                           │
│  • Detection signals                               │
└────────────────────────────────────────────────────┘
```

---

## Cost Breakdown (Visual)

### Free Tier

```
┌────────────────────────────────────────────────┐
│          Cloudflare Workers Free Tier          │
├────────────────────────────────────────────────┤
│                                                │
│  Requests:     100,000 per day                 │
│                └─ About 3M per month           │
│                                                │
│  CPU Time:     10 minutes per day              │
│                └─ Plenty for demos             │
│                                                │
│  Bandwidth:    Unlimited                       │
│                                                │
│  Cost:         $0 💰                           │
│                                                │
│  Perfect for:  Demos, testing, low traffic     │
│                                                │
└────────────────────────────────────────────────┘
```

### Paid Tier (if needed)

```
┌────────────────────────────────────────────────┐
│         Cloudflare Workers Paid Plan           │
├────────────────────────────────────────────────┤
│                                                │
│  Base:         $5/month                        │
│                                                │
│  Includes:     10,000,000 requests             │
│                └─ About 330K per day           │
│                                                │
│  Extra:        $0.50 per 1M requests           │
│                                                │
│  Example:      1M requests/day × 30 days       │
│                = 30M requests/month            │
│                = $5 + (20M × $0.50)            │
│                = $5 + $10                      │
│                = $15/month 💰                  │
│                                                │
└────────────────────────────────────────────────┘

Compare to Cloud ML API:
1M requests/day = ~$30,000/month 😱
Edge is 2,000x cheaper!
```

---

## Testing Flow

### Local Testing (`npm run dev`)

```
┌─────────────────────────────────────────┐
│  Your Computer (localhost:8787)         │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Wrangler Dev Server Running     │  │
│  │  • Simulates edge environment    │  │
│  │  • Only accessible locally       │  │
│  │  • Perfect for development       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Access: http://localhost:8787          │
│  Others can't see this                  │
└─────────────────────────────────────────┘
```

### Production Testing (after deploy)

```
┌──────────────────────────────────────────────────┐
│          Cloudflare Global Network               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Your Worker Running on Real Edge          │ │
│  │  • Available worldwide                     │ │
│  │  • Anyone can access                       │ │
│  │  • Production environment                  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Access: https://edge-bot-detection              │
│          .yourname.workers.dev                   │
│  Anyone can see this!                            │
└──────────────────────────────────────────────────┘
```

### Automated Testing (`npm test`)

```
┌─────────────────────────────────────────────┐
│  Test Suite (test/test-requests.js)         │
├─────────────────────────────────────────────┤
│                                             │
│  Test 1: Chrome Browser                     │
│  → Send real Chrome headers                 │
│  → Expect low bot score (<0.3)             │
│  → ✅ PASS (score: 0.15)                    │
│                                             │
│  Test 2: Firefox Browser                    │
│  → Send Firefox headers                     │
│  → Expect low bot score                     │
│  → ✅ PASS (score: 0.12)                    │
│                                             │
│  Test 3: Python Bot                         │
│  → Send "python-requests" User-Agent        │
│  → Expect high bot score (>0.6)            │
│  → ✅ PASS (score: 0.85)                    │
│                                             │
│  Test 4: Curl                               │
│  → Send minimal curl headers                │
│  → Expect very high bot score              │
│  → ✅ PASS (score: 0.90)                    │
│                                             │
│  ... 6 more tests ...                       │
│                                             │
│  Results: 10/10 passed (100%)               │
│  Avg Processing: 3.2ms                      │
└─────────────────────────────────────────────┘
```

---

## Common Commands Cheat Sheet

```
┌─────────────────────────────────────────────────┐
│              Essential Commands                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  📦 Install dependencies:                       │
│     npm install                                 │
│                                                 │
│  🔐 Login to Cloudflare:                        │
│     npx wrangler login                          │
│                                                 │
│  🧪 Test locally:                               │
│     npm run dev                                 │
│     → Opens at http://localhost:8787            │
│                                                 │
│  🚀 Deploy to production:                       │
│     npm run deploy                              │
│     → Live at https://your-url.workers.dev      │
│                                                 │
│  ✅ Run tests:                                  │
│     npm test                                    │
│                                                 │
│  📊 View live logs:                             │
│     npm run tail                                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Deployment Status Indicator

After running `npm run deploy`, you'll see:

```
✅ SUCCESS:
⛅️ wrangler 3.22.0
------------------
Uploading...
Uploaded edge-bot-detection (1.2 sec)
Published edge-bot-detection (0.3 sec)
  https://edge-bot-detection.yourname.workers.dev
Current Deployment ID: abc123def456
```

This means:
1. ✅ Code uploaded successfully
2. ✅ Deployed to all edge locations
3. ✅ Live and accessible at the URL
4. ✅ Ready to demo!

---

## What Success Looks Like

### Demo Page Should Show:

```
┌──────────────────────────────────────────────────┐
│  🤖 Edge Bot Detection Demo                      │
│  Real-time bot detection running at CDN edge     │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  [Analyze This Request] ← Click this       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  After clicking:                                 │
│  ┌────────────────────────────────────────────┐ │
│  │  HUMAN HIGH CONFIDENCE                     │ │
│  │                                            │ │
│  │         15.0%                              │ │
│  │      Bot Probability                       │ │
│  │                                            │ │
│  │  Confidence: 70.0%                         │ │
│  │  Processing Time: 3ms  ← Should be <10ms  │ │
│  │  User-Agent: Mozilla/5.0...                │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### API Response Should Show:

```json
{
  "botScore": 0.15,
  "classification": "human_high_confidence",
  "confidence": 0.70,
  "features": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "headerCount": 12,
    "hasUserAgent": true,
    "hasAcceptLanguage": true
  },
  "scoring": {
    "heuristic": {
      "score": 0.15,
      "rawScore": 15,
      "signalCount": 2
    }
  },
  "metadata": {
    "processingTimeMs": 3,    ← Should be 2-8ms
    "timestamp": "2026-01-10T...",
    "edge": true
  }
}
```

---

## Your ACM Talk Setup

### What to Have Open During Demo:

```
Screen 1: Browser
├─ Tab 1: Demo page (https://your-url.workers.dev/)
├─ Tab 2: Cloudflare Dashboard (for showing deployment)
└─ Tab 3: This README (for reference)

Screen 2: Terminal
├─ Window 1: Ready to run curl commands
└─ Window 2: Ready to show npm run tail (logs)

Screen 3: Code Editor (optional)
└─ src/index.js open to show detection logic
```

### Live Demo Flow:

```
1. Show browser demo (30 seconds)
   "This is running globally at the edge"
   → Click "Analyze This Request"
   → Point out 3ms processing time
   
2. Show curl demo (30 seconds)
   Terminal: curl https://your-url.workers.dev/api/check
   → Show JSON response
   → Point out low bot score for real browser
   
3. Show bot detection (30 seconds)
   Terminal: curl -A "Python Bot" https://your-url...
   → Show high bot score (0.85+)
   → Explain why it was detected
   
4. Show the code (30 seconds) [optional]
   → Open src/index.js
   → Show calculateHeuristicScore function
   → Explain simple rule-based approach

Total: 2 minutes
```

---

## You're Ready! 🎉

If you can:
- ✅ Access your demo page
- ✅ Click "Analyze" and see results
- ✅ Run curl and get JSON
- ✅ See processing time <10ms

Then you're 100% ready for your ACM talk!
