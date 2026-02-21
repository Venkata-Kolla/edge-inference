# ✅ Pre-Talk Verification Checklist

Run through this checklist 30 minutes before your ACM talk to ensure everything works perfectly.

---

## 📅 Day Before Talk

### Account & Deployment Verification

- [ ] **Cloudflare account is active**
  - Go to https://dash.cloudflare.com
  - Can you log in?
  - Is your Worker visible under "Workers & Pages"?

- [ ] **Worker is deployed**
  ```bash
  # Check deployment status
  npx wrangler deployments list
  ```
  Should show recent deployment (within last few days)

- [ ] **Know your URLs**
  - Demo page: `https://edge-bot-detection.________.workers.dev/`
  - API endpoint: `https://edge-bot-detection.________.workers.dev/api/check`
  - Write them down! Save in your phone notes!

---

## ⏰ 30 Minutes Before Talk

### Test All Endpoints

#### 1. Health Check
```bash
curl https://YOUR-URL.workers.dev/health
```
**Expected:**
```json
{"status":"ok","timestamp":1704902400000}
```
- [ ] ✅ Returns 200 OK
- [ ] ✅ Shows current timestamp

#### 2. Demo Page Load
- [ ] Open `https://YOUR-URL.workers.dev/` in browser
- [ ] ✅ Page loads (purple gradient background)
- [ ] ✅ "Analyze This Request" button visible
- [ ] ✅ No JavaScript errors (check browser console: F12)

#### 3. Demo Functionality
- [ ] Click "Analyze This Request" button
- [ ] ✅ Results appear (within 2-3 seconds)
- [ ] ✅ Bot score shows (probably 0.10-0.30 for real browser)
- [ ] ✅ Processing time shows (<10ms)
- [ ] ✅ Signal breakdown displays

#### 4. API Test - Normal Request
```bash
curl https://YOUR-URL.workers.dev/api/check
```
- [ ] ✅ Returns JSON response
- [ ] ✅ `botScore` is low (0.10-0.30)
- [ ] ✅ `classification` says "human" or "human_likely"
- [ ] ✅ `processingTimeMs` is 2-10ms

#### 5. API Test - Bot Request
```bash
curl -A "Python Bot" https://YOUR-URL.workers.dev/api/check
```
- [ ] ✅ Returns JSON response
- [ ] ✅ `botScore` is high (0.70-0.95)
- [ ] ✅ `classification` says "bot" 
- [ ] ✅ Signal breakdown shows "bot_user_agent"

#### 6. API Test - No User-Agent
```bash
curl -H "User-Agent:" https://YOUR-URL.workers.dev/api/check
```
- [ ] ✅ `botScore` is very high (0.85-1.0)
- [ ] ✅ Shows "missing_user_agent" signal

---

### Performance Verification

#### 7. Latency Check
Run this command 3 times:
```bash
time curl -s https://YOUR-URL.workers.dev/api/check > /dev/null
```

Expected times:
- First request (cold start): <100ms
- Second request: <50ms  
- Third request: <50ms

- [ ] ✅ Average response time <50ms
- [ ] ✅ Processing time in JSON is <10ms

#### 8. Test Suite (Optional but Recommended)
```bash
WORKER_URL=https://YOUR-URL.workers.dev npm test
```

- [ ] ✅ All 10 tests pass
- [ ] ✅ Success rate: 100%
- [ ] ✅ Average processing time <10ms

---

### Browser Testing

#### 9. Test in Multiple Browsers

- [ ] **Chrome/Edge**: Demo page works
- [ ] **Firefox**: Demo page works
- [ ] **Safari** (if available): Demo page works

All should show:
- Clean UI rendering
- Button clickable
- Results display correctly

#### 10. Developer Tools Check

Open browser dev tools (F12):

**Console Tab:**
- [ ] ✅ No JavaScript errors (red messages)
- [ ] ✅ No failed network requests

**Network Tab:**
- [ ] Click "Analyze" button
- [ ] ✅ Request to `/api/check` shows
- [ ] ✅ Status code: 200
- [ ] ✅ Response time: <100ms
- [ ] ✅ Headers show `x-processing-time`

---

### Content Preparation

#### 11. Screenshots & Backups

Take screenshots of:
- [ ] ✅ Demo page with results showing
- [ ] ✅ Browser dev tools (Network tab)
- [ ] ✅ Terminal with successful curl output
- [ ] ✅ Test suite passing (100% success)
- [ ] ✅ Cloudflare dashboard showing deployed worker

Save all screenshots to:
- Desktop folder named "ACM-Talk-Backup"
- Phone (in case laptop fails)

