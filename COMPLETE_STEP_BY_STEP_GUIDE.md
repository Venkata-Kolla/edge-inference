# Complete Step-by-Step Deployment Guide
## From Zero to Deployed POCs (30-40 minutes)

This guide assumes you're starting fresh and walks through every single step.

---

## Prerequisites Check

Before starting, verify you have:

### 1. Check Node.js is Installed

Open terminal/command prompt and run:

```bash
node --version
npm --version
```

**Expected output:**
```
v18.x.x (or higher)
9.x.x (or higher)
```

**If not installed:**
- Download from: https://nodejs.org/
- Install the LTS version
- Restart terminal
- Run commands above again

### 2. Check Git is Installed

```bash
git --version
```

**Expected output:**
```
git version 2.x.x
```

**If not installed:**
- Download from: https://git-scm.com/downloads
- Install
- Restart terminal

---

## Part 1: Get the POC Files (5 minutes)

### Step 1.1: Download the POC Files

You already have the files from our chat. They should be in your downloads.

**Files you downloaded:**
- `semantic-search-worker/` folder
- `image-classification-worker/` folder  
- `bot-detection-worker/` folder
- `README.md`
- `DEPLOYMENT_GUIDE.md`
- `PROJECT_OVERVIEW.md`
- `ACM_TALK_SLIDES_15.md`
- `test-deployment.sh`

### Step 1.2: Create Project Folder

Open terminal and create your project folder:

```bash
# Create project folder
mkdir edge-inference-acm-talk
cd edge-inference-acm-talk
```

### Step 1.3: Move Downloaded Files Here

**Option A: Using Finder/File Explorer (Easiest)**
1. Open your Downloads folder
2. Find all the downloaded files/folders
3. Drag them into `edge-inference-acm-talk` folder

**Option B: Using Terminal**
```bash
# Adjust path to where your files actually are
mv ~/Downloads/semantic-search-worker .
mv ~/Downloads/image-classification-worker .
mv ~/Downloads/bot-detection-worker .
mv ~/Downloads/README.md .
mv ~/Downloads/DEPLOYMENT_GUIDE.md .
mv ~/Downloads/PROJECT_OVERVIEW.md .
mv ~/Downloads/ACM_TALK_SLIDES_15.md .
mv ~/Downloads/test-deployment.sh .
```

### Step 1.4: Verify Files Are There

```bash
ls -la
```

**You should see:**
```
README.md
DEPLOYMENT_GUIDE.md
PROJECT_OVERVIEW.md
ACM_TALK_SLIDES_15.md
test-deployment.sh
semantic-search-worker/
image-classification-worker/
bot-detection-worker/
```

✅ **Checkpoint:** All files are in your project folder

---

## Part 2: Set Up Git Repository (5 minutes)

### Step 2.1: Initialize Git Repo

```bash
# Make sure you're in the project folder
pwd
# Should show: .../edge-inference-acm-talk

# Initialize git
git init
```

**Output:**
```
Initialized empty Git repository in .../edge-inference-acm-talk/.git/
```

### Step 2.2: Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Cloudflare
.wrangler/
.dev.vars
.mf/

# Build
dist/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Editor
.vscode/
.idea/
EOF
```

### Step 2.3: Make First Commit

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Edge inference POCs for ACM talk"
```

### Step 2.4: Create GitHub Repository

**On GitHub.com:**

1. Go to: https://github.com/new
2. Repository name: `edge-inference-acm-talk` (or whatever you want)
3. Description: "Edge Inference POCs - Running ML at CDN PoPs"
4. **Keep it Public** (or Private if you prefer)
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

**You'll see instructions. Ignore them - follow the next step instead.**

### Step 2.5: Push to GitHub

**Copy the commands GitHub shows you**, which will be something like:

```bash
git remote add origin https://github.com/YOUR-USERNAME/edge-inference-acm-talk.git
git branch -M main
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username.**

✅ **Checkpoint:** Your code is now on GitHub!

**Verify:** Go to `https://github.com/YOUR-USERNAME/edge-inference-acm-talk` and you should see all your files.

---

## Part 3: Create Cloudflare Account (5 minutes)

