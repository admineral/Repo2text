export function getContentPreview(content: string, maxLength: number = 150) {
    const preview = content.slice(0, maxLength);
    return content.length > maxLength ? `${preview}...` : preview;
  }
  
  interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }
  
  interface ModelPricing {
    name: string;
    inputPrice: number;
    outputPrice: number;
    description: string;
  }
  
  export function calculateCost(usage: TokenUsage, model: string, modelPrices: { [key: string]: ModelPricing }) {
    const pricing = modelPrices[model];
    const inputCost = (usage.promptTokens / 1_000_000) * pricing.inputPrice;
    const outputCost = (usage.completionTokens / 1_000_000) * pricing.outputPrice;
    return inputCost + outputCost;
  }
  