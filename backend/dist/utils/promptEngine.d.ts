/**
 * Generates course content using OpenAI's API
 * @param {string} prompt - The user's course prompt/idea
 * @returns {Promise<string>} - Generated course content
 * @throws {Error} - If there's an error generating the content
 */
export declare function generateCourseContent(prompt: string): Promise<string>;
declare const _default: {
    readonly generateCourseContent: typeof generateCourseContent;
};
export default _default;
