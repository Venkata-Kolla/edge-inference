# Installation Guide - Image Classification POC

Quick setup guide for image classification and content moderation at the edge.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Cloudflare account created
- ✅ Account ID ready

## Installation Steps (10 minutes)

### Step 1: Navigate and Install

```bash
cd image-classification-worker
npm install
```

### Step 2: Configure

Edit `wrangler.toml`:

```toml
account_id = "YOUR_ACCOUNT_ID_HERE"
workers_dev = true

[ai]
binding = "AI"  # Keep this - required for ML
```

### Step 3: Login

```bash
npx wrangler login
```

### Step 4: Deploy

```bash
npm run deploy
```

You'll get a URL like: `https://image-classification-edge.your-subdomain.workers.dev`

### Step 5: Test

Visit your URL in browser and upload an image!

Or test with curl:
```bash
curl -X POST https://your-worker.workers.dev/api/classify \
  -F "image=@test-image.jpg"
```

## Testing Tips

### Good Test Images

**For Classification:**
- Photos of cats, dogs, birds
- Food photos (pizza, coffee, fruit)
- Vehicles (cars, bikes, planes)
- Everyday objects (phone, laptop, chair)

**For Moderation:**
- Safe: landscape, food, objects
- Sensitive: may include people, alcohol
- Test with various content types

### Where to Get Test Images

- Your phone photos
- https://unsplash.com (free stock photos)
- https://pixabay.com (free images)

## Troubleshooting

### "AI binding not found"

**Fix:** Check `wrangler.toml` has `[ai]` section, then redeploy

### "Image too large"

**Limit:** 10MB per image (Workers limit)

**Fix:** Resize image before uploading

### Slow response (>1 second)

**Normal:** First request may be slower (cold start)
**Expected:** Subsequent requests should be 150-300ms

## Cost Monitoring

**Free tier:** 10,000 neurons/day (~100 images)

**Monitor at:**
1. https://dash.cloudflare.com
2. Workers & Pages → image-classification-edge
3. Analytics tab

## Next Steps

- Upload different images to test classification
- Try moderation with various content
- Check safety scores
- Review processing times

---

**You're ready! Computer vision ML is now running at the edge! 🚀**
