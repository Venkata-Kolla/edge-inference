# 🚀 Quick Deployment Guide

Get your bot detection POC running in 5 minutes.

> **📘 New to Cloudflare or Workers?** Check out the detailed [INSTALLATION.md](INSTALLATION.md) guide which explains every step from scratch, including creating a Cloudflare account, finding your account ID, and troubleshooting common issues.

> **✓ Want a checklist?** Use [CHECKLIST.md](CHECKLIST.md) to track your progress through each step.

This guide is for users who already have Node.js and a Cloudflare account set up.

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([download](https://nodejs.org)) - **Don't have it?** See [INSTALLATION.md Step 1](INSTALLATION.md#step-1-install-nodejs)
- [ ] Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up)) - **Need help?** See [INSTALLATION.md Step 3-4](INSTALLATION.md#step-3-create-a-cloudflare-account)
- [ ] Terminal/command line access

## Step-by-Step Deployment

### 1. Install Dependencies (1 minute)

```bash
cd bot-detection-worker
npm install
```

### 2. Login to Cloudflare (1 minute)

```bash
npx wrangler login
```

This will open your browser for authentication.

### 3. Update Configuration (1 minute)

Edit `wrangler.toml` and add your account ID:

```toml
name = "edge-bot-detection"
account_id = "YOUR_ACCOUNT_ID_HERE"  # Find this in Cloudflare dashboard
```

**Where to find your account ID:**
1. Go to https://dash.cloudflare.com
2. Click on "Workers & Pages"
3. Your account ID is in the URL or right sidebar

### 4. Test Locally (1 minute)

```bash
npm run dev
```

Visit http://localhost:8787 and click "Analyze This Request"

**Expected result:** 
- You should see a bot score (likely low since you're a real browser)
- Processing time should be 1-3ms
- Signal breakdown should show your browser headers

### 5. Deploy to Edge (1 minute)

```bash
npm run deploy
```

**Expected output:**
```
✨ Deployed edge-bot-detection
   https://edge-bot-detection.<your-subdomain>.workers.dev
```

### 6. Test Production (30 seconds)

Visit your deployed URL and test:

```bash
# Test with browser (should score low)
curl https://edge-bot-detection.<your-subdomain>.workers.dev/

# Test API endpoint
curl https://edge-bot-detection.<your-subdomain>.workers.dev/api/check

# Test as obvious bot (should score high)
curl -A "Python Bot" https://edge-bot-detection.<your-subdomain>.workers.dev/api/check
```

## Verification Checklist

After deployment, verify:

- [ ] Demo page loads at your .workers.dev URL
- [ ] "Analyze This Request" button works
- [ ] API endpoint returns JSON at `/api/check`
- [ ] Processing time is <10ms
- [ ] Different user agents give different scores

## Optional: Enable ML Enhancement

For ML-powered scoring:

1. Uncomment in `wrangler.toml`:
```toml
[ai]
binding = "AI"
```

2. Redeploy:
```bash
npm run deploy
```

3. Verify ML is enabled:
```bash
curl https://your-worker.dev/api/check | jq '.scoring.mlEnabled'
# Should return: true
```

**Note:** ML adds ~50-100ms latency but can improve accuracy.

## Troubleshooting

### Error: "No account_id specified"

**Solution:** Add your account ID to `wrangler.toml`

### Error: "Not authenticated"

**Solution:** Run `npx wrangler login` again

### Error: "Worker name already taken"

**Solution:** Change the `name` in `wrangler.toml` to something unique:
```toml
name = "my-unique-bot-detector"
```

### Local dev not working

**Solution:** 
```bash
# Kill any existing processes
pkill -f wrangler

# Try again
npm run dev
```

### Slow processing times (>50ms)

**Likely cause:** ML is enabled but Workers AI is slow/over quota

**Solution:** 
1. Check free tier limits in Cloudflare dashboard
2. Disable ML by commenting out `[ai]` section in `wrangler.toml`

## Running the Test Suite

```bash
# Start local dev server
npm run dev

# In another terminal
WORKER_URL=http://localhost:8787 npm test

# Or test production
WORKER_URL=https://your-worker.dev npm test
```

**Expected output:**
```
✅ Legitimate Chrome Browser     | Score: 15.0%    | human_high_confidence
✅ Firefox Browser              | Score: 12.0%    | human_high_confidence
✅ Obvious Bot - Python         | Score: 85.0%    | bot_high_confidence
✅ Obvious Bot - Curl           | Score: 90.0%    | bot_high_confidence
...
Success Rate: 100%
Avg Processing Time: 3.2ms
```

## Custom Domain (Optional)

To use your own domain:

1. Add domain to Cloudflare
2. Update `wrangler.toml`:
```toml
routes = [
  { pattern = "botcheck.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```
3. Deploy: `npm run deploy`

## Monitoring

View logs in real-time:

```bash
npm run tail
```

Or in Cloudflare dashboard:
1. Go to Workers & Pages
2. Click your worker
3. Click "Logs" tab

## Next Steps

- [ ] Test with your application's traffic
- [ ] Adjust scoring thresholds in `src/index.js`
- [ ] Add custom detection rules
- [ ] Set up monitoring/alerts
- [ ] Consider rate limiting (see README.md)

## For Your ACM Talk

**Live Demo URLs to prepare:**

1. **Demo page:** `https://your-worker.dev/`
2. **API test:** `https://your-worker.dev/api/check`
3. **Health check:** `https://your-worker.dev/health`

**Pre-demo checklist:**

- [ ] Test all URLs 30 mins before talk
- [ ] Have backup slides if internet fails
- [ ] Prepare curl commands in advance
- [ ] Have browser dev tools open to show headers
- [ ] Take screenshots as backup

**Backup plan if live demo fails:**
1. Show pre-recorded video
2. Use screenshots of working demo
3. Walk through code instead

## Getting Help

- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Discord:** https://discord.gg/cloudflaredev
- **Community Forum:** https://community.cloudflare.com/

## Cost Warning

This should be **free** for demo purposes, but monitor your usage:

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages"
3. Check "Usage" tab

**Free tier limits:**
- 100,000 requests/day
- 10 minutes CPU time/day

If you expect to exceed this during your talk/demo, consider:
- Upgrading to paid ($5/month)
- Limiting demo to specific test cases
- Using rate limiting

---

**🎉 You're ready!** Your bot detection is now running at the edge globally.

**⏱️ Total setup time:** ~5 minutes
**💰 Cost:** $0 (free tier)
**🌍 Global reach:** 300+ locations
**⚡ Latency:** <10ms worldwide
