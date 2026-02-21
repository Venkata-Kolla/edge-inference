# POC Deployment Guide - Quick Start

Deploy both demos for your ACM talk in 15-20 minutes.

## Prerequisites

Before starting, you need:
- ✅ Cloudflare account (sign up at https://dash.cloudflare.com/sign-up - FREE)
- ✅ Node.js 18+ installed on your machine
- ✅ Your Cloudflare Account ID (we'll get this in Step 1)

---

## Step 1: Get Your Cloudflare Account ID

1. Go to https://dash.cloudflare.com
2. Log in (or create free account)
3. Click "Workers & Pages" in the left sidebar
4. Your **Account ID** is displayed at the top right
5. Copy it - you'll need it for both POCs

**Example Account ID:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

## Step 2: Deploy POC 1 - Semantic Search

### 2.1 Open Terminal and Navigate

```bash
cd semantic-search-worker
```

### 2.2 Install Dependencies

```bash
npm install
```

**Expected output:** `added 234 packages in 15s`

### 2.3 Login to Cloudflare

```bash
npx wrangler login
```

**What happens:**
- Browser opens automatically
- Click "Allow" to authorize Wrangler
- Return to terminal (should say "Successfully logged in")

### 2.4 Configure Your Account ID

Edit `wrangler.toml` and add your account ID:

**Before:**
```toml
name = "semantic-search-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
# account_id = "your-account-id"   ← UNCOMMENTED
```

**After:**
```toml
name = "semantic-search-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
account_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"   ← YOUR ACTUAL ID
workers_dev = true
```

**Critical:** The `[ai]` binding MUST stay - don't touch it!

### 2.5 Deploy!

```bash
npm run deploy
```

**Expected output:**
```
✨ Built successfully
🌍 Uploading...
✨ Uploaded semantic-search-edge (2.1 sec)
📡 Published semantic-search-edge (0.34 sec)
   https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev
🎉 Success!
```

### 2.6 Test It

Copy your URL from the output, then test:

**Browser Test:**
- Open: `https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev`
- You should see the demo page
- Try searching: "can't log in"
- Should find: "Password Reset", "Account Locked"

**API Test:**
```bash
curl -X POST https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "reset password"}' | jq
```

**✅ POC 1 Deployed!** Save this URL for your presentation.

---

## Step 3: Deploy POC 2 - Image Classification

### 3.1 Navigate to POC 2

```bash
cd ../image-classification-worker
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Login (Skip if Already Logged In)

If you just deployed POC 1, you're already logged in. Skip to 3.4.

If not:
```bash
npx wrangler login
```

### 3.4 Configure Account ID

Edit `wrangler.toml` - **use the SAME account ID** as POC 1:

```toml
name = "image-classification-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
account_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"   ← SAME ID
workers_dev = true

[ai]
binding = "AI"   ← Keep this!
```

### 3.5 Deploy!

```bash
npm run deploy
```

**Expected output:**
```
✨ Built successfully
🌍 Uploading...
✨ Uploaded image-classification-edge (2.3 sec)
📡 Published image-classification-edge (0.42 sec)
   https://image-classification-edge.YOUR-SUBDOMAIN.workers.dev
🎉 Success!
```

### 3.6 Test It

**Browser Test:**
- Open: `https://image-classification-edge.YOUR-SUBDOMAIN.workers.dev`
- Upload a photo (cat, dog, food, anything)
- Click "Classify Image"
- Should show predictions with confidence scores

**API Test:**
```bash
# Download a test image first
curl -o cat.jpg https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/300px-Cat03.jpg

# Then classify it
curl -X POST https://image-classification-edge.YOUR-SUBDOMAIN.workers.dev/api/classify \
  -F "image=@cat.jpg" | jq
```

**Expected result:** Should see "tabby cat", "tiger cat" with high confidence

**✅ POC 2 Deployed!** Save this URL too.

---

## Step 4: Save Your Demo URLs

Create a file with your URLs for easy access during the talk:

```txt
POC 1 - Semantic Search:
https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev

POC 2 - Image Classification:
https://image-classification-edge.YOUR-SUBDOMAIN.workers.dev
```

**Test both URLs work!**

---

## Troubleshooting

### "AI binding not found"

**Problem:** Workers AI not enabled

**Fix:**
1. Check `wrangler.toml` has this section:
   ```toml
   [ai]
   binding = "AI"
   ```
2. Redeploy: `npm run deploy`

### "Account ID is required"

**Problem:** Forgot to add account_id in wrangler.toml

**Fix:**
1. Edit `wrangler.toml`
2. Add: `account_id = "your-actual-id"`
3. Redeploy

### "Rate limit exceeded" during demo

**Problem:** Exceeded free tier (10,000 neurons/day)

**Solutions:**
- Wait until tomorrow (resets daily)
- Upgrade to paid Workers ($5/month unlimited)
- Use demo sparingly before talk

### Slow response (>1 second)

**Normal:** First request may be slow (cold start)
**Expected:** Subsequent requests should be <300ms

**If always slow:**
- Check your internet
- Try from different location
- Verify Workers AI status: https://www.cloudflarestatus.com

### Deploy fails with "unauthorized"

**Fix:**
```bash
npx wrangler logout
npx wrangler login
npm run deploy
```

---

## Monitoring Your Usage

**Free Tier Limits:**
- 10,000 neurons per day
- Each search: ~10 neurons (~1,000 searches/day)
- Each image: ~100 neurons (~100 images/day)

**Check usage:**
1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages"
3. Click on your worker name
4. View "Analytics" tab

---

## Pre-Talk Checklist

Before your ACM presentation:

### 1 Day Before:
- [ ] Test both POC URLs still work
- [ ] Try 3-4 different searches on POC 1
- [ ] Upload 3-4 different images to POC 2
- [ ] Verify processing times are <300ms
- [ ] Check "ML Enabled: true" appears
- [ ] Take backup screenshots of results

### 1 Hour Before:
- [ ] Test both URLs again
- [ ] Prepare test images for POC 2
- [ ] Have curl commands ready in terminal
- [ ] Bookmark both URLs in browser
- [ ] Close other tabs to avoid confusion

### Example Test Queries

**POC 1 - Semantic Search:**
- "can't log in"
- "change payment method"
- "mobile app download"
- "team permissions"

**POC 2 - Image Classification:**
- Cat/dog photo
- Food photo (pizza, coffee)
- Car/vehicle
- Everyday object (phone, laptop)

---

## What You'll Have After This

✅ **POC 1 Live:** Semantic search working at edge
✅ **POC 2 Live:** Image classification working at edge
✅ **Global URLs:** Accessible from anywhere
✅ **Demo Ready:** Both POCs tested and working
✅ **API Access:** Curl commands ready to show
✅ **Cost:** $0 (free tier)

---

## Next Steps

After deployment:

1. **Test thoroughly** - Use both POCs multiple times
2. **Prepare demos** - Practice your demo flow
3. **Take screenshots** - Backup in case internet fails during talk
4. **Know your URLs** - Memorize or have them easily accessible
5. **Prepare images** - Have 3-5 test images ready for POC 2

---

## Quick Reference Commands

### Check deployment status:
```bash
npx wrangler deployments list
```

### View logs (real-time):
```bash
npx wrangler tail
```

### Redeploy after changes:
```bash
npm run deploy
```

### Delete worker (if needed):
```bash
npx wrangler delete
```

---

## Need Help?

**Cloudflare Docs:**
- Workers: https://developers.cloudflare.com/workers/
- Workers AI: https://developers.cloudflare.com/workers-ai/

**Community:**
- Discord: https://discord.gg/cloudflaredev
- Forum: https://community.cloudflare.com

**Your POC Documentation:**
- POC 1: `semantic-search-worker/README.md`
- POC 2: `image-classification-worker/README.md`

---

**Ready to deploy! Follow steps 1-4 above and you'll have working demos in 15-20 minutes! 🚀**