#### 12. Have These Files Open/Ready

- [ ] ✅ Browser tab: Your demo URL
- [ ] ✅ Browser tab: Cloudflare dashboard
- [ ] ✅ Terminal window with curl commands ready
- [ ] ✅ Text editor: `TALK_CHEATSHEET.md` open
- [ ] ✅ Text editor: `src/index.js` (to show code if needed)

---

### Hardware & Environment

#### 13. Laptop Setup

- [ ] ✅ Laptop fully charged (or plugged in)
- [ ] ✅ Power adapter with you
- [ ] ✅ Internet connection works
- [ ] ✅ Backup internet (phone hotspot enabled)

#### 14. Presentation Setup

- [ ] ✅ Screen resolution set to presentation mode
- [ ] ✅ Font size large enough for audience
- [ ] ✅ Terminal font size increased:
  - Mac: `Cmd + +`
  - Windows: `Ctrl + +`
  - Should be readable from 20 feet away

- [ ] ✅ Browser zoom set to 125-150%
  - Make text readable for audience
  - `Ctrl/Cmd + +` to zoom in

#### 15. Demo Script Ready

Terminal commands saved in a file (demo-commands.txt):
```bash
# Test 1: Normal browser
curl https://YOUR-URL.workers.dev/api/check

# Test 2: Python bot
curl -A "Python Bot" https://YOUR-URL.workers.dev/api/check

# Test 3: No user agent
curl -H "User-Agent:" https://YOUR-URL.workers.dev/api/check

# Health check
curl https://YOUR-URL.workers.dev/health
```

- [ ] ✅ File created and tested
- [ ] ✅ Can copy/paste commands quickly

---

### Contingency Planning

#### 16. Backup Plan Ready

If live demo fails, you have:

- [ ] ✅ Screenshots of working demo
- [ ] ✅ Pre-recorded video (optional)
- [ ] ✅ Slides explaining architecture
- [ ] ✅ Code walkthrough prepared
- [ ] ✅ Can explain without live demo

#### 17. Internet Contingency

- [ ] ✅ Phone hotspot configured
- [ ] ✅ Know how to tether laptop
- [ ] ✅ Alternative: Run local version
  ```bash
  npm run dev
  # Then demo on localhost:8787
  ```

#### 18. Time Check

Verify you can complete demo in allocated time:

- [ ] ✅ Practice full demo: <2 minutes
- [ ] ✅ Can answer Q&A questions confidently
- [ ] ✅ Know which parts to skip if short on time

---

## ⏰ 5 Minutes Before Talk

### Final Checks

- [ ] Close unnecessary applications
- [ ] Quit Slack, email, notifications
- [ ] Do Not Disturb mode ON
- [ ] Volume muted (or demo audio ready)
- [ ] Full screen browser ready
- [ ] Terminal positioned next to browser

### Quick Test

Run ONE final test:
```bash
curl https://YOUR-URL.workers.dev/health
```

- [ ] ✅ Returns success

**IF THIS FAILS:**
- Don't panic
- Use backup screenshots
- Explain: "The demo was working, let me show you what it does..."
- Proceed with slides

---

## 🎬 You're Ready When...

✅ All items above are checked
✅ Demo loads in <2 seconds
✅ API responds in <50ms  
✅ You're confident in your backup plan
✅ Presentation is under time limit

---

## 🆘 Emergency Contacts

**If something breaks:**

1. **Check Cloudflare Status**
   - https://www.cloudflarestatus.com
   - If Cloudflare is down, use backup plan

2. **Quick Redeploy**
   ```bash
   npm run deploy
   # Takes 10 seconds
   ```

3. **Switch to Local**
   ```bash
   npm run dev
   # Demo on localhost instead
   ```

4. **Worst Case: Skip Demo**
   - Use screenshots
   - Walk through architecture
   - Show code instead
   - Talk still works!

---

## ✨ Final Confidence Boost

You've built:
- ✅ Working bot detection
- ✅ Running globally at edge
- ✅ 2-5ms response times
- ✅ 1500x cheaper than cloud
- ✅ Production-ready code

**This is impressive work. You've got this! 🚀**

---

## 📝 Notes Section

Use this space for your own notes:

**My Worker URL:**
_____________________________________________

**Account ID:**
_____________________________________________

**Things to remember:**
- 
- 
- 

**Questions I expect:**
- 
- 
- 

**Demo room details:**
- WiFi network: _______________
- WiFi password: _______________
- Projector connection: _______________

---

**Print this page and check off items as you complete them!**

**Last updated:** [Add timestamp when you verify everything works]
