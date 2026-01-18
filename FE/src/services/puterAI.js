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

  // Basic chat with Claude
  async chat(prompt, options = {}) {
    await this.initialize();
    
    const { model = this.model, stream = false } = options;
    
    if (!window.puter || !window.puter.ai) {
      throw new Error('Puter.js not available');
    }
    
    try {
      const response = await window.puter.ai.chat(prompt, { model, stream });
      
      if (stream) {
        return response; // Return stream for streaming responses
      } else {
        return response.message.content[0].text;
      }
    } catch (error) {
      console.error('Puter AI Error:', error);
      throw error;
    }
  }

  // Progress analysis for skincare
  async analyzeProgress(userProfile, recentLogs, photoUrl) {
    const prompt = `
      Analyze this skincare progress data and the provided photo to give accurate insights in JSON format:
      
      User Profile:
      - Skin Goal: ${userProfile.skinGoal}
      - Skin Type: ${userProfile.skinType}
      - Days Tracked: ${userProfile.totalDaysTracked || 0}
      - Recent Progress: ${recentLogs.length} days of data
      
      Photo Analysis: Based on the provided photo URL ${photoUrl}, analyze the actual skin condition visible in the photo. Look for:
      - Acne/breakouts severity
      - Redness/inflammation
      - Skin texture and clarity
      - Overall skin condition
      
      Recent Data: ${JSON.stringify(recentLogs.slice(0, 3))}
      
      Compare the current photo with recent trends and provide an accurate assessment.
      
      Return JSON with this exact structure:
      {
        "acneTrend": "increasing|decreasing|stable|mild|severe",
        "rednessTrend": "increasing|decreasing|stable|mild|severe", 
        "insightMessage": "Brief personalized insight (2-3 sentences) based on actual photo analysis"
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
        const jsonMatch = response.match(/\{[^}]+\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
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
