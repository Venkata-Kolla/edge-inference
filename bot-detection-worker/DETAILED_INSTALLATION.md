# Complete Installation Guide - Step by Step

This guide assumes you're starting from scratch. Follow every step in order.

---

## What You're Building

You're creating a bot detection system that runs on **Cloudflare Workers** - a service that lets you run code at the "edge" (close to users, in data centers around the world). Think of it like a mini-server that runs in 300+ locations globally.

**Why Cloudflare?**
- Free tier is generous (100,000 requests/day)
- Fast deployment (code runs globally in seconds)
- Industry leader for edge computing
- Simple to use

---

## Step 1: Install Node.js (Required)

Node.js is a JavaScript runtime we need to run our deployment tools.

### Windows:

1. **Go to**: https://nodejs.org/
2. **Click**: The big green button that says "XX.X.X LTS" (Recommended for Most Users)
3. **Download**: The `.msi` installer will download
4. **Run**: Double-click the downloaded file
5. **Install**: Click "Next" through all steps (default settings are fine)
6. **Finish**: Click "Finish" when done

### Mac:

1. **Go to**: https://nodejs.org/
2. **Click**: The big green button that says "XX.X.X LTS"
3. **Download**: The `.pkg` installer will download
4. **Run**: Double-click the downloaded file
5. **Install**: Follow the installation wizard (defaults are fine)
6. **Finish**: Close the installer

### Linux (Ubuntu/Debian):

```bash
# Update package list
sudo apt update

# Install Node.js
sudo apt install nodejs npm -y

# Verify installation
node --version
```

### Verify Installation (All Platforms):

1. **Open Terminal/Command Prompt**:
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Mac: Press `Cmd + Space`, type "Terminal", press Enter
   - Linux: Press `Ctrl + Alt + T`

2. **Type this command**:
   ```bash
   node --version
   ```

3. **You should see**: Something like `v20.11.0` (version number may differ)

4. **Type this command**:
   ```bash
   npm --version
   ```

5. **You should see**: Something like `10.2.4`

**✅ If you see version numbers, Node.js is installed correctly!**

**❌ If you see "command not found"**: Restart your terminal and try again. If still not working, reinstall Node.js.

---

## Step 2: Create Cloudflare Account

Cloudflare is the CDN (Content Delivery Network) service we're using.

### 2.1: Sign Up

1. **Go to**: https://dash.cloudflare.com/sign-up

2. **Fill out the form**:
   - Email address: Your email
   - Password: Choose a strong password
   - Click "Create Account"

3. **Verify email**:
   - Check your inbox
   - Click the verification link in the email from Cloudflare
   - You'll be taken to the Cloudflare dashboard

### 2.2: Skip Domain Setup (Optional)

When you first log in, Cloudflare might ask you to add a domain/website:
- **Click**: "Skip this step" or "I don't have a site yet"
- **Why?**: We're using Workers, which don't require a domain

### 2.3: Navigate to Workers

1. **Look at the left sidebar** in your Cloudflare dashboard
2. **Click**: "Workers & Pages"
3. **You should see**: A page about Cloudflare Workers

### 2.4: Get Your Account ID

This is critical - you'll need this in a moment.

1. **On the Workers & Pages page**, look at the right sidebar
2. **Find**: "Account ID" 
3. **Click**: The copy icon next to your Account ID
4. **Save it**: Paste it somewhere (Notepad, Notes app) - you'll need this soon

**What it looks like**: A long string like `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Where to find it if you don't see it**:
- Click your profile icon (top right)
- Click "My Profile"  
- Scroll down to "Account ID"
- Copy the value

---

## Step 3: Download the Project Files

You should already have the `bot-detection-worker` folder from earlier. If not:

### Option A: You Have the Files Already

The files should be in a folder called `bot-detection-worker` - that's perfect, proceed to Step 4.

### Option B: You Need to Download

If you're missing the files, I can regenerate them. Let me know and I'll create a ZIP file for you.

---

## Step 4: Open Project in Terminal

Now we need to navigate to the project folder in your terminal.

### Windows:

**Method 1 - Easy Way**:
1. Open File Explorer
2. Navigate to the `bot-detection-worker` folder
3. Click in the address bar at the top
4. Type `cmd` and press Enter
5. A command prompt will open in that folder

**Method 2 - Command Line**:
```bash
# Change to your directory (replace with actual path)
cd C:\Users\YourName\Downloads\bot-detection-worker
```

### Mac/Linux:

**Method 1 - Easy Way**:
1. Open Finder/File Browser
2. Navigate to the `bot-detection-worker` folder
3. Right-click the folder
4. Select "New Terminal at Folder" (Mac) or "Open in Terminal" (Linux)

**Method 2 - Command Line**:
```bash
# Change to your directory (replace with actual path)
cd ~/Downloads/bot-detection-worker
```

### Verify You're in the Right Place:

Type this command:
```bash
ls
```
(On Windows Command Prompt, use `dir` instead)

**You should see files like**:
- `package.json`
- `wrangler.toml`
- `README.md`
- `src/` (folder)
- `test/` (folder)

**✅ If you see these files, you're in the right place!**

**❌ If not**: You're in the wrong directory. Use `cd` to navigate to the correct folder.

---

## Step 5: Install Project Dependencies

Now we install the tools needed to deploy your Worker.

### Run This Command:

```bash
npm install
```

### What This Does:
- Downloads Wrangler (Cloudflare's deployment tool)
- Sets up the project locally
- Creates a `node_modules` folder (you'll see this appear)

### What You'll See:

```
npm WARN deprecated ...
added 234 packages in 15s
```

This is normal! The warnings are fine.

**⏱️ This takes**: 30-60 seconds depending on your internet speed

**✅ Success**: You see "added XXX packages"

**❌ Error**: "npm: command not found" → Go back to Step 1, Node.js isn't installed properly

---

## Step 6: Configure Your Account ID

Remember that Account ID you copied in Step 2.4? Now we use it.

### 6.1: Open the Configuration File

You need to edit `wrangler.toml`

**Windows**:
- Right-click `wrangler.toml`
- Select "Open with" → "Notepad"

**Mac**:
- Right-click `wrangler.toml`
- Select "Open with" → "TextEdit"

**Linux**:
```bash
nano wrangler.toml
# or
gedit wrangler.toml
```

### 6.2: Add Your Account ID

You'll see this in the file:

```toml
name = "edge-bot-detection"
main = "src/index.js"
compatibility_date = "2024-01-10"
compatibility_flags = ["nodejs_compat"]

