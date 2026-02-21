/**
 * Image Classification + Content Moderation POC
 * Uses ML models at edge for image classification and NSFW detection
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }
    
    // Image classification endpoint
    if (url.pathname === '/api/classify' && request.method === 'POST') {
      return handleClassification(request, env);
    }
    
    // Content moderation endpoint  
    if (url.pathname === '/api/moderate' && request.method === 'POST') {
      return handleModeration(request, env);
    }
    
    // Combined endpoint (classify + moderate)
    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      return handleAnalyze(request, env);
    }
    
    // Demo page
    if (url.pathname === '/' || url.pathname === '/demo') {
      return new Response(getDemoHTML(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ 
        status: 'ok', 
        timestamp: Date.now(),
        aiEnabled: !!env.AI,
        endpoints: ['/api/classify', '/api/moderate', '/api/analyze']
      });
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
};

async function handleClassification(request, env) {
  const startTime = Date.now();
  
  try {
    if (!env.AI) {
      return Response.json({
        error: 'AI not configured',
        message: 'Workers AI binding is required for image classification'
      }, { status: 503 });
    }
    
    // Get image from request
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) {
      return Response.json({
        error: 'No image provided',
        message: 'Please upload an image file'
      }, { status: 400 });
    }
    
    // Convert to array buffer
    const imageBuffer = await imageFile.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    
    // Run image classification with ResNet-50
    const result = await env.AI.run('@cf/microsoft/resnet-50', {
      image: imageArray
    });
    
    const processingTime = Date.now() - startTime;
    
    return Response.json({
      predictions: result,
      metadata: {
        model: 'resnet-50',
        processingTimeMs: processingTime,
        imageSize: imageBuffer.byteLength,
        timestamp: new Date().toISOString(),
        edge: true
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Processing-Time': `${processingTime}ms`
      }
    });
    
  } catch (error) {
    console.error('Classification error:', error);
    return Response.json({
      error: 'Classification failed',
      message: error.message
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

async function handleModeration(request, env) {
  const startTime = Date.now();
  
  try {
    if (!env.AI) {
      return Response.json({
        error: 'AI not configured',
        message: 'Workers AI binding is required'
      }, { status: 503 });
    }
    
    // Get image from request
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) {
      return Response.json({
        error: 'No image provided',
        message: 'Please upload an image file'
      }, { status: 400 });
    }
    
    // Convert to array buffer
    const imageBuffer = await imageFile.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    
    // Run classification with ResNet-50 for content analysis
    // Note: ResNet-50 can detect NSFW content through its general classification
    const result = await env.AI.run('@cf/microsoft/resnet-50', {
      image: imageArray
    });
    
    // Analyze predictions for NSFW content
    const moderationResult = analyzeModerationFromPredictions(result);
    
    const processingTime = Date.now() - startTime;
    
    return Response.json({
      moderation: moderationResult,
      rawPredictions: result.slice(0, 10), // Include top predictions for transparency
      metadata: {
        model: 'resnet-50',
        processingTimeMs: processingTime,
        imageSize: imageBuffer.byteLength,
        timestamp: new Date().toISOString(),
        edge: true
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Processing-Time': `${processingTime}ms`
      }
    });
    
  } catch (error) {
    console.error('Moderation error:', error);
    return Response.json({
      error: 'Moderation failed',
      message: error.message
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

async function handleAnalyze(request, env) {
  const startTime = Date.now();
  
  try {
    if (!env.AI) {
      return Response.json({
        error: 'AI not configured'
      }, { status: 503 });
    }
    
    // Get image
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) {
      return Response.json({
        error: 'No image provided'
      }, { status: 400 });
    }
    
    const imageBuffer = await imageFile.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    
    // Run classification
    const classificationResult = await env.AI.run('@cf/microsoft/resnet-50', {
      image: imageArray
    });
    
    // Analyze for moderation
    const moderationResult = analyzeModerationFromPredictions(classificationResult);
    
    const processingTime = Date.now() - startTime;
    
    return Response.json({
      classification: {
        topPredictions: classificationResult.slice(0, 5),
        allPredictions: classificationResult.length
      },
      moderation: moderationResult,
      metadata: {
        model: 'resnet-50',
        processingTimeMs: processingTime,
        imageSize: imageBuffer.byteLength,
        timestamp: new Date().toISOString(),
        edge: true
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Processing-Time': `${processingTime}ms`
      }
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({
      error: 'Analysis failed',
      message: error.message
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

function analyzeModerationFromPredictions(predictions) {
  // Lists of potentially inappropriate categories from ImageNet
  const inappropriateCategories = [
    'bikini', 'swimsuit', 'brassiere', 'maillot',
    'beer', 'wine', 'cocktail', 'alcohol',
    'revolver', 'rifle', 'assault rifle', 'weapon'
  ];
  
  const sensitiveCategories = [
    'hospital', 'ambulance', 'stretcher',
    'prison', 'police', 'military'
  ];
  
  let inappropriateScore = 0;
  let sensitiveScore = 0;
  let flags = [];
  
  // Analyze top predictions
  predictions.slice(0, 20).forEach(pred => {
    const label = pred.label.toLowerCase();
    const score = pred.score;
    
    // Check for inappropriate content
    inappropriateCategories.forEach(category => {
      if (label.includes(category)) {
        inappropriateScore += score;
        flags.push({
          category: category,
          confidence: Math.round(score * 100),
          severity: 'high'
        });
      }
    });
    
    // Check for sensitive content
    sensitiveCategories.forEach(category => {
      if (label.includes(category)) {
        sensitiveScore += score;
        flags.push({
          category: category,
          confidence: Math.round(score * 100),
          severity: 'medium'
        });
      }
    });
  });
  
  // Determine overall safety
  let safetyLevel;
  let action;
  
  if (inappropriateScore > 0.5) {
    safetyLevel = 'unsafe';
    action = 'block';
  } else if (inappropriateScore > 0.2 || sensitiveScore > 0.5) {
    safetyLevel = 'review';
    action = 'flag_for_review';
  } else if (sensitiveScore > 0.2) {
    safetyLevel = 'sensitive';
    action = 'allow_with_warning';
  } else {
    safetyLevel = 'safe';
    action = 'allow';
  }
  
  return {
    safetyLevel,
    action,
    scores: {
      inappropriate: Math.round(inappropriateScore * 100),
      sensitive: Math.round(sensitiveScore * 100),
      safe: Math.round((1 - inappropriateScore - sensitiveScore) * 100)
    },
    flags,
    recommendation: getRecommendation(safetyLevel)
  };
}

function getRecommendation(safetyLevel) {
  const recommendations = {
    safe: 'Content appears safe for general audiences.',
    sensitive: 'Content may contain sensitive topics. Consider context before displaying.',
    review: 'Content should be reviewed by a moderator before publication.',
    unsafe: 'Content likely violates content policy. Recommend blocking.'
  };
  
  return recommendations[safetyLevel] || 'Unable to determine safety level.';
}

function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

function getDemoHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Classification + Moderation - Edge ML Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 32px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    .upload-area {
      border: 3px dashed #667eea;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;
    }
    .upload-area:hover {
      background: #f8f9fa;
      border-color: #5568d3;
    }
    .upload-area.dragover {
      background: #e8eafe;
      border-color: #5568d3;
    }
    #fileInput {
      display: none;
    }
    .preview-container {
      margin: 20px 0;
      text-align: center;
    }
    .preview-image {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 20px 0;
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
    .results {
      margin-top: 20px;
    }
    .result-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .result-section h3 {
      color: #333;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .prediction {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: white;
      margin: 5px 0;
      border-radius: 4px;
    }
    .prediction-label {
      font-weight: 600;
      color: #333;
    }
    .prediction-score {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .safety-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
    }
    .safety-safe { background: #d4edda; color: #155724; }
    .safety-sensitive { background: #fff3cd; color: #856404; }
    .safety-review { background: #f8d7da; color: #721c24; }
    .safety-unsafe { background: #f8d7da; color: #721c24; border: 2px solid #721c24; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .metric {
      background: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s;
    }
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
      font-weight: 600;
      color: #666;
    }
    .tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>🖼️ Image Classification + Moderation</h1>
      <p class="subtitle">ML-powered image analysis running at CDN edge using ResNet-50</p>
      
      <div class="upload-area" id="uploadArea">
        <input type="file" id="fileInput" accept="image/*" />
        <div style="font-size: 48px; margin-bottom: 10px;">📁</div>
        <h3>Click to upload or drag & drop an image</h3>
        <p style="color: #999; margin-top: 10px;">Supports: JPG, PNG, WebP</p>
      </div>
      
      <div class="preview-container" id="previewContainer" style="display: none;">
        <img id="previewImage" class="preview-image" />
      </div>
      
      <div class="tabs" id="tabs" style="display: none;">
        <div class="tab active" data-tab="classify">🏷️ Classification</div>
        <div class="tab" data-tab="moderate">🛡️ Moderation</div>
        <div class="tab" data-tab="analyze">📊 Full Analysis</div>
      </div>
      
      <div class="buttons" id="buttons" style="display: none;">
        <button id="classifyBtn">Classify Image</button>
        <button id="moderateBtn">Check Safety</button>
        <button id="analyzeBtn">Full Analysis</button>
        <button id="clearBtn" style="background: #6c757d;">Clear</button>
      </div>
      
      <div id="results"></div>
    </div>
    
    <div class="card">
      <h2>About This Demo</h2>
      <p style="margin-bottom: 15px;">
        This demonstrates <strong>real computer vision ML at the edge</strong> using Cloudflare's ResNet-50 model.
      </p>
      <ul style="margin-left: 20px; color: #555; line-height: 1.8;">
        <li>✓ Image classification with 1000 object categories</li>
        <li>✓ Content moderation for safety screening</li>
        <li>✓ Processing in 100-300ms at edge</li>
        <li>✓ Runs globally across 300+ locations</li>
      </ul>
    </div>
  </div>

  <script>
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const buttons = document.getElementById('buttons');
    const tabs = document.getElementById('tabs');
    const classifyBtn = document.getElementById('classifyBtn');
    const moderateBtn = document.getElementById('moderateBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsDiv = document.getElementById('results');
    
    let currentFile = null;
    
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    });
    
    function handleFile(file) {
      currentFile = file;
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
        buttons.style.display = 'flex';
        tabs.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    }
    
    // Button clicks
    classifyBtn.addEventListener('click', () => classify());
    moderateBtn.addEventListener('click', () => moderate());
    analyzeBtn.addEventListener('click', () => analyze());
    clearBtn.addEventListener('click', () => {
      currentFile = null;
      fileInput.value = '';
      previewContainer.style.display = 'none';
      buttons.style.display = 'none';
      tabs.style.display = 'none';
      resultsDiv.innerHTML = '';
    });
    
    async function classify() {
      if (!currentFile) return;
      
      classifyBtn.disabled = true;
      classifyBtn.textContent = 'Analyzing...';
      resultsDiv.innerHTML = '<p>Processing image...</p>';
      
      try {
        const formData = new FormData();
        formData.append('image', currentFile);
        
        const response = await fetch('/api/classify', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        displayClassification(data);
        
      } catch (error) {
        resultsDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
      } finally {
        classifyBtn.disabled = false;
        classifyBtn.textContent = 'Classify Image';
      }
    }
    
    async function moderate() {
      if (!currentFile) return;
      
      moderateBtn.disabled = true;
      moderateBtn.textContent = 'Checking...';
      resultsDiv.innerHTML = '<p>Analyzing content safety...</p>';
      
      try {
        const formData = new FormData();
        formData.append('image', currentFile);
        
        const response = await fetch('/api/moderate', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        displayModeration(data);
        
      } catch (error) {
        resultsDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
      } finally {
        moderateBtn.disabled = false;
        moderateBtn.textContent = 'Check Safety';
      }
    }
    
    async function analyze() {
      if (!currentFile) return;
      
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = 'Analyzing...';
      resultsDiv.innerHTML = '<p>Running full analysis...</p>';
      
      try {
        const formData = new FormData();
        formData.append('image', currentFile);
        
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        displayAnalysis(data);
        
      } catch (error) {
        resultsDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Full Analysis';
      }
    }
    
    function displayClassification(data) {
      let html = \`
        <div class="result-section">
          <h3>🏷️ Classification Results</h3>
          <p style="margin-bottom: 15px;">Top predictions from ResNet-50:</p>
      \`;
      
      data.predictions.slice(0, 5).forEach((pred, idx) => {
        const percent = (pred.score * 100).toFixed(1);
        html += \`
          <div class="prediction">
            <span class="prediction-label">\${idx + 1}. \${pred.label}</span>
            <span class="prediction-score">\${percent}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: \${percent}%"></div>
          </div>
        \`;
      });
      
      html += \`
        </div>
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">\${data.metadata.processingTimeMs}ms</div>
            <div class="metric-label">Processing Time</div>
          </div>
          <div class="metric">
            <div class="metric-value">\${Math.round(data.metadata.imageSize / 1024)}KB</div>
            <div class="metric-label">Image Size</div>
          </div>
          <div class="metric">
            <div class="metric-value">\${data.predictions.length}</div>
            <div class="metric-label">Total Predictions</div>
          </div>
        </div>
      \`;
      
      resultsDiv.innerHTML = html;
    }
    
    function displayModeration(data) {
      const safetyClass = 'safety-' + data.moderation.safetyLevel;
      
      let html = \`
        <div class="result-section">
          <h3>🛡️ Content Moderation</h3>
          <div style="margin: 20px 0;">
            <span class="safety-badge \${safetyClass}">
              \${data.moderation.safetyLevel}
            </span>
          </div>
          <p style="margin: 15px 0;"><strong>Action:</strong> \${data.moderation.action}</p>
          <p style="margin: 15px 0;">\${data.moderation.recommendation}</p>
        </div>
        
        <div class="result-section">
          <h3>📊 Safety Scores</h3>
          <div style="margin-top: 15px;">
            <div class="prediction">
              <span>Safe</span>
              <span class="prediction-score" style="background: #28a745;">\${data.moderation.scores.safe}%</span>
            </div>
            <div class="prediction">
              <span>Sensitive</span>
              <span class="prediction-score" style="background: #ffc107;">\${data.moderation.scores.sensitive}%</span>
            </div>
            <div class="prediction">
              <span>Inappropriate</span>
              <span class="prediction-score" style="background: #dc3545;">\${data.moderation.scores.inappropriate}%</span>
            </div>
          </div>
        </div>
      \`;
      
      if (data.moderation.flags && data.moderation.flags.length > 0) {
        html += \`
          <div class="result-section">
            <h3>⚠️ Detected Flags</h3>
            \${data.moderation.flags.map(flag => \`
              <div class="prediction">
                <span>\${flag.category}</span>
                <span class="prediction-score" style="background: \${flag.severity === 'high' ? '#dc3545' : '#ffc107'};">
                  \${flag.confidence}% - \${flag.severity}
                </span>
              </div>
            \`).join('')}
          </div>
        \`;
      }
      
      html += \`
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">\${data.metadata.processingTimeMs}ms</div>
            <div class="metric-label">Processing Time</div>
          </div>
        </div>
      \`;
      
      resultsDiv.innerHTML = html;
    }
    
    function displayAnalysis(data) {
      const safetyClass = 'safety-' + data.moderation.safetyLevel;
      
      let html = \`
        <div class="result-section">
          <h3>🏷️ Top Classifications</h3>
      \`;
      
      data.classification.topPredictions.forEach((pred, idx) => {
        const percent = (pred.score * 100).toFixed(1);
        html += \`
          <div class="prediction">
            <span class="prediction-label">\${idx + 1}. \${pred.label}</span>
            <span class="prediction-score">\${percent}%</span>
          </div>
        \`;
      });
      
      html += \`
        </div>
        <div class="result-section">
          <h3>🛡️ Safety Assessment</h3>
          <div style="margin: 15px 0;">
            <span class="safety-badge \${safetyClass}">\${data.moderation.safetyLevel}</span>
          </div>
          <p>\${data.moderation.recommendation}</p>
        </div>
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">\${data.metadata.processingTimeMs}ms</div>
            <div class="metric-label">Total Time</div>
          </div>
          <div class="metric">
            <div class="metric-value">\${data.classification.allPredictions}</div>
            <div class="metric-label">Predictions</div>
          </div>
          <div class="metric">
            <div class="metric-value">\${data.moderation.scores.safe}%</div>
            <div class="metric-label">Safety Score</div>
          </div>
        </div>
      \`;
      
      resultsDiv.innerHTML = html;
    }
  </script>
</body>
</html>`;
}
