/**
 * Exports content as a text file
 * @param {string} content - The content to export
 * @param {string} fileId - Unique identifier for the file
 * @returns {Promise<string>} - Name of the generated file
 * @throws {Error} - If there's an error exporting the file
 */
export declare function exportAsText(content: string, fileId: string): Promise<string>;
/**
 * Exports content as a PDF file
 * @param {string} content - The content to export
 * @param {string} fileId - Unique identifier for the file
 * @returns {Promise<string>} - Name of the generated file
 * @throws {Error} - If there's an error exporting the file
 */
export declare function exportAsPDF(content: string, fileId: string): Promise<string>;
declare const _default: {
    readonly exportAsText: typeof exportAsText;
    readonly exportAsPDF: typeof exportAsPDF;
};
export default _default;