# Account details (replace with your own)
# account_id = "your-account-id"
# workers_dev = true
```

**Change it to this** (remove the # symbols):

```toml
name = "edge-bot-detection"
main = "src/index.js"
compatibility_date = "2024-01-10"
compatibility_flags = ["nodejs_compat"]

# Account details
account_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  # ← PASTE YOUR ACCOUNT ID HERE
workers_dev = true
```

**Important**:
- Replace `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` with YOUR actual Account ID
- Remove the `#` at the start of both lines
- Keep the quotes around your account ID

### 6.3: Save the File

- Press `Ctrl + S` (Windows/Linux) or `Cmd + S` (Mac)
- Close the text editor

---

## Step 7: Login to Cloudflare

Now we connect your computer to your Cloudflare account.

### Run This Command:

```bash
npx wrangler login
```

### What Happens:

1. **Terminal will show**:
   ```
   Attempting to login via OAuth...
   Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth...
   ```

2. **Your browser will open** automatically

3. **You'll see a Cloudflare page** saying:
   - "Wrangler wants to access your Cloudflare account"
   - It will show what permissions it needs

4. **Click**: "Allow"

5. **You'll see**: "Success! You are now logged in."

6. **Go back to your terminal**: It will show:
   ```
   Successfully logged in.
   ```

**✅ Success**: Terminal says "Successfully logged in"

**❌ Browser didn't open**: Copy the URL from the terminal and paste it in your browser manually

**❌ Error "Not authorized"**: Make sure you're logged into the same Cloudflare account in your browser

---

## Step 8: Test Locally (Optional but Recommended)

Before deploying globally, let's test it on your computer.

### Run This Command:

```bash
npm run dev
```

### What You'll See:

```
⛅️ wrangler 3.22.0
------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Test It:

1. **Open your browser**
2. **Go to**: http://localhost:8787
3. **You should see**: The purple bot detection demo page
4. **Click**: "Analyze This Request"
5. **You should see**: Your bot score (probably low since you're a real browser)

**✅ Success**: The page loads and shows you a bot score!

**To stop the local server**:
- Go back to your terminal
- Press `Ctrl + C`

---

## Step 9: Deploy to Cloudflare (Make it Live!)

Now we make it accessible from anywhere in the world.

### Run This Command:

```bash
npm run deploy
```

or

```bash
npx wrangler deploy
```

### What You'll See:

```
⛅️ wrangler 3.22.0
------------------
Uploading...
Uploaded edge-bot-detection (1.2 sec)
Published edge-bot-detection (0.3 sec)
  https://edge-bot-detection.your-subdomain.workers.dev
Current Deployment ID: abc123def456
```

### IMPORTANT - Copy Your URL:

You'll see a line like:
```
https://edge-bot-detection.your-subdomain.workers.dev
```

**This is your live URL!** 

- Copy it
- Save it somewhere
- This is what you'll demo in your talk

**⏱️ This takes**: 5-15 seconds

**✅ Success**: You see a `.workers.dev` URL

---

## Step 10: Test Your Live Deployment

Let's make sure it works!

### 10.1: Test in Browser

1. **Open your browser**
2. **Go to your URL**: `https://edge-bot-detection.your-subdomain.workers.dev`
3. **You should see**: The demo page (same as local)
4. **Click**: "Analyze This Request"
5. **You should see**: Your bot score

### 10.2: Test the API

Open a new terminal window and run:

```bash
curl https://edge-bot-detection.your-subdomain.workers.dev/api/check
```

Replace `edge-bot-detection.your-subdomain.workers.dev` with your actual URL.

**You should see**: A JSON response like:

```json
{
  "botScore": 0.15,
  "classification": "human_high_confidence",
  "confidence": 0.70,
  ...
}
```