**Do this NOW before deploying.**

### Step 3.1: Sign Up for Cloudflare

1. Go to: https://dash.cloudflare.com/sign-up
2. Enter your email address
3. Create a password
4. Click "Create Account"

### Step 3.2: Verify Email

1. Check your email inbox
2. Click the verification link from Cloudflare
3. You'll be redirected to Cloudflare dashboard

### Step 3.3: Get Your Account ID

**CRITICAL - You'll need this!**

1. In Cloudflare dashboard, click "Workers & Pages" in left sidebar
2. Look at the right side of the screen
3. You'll see "Account ID" with a string like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
4. Click the copy icon to copy it
5. **Paste it somewhere safe** (Notes app, text file, etc.)

**Example Account ID format:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

It's 32 characters (letters and numbers, no spaces).

✅ **Checkpoint:** You have your Cloudflare Account ID saved

---

## Part 4: Deploy POC 1 - Semantic Search (10 minutes)

### Step 4.1: Navigate to POC 1

```bash
cd semantic-search-worker
ls
```

**You should see:**
```
README.md
INSTALLATION.md
TALK_GUIDE.md
package.json
wrangler.toml
src/
test/
```

### Step 4.2: Install Dependencies

```bash
npm install
```

**This will take 30-60 seconds.**

**Expected output:**
```
added 234 packages, and audited 235 packages in 15s
```

**If you see warnings about vulnerabilities - ignore them for now.**

### Step 4.3: Configure Account ID

**Open `wrangler.toml` in your text editor:**

```bash
# Use whatever editor you prefer
code wrangler.toml        # VS Code
nano wrangler.toml        # Terminal editor
open -a TextEdit wrangler.toml   # Mac TextEdit
notepad wrangler.toml     # Windows Notepad
```

**Find these lines:**
```toml
name = "semantic-search-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
# account_id = "your-account-id"
# workers_dev = true
```

**Change to (paste YOUR account ID):**
```toml
name = "semantic-search-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
account_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  ← YOUR ACTUAL ID HERE
workers_dev = true

[ai]
binding = "AI"   ← MAKE SURE THIS SECTION STAYS!
```

**CRITICAL POINTS:**
- Remove the `#` before `account_id`
- Paste YOUR actual Account ID
- Remove the `#` before `workers_dev = true`
- **DO NOT TOUCH** the `[ai]` section - it must stay exactly as is

**Save the file.**

### Step 4.4: Login to Cloudflare

```bash
npx wrangler login
```

**What happens:**
1. Your browser will open automatically
2. You'll see Cloudflare login page
3. Log in with your Cloudflare credentials
4. Click "Allow" to authorize Wrangler
5. You'll see "Successfully logged in"
6. Return to terminal

**Expected terminal output:**
```
Attempting to login via OAuth...
Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth...
Successfully logged in.
```

✅ **Checkpoint:** You're logged into Cloudflare

### Step 4.5: Deploy POC 1!

```bash
npm run deploy
```

**This will take 10-30 seconds.**

**Expected output:**
```
⛅️ wrangler 3.x.x
------------------
Total Upload: xx.xx KiB / gzip: xx.xx KiB

✨ Compiled Worker successfully
🌍 Uploading...
✨ Uploaded semantic-search-edge (2.1 sec)
📡 Published semantic-search-edge (0.34 sec)
   https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev
🎉 Success!
Current Version ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**SAVE THIS URL!** Copy the `https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev` URL.

### Step 4.6: Test POC 1

**Browser Test:**

1. Copy the URL from deployment output
2. Paste it in your browser
3. You should see the demo page with search box
4. Try searching: "can't log in"
5. You should see results like:
   - "How to Reset Your Password" - 95%
   - "Account Locked - Troubleshooting" - 87%

**Terminal Test:**

```bash
# Replace YOUR-URL with your actual URL
curl -X POST https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "reset password"}'
```

**Expected:** JSON response with search results

✅ **Checkpoint:** POC 1 is deployed and working!

**Save your POC 1 URL somewhere safe.**

---

## Part 5: Deploy POC 2 - Image Classification (10 minutes)

### Step 5.1: Navigate to POC 2

```bash
# Go back to project root
cd ..

