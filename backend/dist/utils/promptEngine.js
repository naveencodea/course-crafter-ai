"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCourseContent = generateCourseContent;
const openai_1 = require("openai");
// Initialize OpenAI with API key from environment variables
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
/**
 * Generates course content using OpenAI's API
 * @param {string} prompt - The user's course prompt/idea
 * @returns {Promise<string>} - Generated course content
 * @throws {Error} - If there's an error generating the content
 */
async function generateCourseContent(prompt) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
    }
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
    }
    try {
        const messages = [
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
        });
        if (!response?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response from OpenAI API');
        }
        return response.choices[0].message.content;
    }
    catch (error) {
        console.error('Error in generateCourseContent:', error);
        throw new Error(`Failed to generate course content: ${error.message}`);
    }
}
exports.default = {
    generateCourseContent
};
//# sourceMappingURL=promptEngine.js.map