// Removed unused imports
// import { encoding_for_model, TiktokenModel } from 'tiktoken';

const tokenCache = new Map<string, number>();

function countTokensSync(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  const punctuationCount = (text.match(/[.,!?;:'"()\[\]{}]/g) || []).length;
  const numberCount = (text.match(/\d+/g) || []).length;
  return Math.ceil((wordCount + punctuationCount + numberCount) * 1.3);
}

// Removed unused MODEL_MAX_TOKENS and MODEL_PRICES
// const MODEL_MAX_TOKENS: { [key: string]: number } = { ... };
// const MODEL_PRICES: { [key: string]: { input: number; output: number } } = { ... };

// Default to O1's models
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const PREMIUM_MODEL = 'gpt-4o-2024-11-20';

export function countTokens(text: string): number {
  const cacheKey = text.slice(0, 100) + text.length;
  
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey)!;
  }

  const count = countTokensSync(text);
  tokenCache.set(cacheKey, count);
  return count;
}

// Optional: Add helper for chat completion max tokens
export function getChatCompletionMaxTokens(
  model: string, 
  messages: Array<{ role: string; content: string }>
): number {
  try {
    const MODEL_MAX_TOKENS: { [key: string]: number } = {
      'gpt-4o-2024-11-20': 128000,
      'gpt-4o-mini': 32000,
      'gpt-4': 8192,
      'gpt-3.5-turbo': 4096
    };

    const maxTokens = MODEL_MAX_TOKENS[model] || 4096;
    let usedTokens = 0;

    for (const msg of messages) {
      usedTokens += countTokensSync(msg.content);
      usedTokens += 4;
    }
    
    usedTokens += 2;
    return Math.max(0, maxTokens - usedTokens);
  } catch (error) {
    console.warn('Error calculating max tokens:', error);
    return 1000;
  }
}