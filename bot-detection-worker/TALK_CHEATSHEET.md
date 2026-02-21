# 📋 ACM Talk Quick Reference Card
**Edge Bot Detection Demo - Cheat Sheet**

---

## 🔗 Your Live URLs (Fill these in!)

```
Demo Page:  https://edge-bot-detection._________________.workers.dev/
API:        https://edge-bot-detection._________________.workers.dev/api/check
Health:     https://edge-bot-detection._________________.workers.dev/health
```

---

## ⚡ Quick Commands (Have Terminal Ready)

### Show Normal Browser Request
```bash
curl https://YOUR-URL.workers.dev/api/check
```
**Expected**: `"botScore": 0.10-0.20, "classification": "human_high_confidence"`

### Show Obvious Bot
```bash
curl -A "Python Bot" https://YOUR-URL.workers.dev/api/check
```
**Expected**: `"botScore": 0.80-0.95, "classification": "bot_high_confidence"`

### Show Curl (Minimal Headers)
```bash
curl -A "curl/8.0" https://YOUR-URL.workers.dev/api/check
```
**Expected**: `"botScore": 0.85-0.95`

### Show Very Suspicious Request
```bash
curl -H "User-Agent:" https://YOUR-URL.workers.dev/api/check
```
**Expected**: `"botScore": 0.90+, signals: "missing_user_agent"`

---

## 📊 Key Numbers to Mention

| Metric | Value | vs Cloud |
|--------|-------|----------|
| Processing Time | **2-5ms** | 40x faster |
| Global Latency | **<50ms** | Everywhere |
| Cost (1M/day) | **$20/mo** | 1500x cheaper |
| Edge Locations | **300+** | Worldwide |
| Cold Start | **0-5ms** | vs 100-500ms |

---

## 🎯 Demo Flow (2 minutes total)

**[30 sec]** Browser Demo
1. Open demo page in browser
2. Click "Analyze This Request"
3. Point out: "3ms processing, running at edge"

**[30 sec]** API Demo (Terminal)
1. Run curl command (normal)
2. Show JSON, point out low score
3. Say: "This is a real browser"

**[30 sec]** Bot Detection
1. Run curl with "Python Bot" UA
2. Show high score (0.85+)
3. Say: "Detected in 3ms"

**[30 sec]** Show Signals (Browser)
1. Expand signals section on demo page
2. Point out what was detected
3. Say: "Heuristic + optional ML"

---

## 💬 Q&A Quick Answers

### "Why edge vs cloud?"
- **Latency**: 5ms vs 200ms (40x faster)
- **Cost**: $20 vs $30,000/month (1500x cheaper)
- **Security**: Block before origin server

### "What are the limits?"
- Script: 10MB max
- CPU: 50ms per request
- Memory: 128MB
- Free tier: 100K requests/day

### "How do you update?"
- `npm run deploy` - Live in 10 seconds
- Blue-green, canary, or A/B testing
- Zero downtime deployments

### "When NOT to use edge?"
- Complex ML models (>10MB)
- Needs database access
- Requires user history
- Low traffic (<1K/day)

### "Can it handle ML?"
- Yes! Workers AI available
- Small models work best
- Hybrid: Edge filter → Cloud ML
- This demo: Heuristics + optional ML

---

## 🐛 Emergency Troubleshooting

**Demo page won't load:**
- Check URL is correct
- Try `/health` endpoint
- Check Cloudflare dashboard

**API returns error:**
- Check `curl` syntax
- Verify URL has `/api/check`
- Check workers.dev subdomain

**Slow response (>100ms):**
- Might be first request (cold start)
- Try again - should be <10ms
- Check from different location

**"Not found" error:**
- Verify deployment: `npm run deploy`
- Check wrangler.toml has account_id
- Look at Cloudflare dashboard

---

## 📱 Backup Plan

**If live demo fails:**
1. Show screenshots (prepare beforehand)
2. Walk through code instead
3. Explain architecture with diagrams
4. Show test results (npm test output)

**Pre-Demo Checklist:**
- [ ] Test demo URL 30 mins before
- [ ] Test all curl commands
- [ ] Have terminal ready
- [ ] Browser dev tools open
- [ ] Backup slides ready

---

## 🎤 Key Talking Points

1. **Edge Computing Benefits**
   - "Runs in 300+ locations globally"
   - "Code executes closest to the user"
   - "Sub-10ms latency worldwide"

2. **Cost Advantage**
   - "Free tier: 100K requests/day"
   - "Paid: $0.50 per million requests"
   - "Compare: Cloud ML APIs cost $200-500 per million"

3. **Use Case**
   - "Perfect for: Security, APIs, high traffic"
   - "Not for: Complex ML, low traffic, stateful"
   - "Best: Hybrid edge + cloud approach"

4. **Performance**
   - "Processing: 2-5 milliseconds"
   - "Memory: ~5MB"
   - "Cold start: 0-5ms (vs 100-500ms Lambda)"

5. **Simplicity**
   - "Deploy: `npm run deploy`"
   - "Live globally in 10 seconds"
   - "No servers to manage"

---

## 📸 Screenshots to Take Before Talk

1. ✅ Demo page showing results
2. ✅ Browser dev tools (show headers)
3. ✅ Terminal with curl output
4. ✅ Test suite passing (100%)
5. ✅ Cloudflare dashboard (deployed)

---

## 🎬 Opening Lines (Choose One)

**Option 1 - Demo First:**
"Let me show you something running right now at the edge. *[Click Analyze]* See that? 3 milliseconds. This bot detection just ran in a data center closest to me, not in some distant cloud server."

**Option 2 - Problem First:**
"Imagine you need to block bots from your API. Traditional approach? Send every request to a cloud service, wait 200ms, pay $30,000/month. Edge approach? 5ms, $20/month. Let me show you."

**Option 3 - Stats First:**
"Edge inference: 40 times faster, 1500 times cheaper. Sounds impossible? It's not. Here's a working proof-of-concept."

---

## 🏁 Closing Lines (Choose One)

**Option 1 - Call to Action:**
"All code is available - you can deploy this in 5 minutes. Try it, break it, improve it."

**Option 2 - Limitation Honesty:**
"Edge isn't for everything. Large models, complex ML - those still need cloud. But for simple, fast, high-volume? Edge wins."

**Option 3 - Future Looking:**
"This is POC 1 - simple heuristics. POC 2 will show real ML models at the edge. Questions?"

---

## 📞 Resources to Share

- **Code**: [Your GitHub repo URL]
- **Cloudflare Docs**: developers.cloudflare.com/workers
- **Workers AI**: developers.cloudflare.com/workers-ai
- **Your Email**: [Your email for questions]

---

## ⏰ Timing Guide

- Introduction: 1 min
- Demo: 2 min  
- Architecture explanation: 2 min
- Q&A prep answers: 3 min
- Questions: 2 min
**Total: 10 minutes**

---

**Print this page and keep it next to you during the talk!**