# Enter POC 2 directory
cd image-classification-worker
ls
```

### Step 5.2: Install Dependencies

```bash
npm install
```

**Wait 30-60 seconds.**

### Step 5.3: Configure Account ID

**Open `wrangler.toml`:**

```bash
code wrangler.toml        # or your preferred editor
```

**Same as before - find and edit:**

```toml
name = "image-classification-edge"
main = "src/index.js"
compatibility_date = "2024-01-10"
account_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  ← YOUR SAME ACCOUNT ID
workers_dev = true

[ai]
binding = "AI"   ← KEEP THIS!
```

**Save the file.**

### Step 5.4: Deploy POC 2!

**You're already logged in, so just deploy:**

```bash
npm run deploy
```

**Expected output:**
```
⛅️ wrangler 3.x.x
------------------
✨ Compiled Worker successfully
🌍 Uploading...
✨ Uploaded image-classification-edge (2.3 sec)
📡 Published image-classification-edge (0.42 sec)
   https://image-classification-edge.YOUR-SUBDOMAIN.workers.dev
🎉 Success!
```

**SAVE THIS URL TOO!**

### Step 5.5: Test POC 2

**Browser Test:**

1. Open the URL in browser
2. You should see upload page
3. Upload any image (cat, dog, food, etc.)
4. Click "Classify Image"
5. You should see predictions with confidence scores

**Terminal Test:**

First download a test image:
```bash
curl -o cat.jpg "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/300px-Cat03.jpg"
```

Then classify it:
```bash
curl -X POST https://image-classification-edge.YOUR-SUBDOMAIN.workers.dev/api/classify \
  -F "image=@cat.jpg"
```

**Expected:** JSON with predictions like "tabby cat", "tiger cat"

✅ **Checkpoint:** POC 2 is deployed and working!

---

## Part 6: Save Your URLs (2 minutes)

### Step 6.1: Create URLs File

```bash
# Go back to project root
cd ..

# Create a file with your URLs
cat > MY_DEMO_URLS.txt << EOF
# My Edge Inference Demo URLs

POC 1 - Semantic Search:
https://semantic-search-edge.YOUR-SUBDOMAIN.workers.dev

POC 2 - Image Classification:
https://image-classification-edge.YOUR-SUBDOMAIN.workers.dev

Deployed on: $(date)
EOF
```

**Edit this file and replace with your ACTUAL URLs.**

### Step 6.2: Commit to Git

```bash
# Add the new file
git add MY_DEMO_URLS.txt

# Commit
git commit -m "Add deployed demo URLs"

# Push to GitHub
git push
```

✅ **Checkpoint:** Everything is committed and backed up to GitHub!

---

## Part 7: Verify Everything Works (5 minutes)

### Step 7.1: Test POC 1 - Multiple Queries

Open your POC 1 URL in browser and try these searches:

1. "can't log in" → Should find password reset, account locked
2. "change payment method" → Should find billing information
3. "mobile app" → Should find app download info
4. "team permissions" → Should find team member docs

**Check:**
- [ ] All searches return relevant results
- [ ] Processing time is <300ms
- [ ] "ML Enabled: true" appears
- [ ] Semantic vs Keyword comparison shows

### Step 7.2: Test POC 2 - Multiple Images

Prepare 3-4 test images:
- Cat or dog photo
- Food (pizza, coffee, fruit)
- Car or vehicle
- Everyday object (phone, laptop, chair)

For each image:
1. Upload to POC 2 URL
2. Click "Classify Image"
3. Check predictions make sense
4. Click "Check Safety"
5. Verify processing time <500ms

### Step 7.3: Run Automated Test

```bash
# Go to project root
cd ..

# Make test script executable (if not already)
chmod +x test-deployment.sh

