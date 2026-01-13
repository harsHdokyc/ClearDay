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
      Analyze this skincare progress data and provide insights in JSON format:
      
      User Profile:
      - Skin Goal: ${userProfile.skinGoal}
      - Skin Type: ${userProfile.skinType}
      - Days Tracked: ${userProfile.totalDaysTracked || 0}
      - Recent Progress: ${recentLogs.length} days of data
      
      Photo Analysis: Based on the provided photo URL, analyze skin condition trends.
      
      Return JSON with this exact structure:
      {
        "acneTrend": "increasing|decreasing|stable|mild|severe",
        "rednessTrend": "increasing|decreasing|stable|mild|severe", 
        "insightMessage": "Brief personalized insight (2-3 sentences)"
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
      Evaluate this skincare product for the user and provide insights in JSON format:
      
      Product: ${productName}
      User Goal: ${goal}
      Skin Type: ${skinType}
      Sensitivity: ${sensitivity || 'normal'}
      
      Based on real-world user feedback and product characteristics, evaluate:
      
      Return JSON with this exact structure:
      {
        "fitScore": number (0-100),
        "insightMessage": "Brief evaluation with pros/cons (2-3 sentences)"
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
