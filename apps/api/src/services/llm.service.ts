import axios from 'axios';
import { GenerateRecipeInput, Recipe } from '@schemas';
import { Timestamp as ClientTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

interface LLMRecipeResponse {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  cuisine: string;
  nutrition?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

export const generateRecipe = async (
  params: GenerateRecipeInput,
  userId: string,
  modelUsed = 'deepseek/deepseek-chat-v3-0324:free'
): Promise<Recipe> => {
  const {
    servings = 4,
    cuisine = '',
    ingredients = [],
    diet: dietType = '',
    restrictions = [],
    lifestyle = '',
    preferences = {},
    cookTime: prepTime = 30,
  } = params;

  const systemMessage = `You are a helpful assistant that generates detailed cooking recipes. Respond in JSON format.`;

  const prompt = `Generate a detailed recipe using these ingredients: ${ingredients.join(', ')}
${servings ? `- Servings: ${servings}\n` : ''}
${cuisine ? `- Cuisine style: ${cuisine}\n` : ''}
${restrictions.length ? `- Dietary restrictions: ${restrictions.join(', ')}\n` : ''}
${dietType ? `- Diet type: ${dietType}\n` : ''}
${lifestyle ? `- Lifestyle: ${lifestyle}\n` : ''}
${preferences.spiceLevel ? `- Spice level: ${preferences.spiceLevel}\n` : ''}
${preferences.lowFat ? `- Low fat preference\n` : ''}
${preferences.glutenFree ? `- Gluten free\n` : ''}
${preferences.dairyFree ? `- Dairy free\n` : ''}

Include in your response (as JSON):
- title (generated based on ingredients and cuisine)
- ingredients (with quantities and preparation notes)
- detailed instructions (numbered steps)
- cookingTime (in minutes)
- servings
- cuisine
- optional nutrition information`;

  const requestData: OpenRouterRequest = {
    model: modelUsed,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  };

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0].message.content;
    const llmRecipe: LLMRecipeResponse = JSON.parse(content);

    // Generate a UUID for client-side ID if needed
    const recipeId = uuidv4();
    // Use Firestore client Timestamp to get a JS Date
    const nowTs = ClientTimestamp.now();
    const nowDate = nowTs.toDate();

    return {
      id: recipeId,
      userId,
      title: llmRecipe.title || 'Generated Recipe',
      cuisine: llmRecipe.cuisine || cuisine || 'International',
      servings: llmRecipe.servings || servings,
      restrictions,
      dietType,
      lifestyle,
      ingredients: (llmRecipe.ingredients || ingredients).map((ing: any) => {
        if (typeof ing === 'string') {
          // Try to parse the string into name, quantity, preparation
          // Example: "2 cups chopped carrots"
          const match = ing.match(/^(\d+\s*\w*)\s+(.*?)(?:,\s*(.*))?$/);
          if (match) {
            return {
              quantity: match[1],
              name: match[2],
              preparation: match[3] || '',
            };
          }
          return {
            name: ing,
            quantity: '',
            preparation: '',
          };
        }
        // If already an object, ensure it has the required fields
        return {
          name: ing.name || '',
          quantity: ing.quantity || '',
          preparation: ing.preparation || '',
        };
      }),
      prepTime: llmRecipe.cookingTime || prepTime,
      instructions: (llmRecipe.instructions || ['No instructions provided']).map(
        (instr: string, idx: number) => ({
          step: idx + 1,
          detail: instr,
        })
      ),
      modelUsed,
      source: 'llm',
      createdAt: nowDate,
      updatedAt: nowDate,
    };
  } catch (error: any) {
    console.error('LLM Error:', error.response?.data || error.message);
    throw new Error('Failed to generate recipe');
  }
};
