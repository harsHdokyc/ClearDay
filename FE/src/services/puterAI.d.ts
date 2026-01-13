declare class PuterAIService {
  constructor();
  testConnection(): Promise<boolean>;
  chat(prompt: string, options?: { model?: string; stream?: boolean }): Promise<string | any>;
  analyzeProgress(userProfile: any, recentLogs: any[], photoUrl: string): Promise<any>;
  evaluateProduct(productName: string, goal: string, skinType: string, sensitivity?: string): Promise<any>;
  streamChat(prompt: string, options?: { model?: string }): Promise<string>;
  setModel(model: string): void;
}

declare const puterAI: PuterAIService;
export default puterAI;
