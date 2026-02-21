# Quick Visual Workflow

Here's the EXACT order to do everything:

```
┌─────────────────────────────────────────────────────────────┐
│ PART 1: Setup (5 min)                                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Create folder: edge-inference-acm-talk                   │
│ 2. Move downloaded files into it                            │
│ 3. Verify all files are there (ls -la)                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PART 2: Git (5 min)                                         │
├─────────────────────────────────────────────────────────────┤
│ 1. git init                                                 │
│ 2. Create .gitignore                                        │
│ 3. git add . && git commit -m "Initial commit"             │
│ 4. Create repo on GitHub.com                               │
│ 5. git remote add origin ...                               │
│ 6. git push -u origin main                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PART 3: Cloudflare Account (5 min) ★ DO THIS NOW           │
├─────────────────────────────────────────────────────────────┤
│ 1. Go to: dash.cloudflare.com/sign-up                      │
│ 2. Create account (email + password)                       │
│ 3. Verify email                                             │
│ 4. Go to Workers & Pages                                   │
│ 5. Copy your Account ID (32 chars)                         │
│ 6. SAVE IT - you'll need it twice!                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PART 4: Deploy POC 1 - Semantic Search (10 min)            │
├─────────────────────────────────────────────────────────────┤
│ 1. cd semantic-search-worker                                │
│ 2. npm install                                              │
│ 3. Edit wrangler.toml → add account_id                     │
│ 4. npx wrangler login (browser opens)                      │
│ 5. npm run deploy                                           │
│ 6. SAVE the URL it gives you!                              │
│ 7. Test in browser                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PART 5: Deploy POC 2 - Image Classification (10 min)       │
├─────────────────────────────────────────────────────────────┤
│ 1. cd ../image-classification-worker                        │
│ 2. npm install                                              │
│ 3. Edit wrangler.toml → add SAME account_id                │
│ 4. npm run deploy (already logged in)                      │
│ 5. SAVE this URL too!                                       │
│ 6. Test in browser                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PART 6: Save & Commit (2 min)                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Create MY_DEMO_URLS.txt with both URLs                  │
│ 2. git add . && git commit && git push                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PART 7: Test Everything (5 min)                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Try multiple searches on POC 1                          │
│ 2. Upload multiple images to POC 2                         │
│ 3. Run ./test-deployment.sh                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PART 8: Backup Screenshots (5 min)                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Take screenshots of POC 1 working                       │
│ 2. Take screenshots of POC 2 working                       │
│ 3. Save in demo-screenshots/ folder                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    ✅ DONE! ✅
```

## Total Time: ~40 minutes

## Critical Files to Edit

### File 1: `semantic-search-worker/wrangler.toml`

**BEFORE:**
```toml
name = "semantic-search-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
# account_id = "your-account-id"    ← HAS # IN FRONT
# workers_dev = true                 ← HAS # IN FRONT

[ai]
binding = "AI"
```

**AFTER (with YOUR account ID):**
```toml
name = "semantic-search-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
account_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"    ← YOUR ID, NO #
workers_dev = true                                  ← NO #

[ai]
binding = "AI"    ← DON'T TOUCH THIS SECTION!
```

### File 2: `image-classification-worker/wrangler.toml`

**Same changes - same account ID**

---

## What Happens at Each Deploy

When you run `npm run deploy`:

```
1. Wrangler bundles your code
2. Uploads to Cloudflare
3. Distributes to 300+ global locations
4. Returns URL: https://WORKER-NAME.YOUR-SUBDOMAIN.workers.dev
5. Your code is now live worldwide!
```

---

## Important URLs to Bookmark

### Before Deploying:
- Cloudflare signup: https://dash.cloudflare.com/sign-up
- GitHub new repo: https://github.com/new

### After Deploying:
- Your POC 1: https://semantic-search-edge._________.workers.dev
- Your POC 2: https://image-classification-edge._________.workers.dev
- Cloudflare dashboard: https://dash.cloudflare.com

---

## Quick Command Reference

### One-Time Setup:
```bash
# Check prerequisites
node --version
npm --version
git --version

# Create project
mkdir edge-inference-acm-talk
cd edge-inference-acm-talk

# Initialize git
git init
```

### Deploy POC 1:
```bash
cd semantic-search-worker
npm install
# Edit wrangler.toml (add account_id)
npx wrangler login
npm run deploy
```

### Deploy POC 2:
```bash
cd ../image-classification-worker
npm install
# Edit wrangler.toml (same account_id)
npm run deploy
```

### Test:
```bash
# POC 1
curl -X POST https://YOUR-URL/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# POC 2
curl -X POST https://YOUR-URL/api/classify \
  -F "image=@test.jpg"
```

---

## Checklist - Print This!

Before starting:
- [ ] Node.js installed (node --version works)
- [ ] Git installed (git --version works)
- [ ] Downloaded all POC files from chat

Part 1: Setup
- [ ] Created edge-inference-acm-talk folder
- [ ] Moved all files into it
- [ ] Verified files with ls -la

Part 2: Git
- [ ] git init
- [ ] Created .gitignore
- [ ] Made first commit
- [ ] Created GitHub repo
- [ ] Pushed to GitHub

Part 3: Cloudflare
- [ ] Created Cloudflare account
- [ ] Verified email
- [ ] Got Account ID
- [ ] Saved Account ID somewhere safe

Part 4: POC 1
- [ ] cd semantic-search-worker
- [ ] npm install completed
- [ ] Edited wrangler.toml (added account_id)
- [ ] npx wrangler login completed
- [ ] npm run deploy succeeded
- [ ] Got URL, saved it
- [ ] Tested in browser - works!

Part 5: POC 2
- [ ] cd ../image-classification-worker
- [ ] npm install completed
- [ ] Edited wrangler.toml (same account_id)
- [ ] npm run deploy succeeded
- [ ] Got URL, saved it
- [ ] Tested in browser - works!

Part 6: Save
- [ ] Created MY_DEMO_URLS.txt
- [ ] Committed and pushed to GitHub

Part 7: Test
- [ ] Tested POC 1 with multiple queries
- [ ] Tested POC 2 with multiple images
- [ ] Ran test-deployment.sh
- [ ] All tests passed

Part 8: Backup
- [ ] Screenshots of POC 1 saved
- [ ] Screenshots of POC 2 saved
- [ ] Ready for demo!

---

## If You Get Stuck

**Check the detailed guide:** `COMPLETE_STEP_BY_STEP_GUIDE.md`

**Common issues:**
1. "npm install fails" → Clear cache: `npm cache clean --force`
2. "account_id required" → Check wrangler.toml, remove # before account_id
3. "AI binding not found" → Check [ai] section exists in wrangler.toml
4. "Login fails" → Try: `npx wrangler logout` then `npx wrangler login`

**Still stuck?** Read the troubleshooting section in COMPLETE_STEP_BY_STEP_GUIDE.md

---

**Follow the workflow diagram above, check off each item, and you'll have working demos in 40 minutes!**
