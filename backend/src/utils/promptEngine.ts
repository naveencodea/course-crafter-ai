// System prompt for course generation
const SYSTEM_PROMPT = `You are an expert course creator. Generate a detailed course outline and content based on the user's prompt. 
Structure it with clear sections, learning objectives, and key points.`;

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason: string;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

/**
 * Generates course content using Mistral 7B via Ollama
 * @param {string} prompt - The user's course prompt/idea
 * @returns {Promise<string>} - Generated course content
 * @throws {Error} - If there's an error generating the content
 */
export async function generateCourseContent(prompt: string): Promise<string> {
  console.log('🔍 Validating input...');
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  try {
    console.log('📤 Preparing request to Ollama...');
    console.log(`🌐 Endpoint: ${OLLAMA_API_URL}`);
    
    const fullPrompt = `${SYSTEM_PROMPT}\n\nCreate a comprehensive course about: ${prompt}`;
    
    const requestBody = {
      model: 'mistral',
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_ctx: 4096,
      }
    };

    console.log('📨 Sending request to Ollama...');
    const startTime = Date.now();
    
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseTime = (Date.now() - startTime) / 1000;
    console.log(`⏱️  Response received in ${responseTime.toFixed(2)}s`);
    console.log(`🔄 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
    }

    console.log('📥 Parsing response...');
    const data: OllamaResponse = await response.json();
    
    if (!data) {
      throw new Error('Empty response from Ollama');
    }

    console.log('✅ Received valid response from Ollama');
    
    if (!data.response) {
      console.error('❌ No content in response:', JSON.stringify(data, null, 2));
      throw new Error('No content generated from Ollama');
    }

    return data.response;
  } catch (error) {
    console.error('\n❌ Error in generateCourseContent:');
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if ('stack' in error) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('Unknown error:', error);
    }
    throw error; // Re-throw to let the caller handle it
  }
}

export default {
  generateCourseContent
} as const;