# Run it
./test-deployment.sh
```

**When prompted, enter your two URLs.**

**Expected:** Green checkmarks and successful test results

---

## Part 8: Take Backup Screenshots (5 minutes)

**Why:** In case internet fails during your talk, you have proof the demos work.

### For POC 1:
1. Open POC 1 URL
2. Search "can't log in"
3. Take screenshot of results
4. Search "change payment"
5. Take screenshot
6. Save as: `poc1-semantic-search-demo.png`

### For POC 2:
1. Open POC 2 URL
2. Upload cat photo
3. Click "Classify Image"
4. Take screenshot of predictions
5. Click "Check Safety"
6. Take screenshot of safety results
7. Save as: `poc2-image-classification-demo.png`

**Put screenshots in a folder called `demo-screenshots/`**

---

## Summary - What You Now Have

✅ **Both POCs deployed and working**
- POC 1: Semantic Search at edge
- POC 2: Image Classification at edge

✅ **Git repository set up**
- Local git repo initialized
- Pushed to GitHub
- All code backed up

✅ **Cloudflare account created**
- Account ID saved
- Logged in with Wrangler
- Workers deployed globally

✅ **URLs saved**
- Both demo URLs documented
- Ready for your presentation

✅ **Tested and verified**
- Both POCs working
- Screenshots taken as backup
- Ready to demo

---

## Your Next Steps

### Before Your Talk:

1. **Practice demos (30 minutes)**
   - Run through both demos 2-3 times
   - Time yourself (should be ~5 min each)
   - Get comfortable with the flow

2. **Read documentation (1 hour)**
   - `semantic-search-worker/TALK_GUIDE.md`
   - `image-classification-worker/TALK_GUIDE.md`
   - `PROJECT_OVERVIEW.md`

3. **Prepare materials**
   - Bookmark both URLs in browser
   - Have curl commands ready in terminal
   - Put screenshots in easy-to-find folder

### Day Before Talk:

- [ ] Test both URLs still work
- [ ] Try all test queries/images again
- [ ] Review your notes
- [ ] Prepare backup plan (screenshots)

---

## Troubleshooting

### "npm install" fails

**Try:**
```bash
npm cache clean --force
npm install
```

### "account_id is required" error

**Fix:**
1. Open `wrangler.toml`
2. Make sure `account_id = "..."` line has no `#` in front
3. Make sure you pasted your actual Account ID
4. Save file
5. Try `npm run deploy` again

### "AI binding not found" error

**Fix:**
1. Open `wrangler.toml`
2. Make sure this section exists:
   ```toml
   [ai]
   binding = "AI"
   ```
3. Save file
4. Try `npm run deploy` again

### Deployment succeeds but URL doesn't work

**Wait 30 seconds** - it takes a moment to propagate globally.

Then check:
1. URL is correct (no typos)
2. Try in incognito/private browser window
3. Check Cloudflare status: https://www.cloudflarestatus.com

### "Rate limit exceeded" during testing

**You hit the free tier limit (10,000 neurons/day)**

**Solutions:**
- Wait until tomorrow (resets at midnight UTC)
- Upgrade to paid Workers ($5/month)
- Test less frequently

---

## Quick Reference - Commands You'll Use

### Deploy POC 1:
```bash
cd semantic-search-worker
npm run deploy
```

### Deploy POC 2:
```bash
cd image-classification-worker
npm run deploy
```

### Test POC 1:
```bash
curl -X POST https://YOUR-URL/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

### Test POC 2:
```bash
curl -X POST https://YOUR-URL/api/classify \
  -F "image=@test.jpg"
```

### Check logs (real-time):
```bash
npx wrangler tail
```

### Update code and redeploy:
```bash
# Make changes to src/index.js
npm run deploy
```

---

## Your URLs Template

**Fill this in and keep it handy:**

```
POC 1 - Semantic Search:
https://semantic-search-edge.________________.workers.dev

POC 2 - Image Classification:
https://image-classification-edge.________________.workers.dev

Account ID: ________________________________

Deployed on: _______________
```

---

## You're Done! 🎉

You now have:
- ✅ Working POCs deployed globally
- ✅ Git repo with all code
- ✅ Cloudflare account set up
- ✅ Demo URLs ready
- ✅ Everything tested

**Total time:** ~40 minutes

**Next:** Practice your demos and prepare your presentation!

**Good luck with your ACM talk! 🚀**