### 10.3: Test as a Bot

```bash
curl -A "Python Bot" https://edge-bot-detection.your-subdomain.workers.dev/api/check
```

**You should see**: A higher bot score (>0.6)

---

## Step 11: Run the Test Suite (Optional)

Let's run automated tests to make sure everything works.

### Run This Command:

```bash
WORKER_URL=https://your-actual-url.workers.dev npm test
```

**Windows users**: Use this instead:
```bash
set WORKER_URL=https://your-actual-url.workers.dev && npm test
```

### What You'll See:

```
🚀 Starting Bot Detection Tests
Target: https://edge-bot-detection.your-subdomain.workers.dev

============================================================
Testing: Legitimate Chrome Browser
============================================================

📊 Results:
   Bot Score: 15.0%
   Classification: human_high_confidence
   Confidence: 70.0%
   Processing Time: 3ms
   Network Latency: 45ms
   ML Enabled: No

✓ Expected: <0.3 → PASS

...

📈 TEST SUMMARY
============================================================
Total Tests: 10
Passed: 10
Failed: 0
Success Rate: 100%

⚡ Performance:
   Avg Network Latency: 52.34ms
   Avg Processing Time: 3.12ms
```

**✅ Success**: 100% success rate, all tests pass

---

## Troubleshooting Common Issues

### Issue: "npm: command not found"

**Problem**: Node.js not installed or not in PATH

**Solution**:
1. Reinstall Node.js from nodejs.org
2. Restart your terminal
3. Try again

### Issue: "wrangler: command not found"

**Problem**: Dependencies not installed

**Solution**:
```bash
npm install
```

### Issue: "No account_id found"

**Problem**: Forgot to add account ID to wrangler.toml

**Solution**:
1. Open `wrangler.toml`
2. Add your account ID (see Step 6)
3. Make sure to remove the `#` symbol

### Issue: "Not authenticated"

**Problem**: Not logged in to Cloudflare

**Solution**:
```bash
npx wrangler login
```

Follow the browser prompts again.

### Issue: "Worker name already taken"

**Problem**: Someone else is using the name "edge-bot-detection"

**Solution**:
1. Open `wrangler.toml`
2. Change the name:
   ```toml
   name = "my-unique-bot-detector-123"  # Pick something unique
   ```
3. Save and deploy again

### Issue: Deployment hangs/freezes

**Solution**:
1. Press `Ctrl + C` to cancel
2. Check your internet connection
3. Try again:
   ```bash
   npm run deploy
   ```

### Issue: Local dev shows "port already in use"

**Solution**:
```bash
# Kill the process on port 8787
# Windows:
netstat -ano | findstr :8787
taskkill /PID <PID_NUMBER> /F

# Mac/Linux:
lsof -ti:8787 | xargs kill -9

# Try again:
npm run dev
```

---

## What You Have Now

🎉 **Congratulations!** You now have:

✅ A live bot detection system running globally
✅ A demo page at: `https://edge-bot-detection.your-subdomain.workers.dev`
✅ An API endpoint at: `https://your-url.workers.dev/api/check`
✅ Code running in 300+ data centers worldwide
✅ Processing requests in 2-5 milliseconds

## Using Your Deployment

### For Your ACM Talk:

1. **Demo URL**: Use `https://your-url.workers.dev/` (show in browser)
2. **API Demo**: Use curl commands (show in terminal)
3. **Performance**: Point out the 2-5ms processing time

### Share with Others:

Anyone can access your demo at your `.workers.dev` URL!

### Make Changes:

1. Edit `src/index.js`
2. Run `npm run deploy`
3. Changes are live in ~10 seconds

---

## Next Steps After Installation

### Learn More:

- Read `README.md` - Complete documentation
- Read `TALK_QA.md` - ACM talk preparation
- Read `INTEGRATION.md` - How to integrate into apps

### Customize:

- Modify detection rules in `src/index.js`
- Adjust thresholds (currently 0.8 for high confidence)
- Add your own signals

### Monitor:

```bash
# Watch live logs
npm run tail
```

Or visit: https://dash.cloudflare.com → Workers & Pages → edge-bot-detection → Logs

---

## Cost & Limits

**Free Tier**:
- 100,000 requests per day
- 10 minutes CPU time per day
- Unlimited bandwidth

**For Your Demo**:
- Should stay well within free tier
- No credit card required
- No surprise charges

**Paid Tier** (if needed):
- $5/month
- 10 million requests included
- $0.50 per additional million

---

## Getting Help

If you get stuck:

1. **Check**: The troubleshooting section above
2. **Read**: The error message carefully
3. **Search**: The error on Google
4. **Ask**: Cloudflare Discord (https://discord.gg/cloudflaredev)
5. **Docs**: https://developers.cloudflare.com/workers/

---

## Final Checklist

Before your ACM talk, verify:

- [ ] Can access demo page in browser
- [ ] "Analyze This Request" button works
- [ ] API endpoint returns JSON
- [ ] curl commands work
- [ ] Processing time shows <10ms
- [ ] Test suite passes (100% success)
- [ ] URL is saved/bookmarked

**You're ready to demo! 🚀**
