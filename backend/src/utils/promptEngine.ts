import { OpenAI } from 'openai';

/**
 * Interface for the OpenAI message
 */
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Interface for the OpenAI response
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generates course content using OpenAI's API
 * @param {string} prompt - The user's course prompt/idea
 * @returns {Promise<string>} - Generated course content
 * @throws {Error} - If there's an error generating the content
 */
export async function generateCourseContent(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  try {
    const messages: Message[] = [
      { 
        role: 'system', 
        content: `You are an expert course creator. Generate a detailed course outline and content based on the user's prompt. 
        Structure it with clear sections, learning objectives, and key points.` 
      },
      { 
        role: 'user', 
        content: `Create a comprehensive course about: ${prompt}` 
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 2000
    }) as unknown as OpenAIResponse;

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('Error in generateCourseContent:', error);
    throw new Error(`Failed to generate course content: ${error.message}`);
  }
}

export default {
  generateCourseContent
} as const;