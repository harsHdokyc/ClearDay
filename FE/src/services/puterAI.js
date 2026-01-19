// AI Service using Puter.js for free unlimited Claude access
class PuterAIService {
  constructor() {
    this.model = 'claude-sonnet-4-5'; // Default to Claude Sonnet 4.5
    this.isInitialized = false;
    this.initPromise = null;
  }

  // Initialize Puter.js and wait for it to be ready
  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      // Check if puter is already available
      if (window.puter && window.puter.ai) {
        this.isInitialized = true;
        resolve();
        return;
      }

      // Wait for puter to be available
      const checkPuter = () => {
        if (window.puter && window.puter.ai) {
          this.isInitialized = true;
          resolve();
        } else {
          setTimeout(checkPuter, 100);
        }
      };

      // Start checking
      checkPuter();

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isInitialized) {
          reject(new Error('Puter.js failed to load within 10 seconds'));
        }
      }, 10000);
    });

    return this.initPromise;
  }

  // Check if Puter.js authentication is needed and handle it
  async ensureAuthenticated() {
    try {
      await this.initialize();
      
      // Puter.js AI features typically work without explicit authentication
      // The whoami 401 error is harmless if AI features still function
      // We'll suppress authentication errors and let AI calls proceed
      if (window.puter?.auth) {
        // Check auth status but don't require it for AI features
        const isSignedIn = window.puter.auth.isSignedIn();
        if (!isSignedIn) {
          // AI features may still work without sign-in
          // Puter.js allows AI usage without explicit authentication
        }
      }
    } catch (error) {
      // Suppress authentication errors - AI features might still work
      // The whoami 401 error is expected if user hasn't signed in via Puter
      if (error?.message?.includes('401') || error?.code === 'token_auth_failed') {
        // This is expected and harmless - continue
        return;
      }
      console.warn('Puter.js authentication check:', error);
    }
  }

  // Test method to verify Puter.js is working
  async testConnection() {
    try {
      await this.initialize();
      const response = await window.puter.ai.chat("Hello", { model: 'claude-sonnet-4-5' });
      return true;
    } catch (error) {
      console.error('Puter.js test failed:', error);
      return false;
    }
  }

  // Basic chat with Claude (supports images)
  async chat(prompt, imageUrlOrUrls = null, options = {}) {
    await this.initialize();
    await this.ensureAuthenticated();
    
    const { model = this.model, stream = false } = options;
    
    if (!window.puter || !window.puter.ai) {
      throw new Error('Puter.js not available');
    }
    
    try {
      let response;
      if (imageUrlOrUrls) {
        const images = Array.isArray(imageUrlOrUrls) ? imageUrlOrUrls : [imageUrlOrUrls];
        response = await window.puter.ai.chat(prompt, images, { model, stream });
      } else {
        response = await window.puter.ai.chat(prompt, { model, stream });
      }
      
      if (stream) {
        return response;
      }
      
      // Extract text from response (Puter.js returns response.message.content as string)
      if (response?.message?.content) {
        return typeof response.message.content === 'string' 
          ? response.message.content 
          : response.message.content[0]?.text || response.message.content[0] || '';
      }
      
      return response?.text || response?.message?.text || response || '';
    } catch (error) {
      // Handle authentication errors gracefully
      if (error?.message?.includes('401') || error?.code === 'token_auth_failed' || error?.message?.includes('Authentication failed')) {
        console.warn('Puter.js authentication error - AI features may require sign-in:', error);
        // You might want to show a user-friendly message or fallback to backend AI
        throw new Error('AI service authentication failed. Please try again or contact support.');
      }
      console.error('Puter AI Error:', error);
      throw error;
    }
  }

  // Progress analysis for skincare (supports single photo or multi-view)
  async analyzeProgress(userProfile, recentLogs, photoUrlOrUrls) {
    // Handle both single photo (backward compatibility) and multi-view photos
    const isMultiView = photoUrlOrUrls && 
                       typeof photoUrlOrUrls === 'object' && 
                       photoUrlOrUrls !== null && 
                       !Array.isArray(photoUrlOrUrls);
    const photoUrls = isMultiView ? photoUrlOrUrls : { front: photoUrlOrUrls };
    
    const hasAllViews = photoUrls.front && photoUrls.right && photoUrls.left;
    
    // Build array of image URLs for Puter.js
    const imageUrls = [];
    if (photoUrls.front) imageUrls.push(photoUrls.front);
    if (photoUrls.right) imageUrls.push(photoUrls.right);
    if (photoUrls.left) imageUrls.push(photoUrls.left);
    
    const prompt = `
You are a dermatology AI assistant analyzing skincare progress photos. 

${hasAllViews 
  ? `You have THREE images to analyze: front view, right side view, and left side view.
Analyze ALL THREE images together. Look at each view carefully and compare them to get a comprehensive assessment of the skin condition.

IMPORTANT: You MUST analyze the actual images provided. Look at:
- The front view image for overall facial skin condition
- The right side view image for right cheek and side profile skin
- The left side view image for left cheek and side profile skin
- Compare all three views to identify patterns, asymmetries, and overall skin health

Be SPECIFIC about what you see in the images:
- Describe visible acne, pimples, or breakouts you can see
- Describe redness, inflammation, or irritation visible in the photos
- Note skin texture, clarity, and any visible improvements or concerns
- Mention specific areas (forehead, cheeks, chin, etc.) where you observe changes`
  : photoUrls.front 
    ? `You have ONE image to analyze: front view of the face.
Analyze this image carefully to assess the skin condition.

IMPORTANT: You MUST analyze the actual image provided. Look at:
- Visible acne, pimples, or breakouts
- Redness, inflammation, or irritation
- Skin texture and clarity
- Specific areas of concern or improvement

Be SPECIFIC about what you see in the image.`
    : 'No images provided.'}

User Profile:
- Skin Goal: ${userProfile.skinGoal}
- Skin Type: ${userProfile.skinType}
- Days Tracked: ${userProfile.totalDaysTracked || 0}
- Recent Progress: ${recentLogs.length} days of data

Recent Historical Data: ${JSON.stringify(recentLogs.slice(0, 3))}

ANALYSIS REQUIREMENTS:
1. Look at the actual image(s) and assess:
   - Acne/breakouts: Count visible pimples, assess severity, distribution. Be specific about what you see.
   - Redness/inflammation: Assess redness intensity, areas affected. Describe the redness you observe.
   - Skin texture: Smoothness, clarity, overall condition. Note any visible texture changes.
   ${hasAllViews ? '- Compare views: Look for asymmetries, different patterns in each angle. Note differences between front, right, and left views.' : ''}

2. Rate on 0-10 scale:
   - Acne Level: 0=clear, 1-3=mild (few small pimples), 4-6=moderate (several pimples), 7-8=severe (many pimples/breakouts), 9-10=very severe (extensive breakouts)
   - Redness Level: 0=no redness, 1-3=mild (slight pink), 4-6=moderate (noticeable redness), 7-8=severe (significant redness), 9-10=very severe (intense redness/inflammation)

3. Determine trends by comparing with recent data (if available)

4. Generate insightMessage that:
   - MUST reference specific observations from the images (e.g., "I can see X pimples on your forehead", "Your right cheek shows Y", "The images reveal Z")
   - MUST be based on what you actually see in the photos, not generic advice
   - Should mention specific areas or features visible in the images
   - Include brief analysis of what the images show
   - End with motivational but realistic feedback

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "acneLevel": <number 0-10>,
  "rednessLevel": <number 0-10>,
  "acneTrend": "increasing|decreasing|stable|mild|moderate|severe",
  "rednessTrend": "increasing|decreasing|stable|mild|moderate|severe",
  "insightMessage": "Based on ${hasAllViews ? 'the three photos (front, right, and left views)' : 'the photo'}, I can see [specific observation from images]. [Detailed analysis of what the images show]. [Motivational ending]."
}

IMPORTANT: Do NOT wrap the JSON in markdown code blocks. Return ONLY the raw JSON object.
`;

    try {
      const imagesToAnalyze = imageUrls.length > 0 ? (imageUrls.length === 1 ? imageUrls[0] : imageUrls) : null;
      const response = await this.chat(prompt, imagesToAnalyze);
      
      // Parse JSON response (handle markdown code blocks)
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n?/i, '');
      cleanedResponse = cleanedResponse.replace(/\n?```\s*$/i, '');
      cleanedResponse = cleanedResponse.trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanedResponse);
      } catch (parseError) {
        // Extract JSON from response if wrapped in markdown
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonStr = jsonMatch[0];
          jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/i, '');
          jsonStr = jsonStr.replace(/\n?```\s*$/i, '');
          parsed = JSON.parse(jsonStr.trim());
        } else {
          throw new Error('Could not extract valid JSON from response');
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('Progress Analysis Error:', error);
      throw error;
    }
  }

  // Product evaluation for skincare
  async evaluateProduct(productName, goal, skinType, sensitivity) {
    const prompt = `
      You are a Senior Dermatology Research AI.

      Your job is to provide deeply researched, evidence-based, unbiased evaluations of skincare, haircare, and dermatology products, treatments, and routines.

      You do NOT behave like a chatbot or influencer.
      You behave like a medical researcher, clinical dermatologist, and investigative analyst combined.

      Your mission is to protect the user from:
      - ineffective products
      - skin or hair damage
      - marketing hype
      - false or misleading claims

      CORE BEHAVIOR
      For every product or treatment, you must:
      1. Determine real-world effectiveness
      2. Identify safety risks
      3. Detect hype vs reality
      4. Find success and failure patterns
      5. Explain which skin or hair types benefit or suffer

      You always think in long-term outcomes (weeks and months, not days).

      MANDATORY SOURCES
      You must investigate and cross-verify information from:
      - Reddit (real user experiences, side effects, long-term use)
      - YouTube (dermatologists, cosmetic chemists, reviewers)
      - Product review platforms (Amazon, G2, Trustpilot, Flipkart, etc.)
      - Brand websites (ingredients, claims, clinical trials)
      - Dermatology or medical sources (ingredient safety & efficacy)
      - Before/after and community reports

      No single source is trusted alone.
      Patterns across sources matter more than individual opinions.

      HOW YOU ANALYZE
      For every claim, you must ask:
      - Is this repeated across multiple independent sources?
      - Is this marketing language or real outcome?
      - Is there scientific support for the ingredient?
      - What negative outcomes are reported?
      - Who does this NOT work for?

      You actively look for:
      - irritation
      - breakouts
      - hair fall
      - dryness
      - worsening conditions
      - fake or manipulated reviews

      Product to Evaluate: ${productName}
      ${productName.includes('http') ? 'NOTE: A product URL has been provided. You can access this URL directly to gather detailed product information including ingredients, claims, reviews, and specifications. Use this URL to enhance your evaluation with real-time product data.' : ''}
      User Profile:
      - Goal: ${goal}
      - Skin Type: ${skinType}
      - Sensitivity: ${sensitivity || 'normal'}

      REQUIRED OUTPUT FORMAT
      Return a JSON object with exactly two fields: "fitScore" (0-100 number) and "insightMessage" (string).
      
      The "insightMessage" field MUST contain ONLY the Final Dermatologist Verdict section. 
      Do not include any markdown formatting, asterisks, hyphens, or section headers.
      Provide a concise summary that includes:
      - Clear verdict (Worth it/Not worth it/Only for specific cases)
      - Key justification in 2-3 sentences
      - Fit score reasoning
      - Clean, dry text without any formatting

      Return JSON structure:
      {
        "fitScore": number,
        "insightMessage": "Clean concise verdict text here..."
      }
    `;

    try {
      const response = await this.chat(prompt);
      
      // Try to parse as JSON
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        // Use a more robust regex that captures the outermost braces
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e) {
             throw new Error('Could not parse extracted JSON');
          }
        } else {
          throw new Error('Could not extract valid JSON from response');
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('Product Evaluation Error:', error);
      throw error;
    }
  }

  // Streaming chat for longer responses
  async streamChat(prompt, options = {}) {
    await this.initialize();
    
    const { model = this.model } = options;
    
    try {
      if (!window.puter || !window.puter.ai) {
        throw new Error('Puter.js not loaded');
      }
      
      const response = await window.puter.ai.chat(prompt, { model, stream: true });
      const chunks = [];
      
      for await (const part of response) {
        if (part?.text) {
          chunks.push(part.text);
        }
      }
      
      return chunks.join('');
    } catch (error) {
      console.error('Stream Chat Error:', error);
      throw error;
    }
  }

  // Set different Claude model
  setModel(model) {
    const availableModels = [
      'claude-sonnet-4',
      'claude-sonnet-4-5', 
      'claude-opus-4',
      'claude-opus-4-1',
      'claude-opus-4-5',
      'claude-haiku-4-5'
    ];
    
    if (availableModels.includes(model)) {
      this.model = model;
    } else {
      console.warn(`Invalid model: ${model}. Using default: ${this.model}`);
    }
  }
}

// Create singleton instance
const puterAI = new PuterAIService();

export default puterAI;
