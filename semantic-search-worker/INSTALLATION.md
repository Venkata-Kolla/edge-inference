# Installation Guide - Semantic Search POC

Step-by-step guide to deploy semantic search at the edge.

## Prerequisites

Before starting, you need:
- ✅ Node.js 18+ installed
- ✅ Cloudflare account created
- ✅ Account ID ready

**If you haven't done these:** See the bot-detection-worker/DETAILED_INSTALLATION.md guide first - it covers these steps in detail.

## Quick Installation (10 minutes)

### Step 1: Navigate to Directory

```bash
cd semantic-search-worker
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 234 packages in 15s
```

### Step 3: Configure Account

Edit `wrangler.toml` and add your account ID:

```toml
name = "semantic-search-edge"
account_id = "YOUR_ACCOUNT_ID_HERE"  # ← Add this
workers_dev = true

[ai]
binding = "AI"  # ← Already configured - DO NOT REMOVE
```

**Critical:** The `[ai]` section must stay - it enables Workers AI for embeddings.

### Step 4: Login to Cloudflare

```bash
npx wrangler login
```

Browser will open → Click "Allow" → Return to terminal

### Step 5: Test Locally (Optional)

```bash
npm run dev
```

Visit: http://localhost:8787

Try searching: "can't log in" or "change payment method"

**Stop local server:** Press `Ctrl + C`

### Step 6: Deploy!

```bash
npm run deploy
```

**Expected output:**
```
Published semantic-search-edge (0.5 sec)
  https://semantic-search-edge.your-subdomain.workers.dev
```

### Step 7: Test Production

Open your deployed URL in browser and try a search!

Or test with curl:
```bash
curl -X POST https://your-worker.workers.dev/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "reset password"}'
```

## Verification Checklist

After deployment, verify:

- [ ] Demo page loads at your .workers.dev URL
- [ ] Can search and see results
- [ ] Results show relevance scores
- [ ] Processing time is <200ms
- [ ] "ML Enabled: true" in metadata
- [ ] Semantic vs keyword comparison shows

## Troubleshooting

### "AI binding not found"

**Problem:** Workers AI not enabled

**Solution:**
1. Check `wrangler.toml` has:
   ```toml
   [ai]
   binding = "AI"
   ```
2. Redeploy: `npm run deploy`

### "Rate limit exceeded"

**Problem:** Exceeded free tier (10,000 neurons/day)

**Solutions:**
- Wait until tomorrow (resets daily)
- Upgrade to paid Workers ($5/month)
- Use fewer test searches

### Slow response (>500ms)

**Expected:** First request may be slow (cold start + embedding generation)
**Normal:** Subsequent requests should be <200ms

**If always slow:**
- Check your internet connection
- Try from different location
- Verify Workers AI status at status.cloudflare.com

## Cost Monitoring

### Free Tier Limits

- **10,000 neurons per day**
- Each search uses ~10 neurons
- = ~1,000 searches per day FREE

### Monitor Usage

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages"
3. Click "semantic-search-edge"
4. View "Analytics" tab

## Next Steps

- [ ] Read TALK_GUIDE.md for ACM presentation tips
- [ ] Try different search queries
- [ ] Compare semantic vs keyword results
- [ ] Run test suite: `npm test`

---

**You're ready! Semantic search is now running at the edge globally! 🚀**
