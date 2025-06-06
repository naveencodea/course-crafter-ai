import fs from 'fs-extra';
import path from 'path';
import PDFDocument from 'pdfkit';

// Get the current directory in a way that works with both CommonJS and TypeScript
const getCurrentFilename = (): string => {
  try {
    // @ts-ignore - This is a workaround for ESM/CommonJS interop
    return __filename || (() => {
      const error = new Error();
      const stack = error.stack?.split('\n') || [];
      const callerLine = stack[2] || '';
      const match = callerLine.match(/at .*?\((.*):\d+:\d+\)/);
      return match ? match[1] : '';
    })();
  } catch (e) {
    return '';
  }
};

const getCurrentDirname = (): string => {
  try {
    // @ts-ignore - This is a workaround for ESM/CommonJS interop
    return __dirname || path.dirname(getCurrentFilename());
  } catch (e) {
    return process.cwd();
  }
};

const __filename = getCurrentFilename();
const __dirname = getCurrentDirname();

// Ensure exports directory exists
const EXPORTS_DIR = path.join(process.cwd(), 'exports');

/**
 * Ensures the exports directory exists
 */
function ensureExportsDir(): void {
  try {
    fs.ensureDirSync(EXPORTS_DIR);
  } catch (error: any) {
    throw new Error(`Failed to create exports directory: ${error.message}`);
  }
}

/**
 * Exports content as a text file
 * @param {string} content - The content to export
 * @param {string} fileId - Unique identifier for the file
 * @returns {Promise<string>} - Name of the generated file
 * @throws {Error} - If there's an error exporting the file
 */
export async function exportAsText(content: string, fileId: string): Promise<string> {
  if (!content || typeof content !== 'string') {
    throw new Error('Content must be a non-empty string');
  }

  if (!fileId || typeof fileId !== 'string') {
    throw new Error('File ID must be a non-empty string');
  }

  try {
    ensureExportsDir();
    const fileName = `${fileId}.txt`;
    const filePath = path.join(EXPORTS_DIR, fileName);
    
    await fs.writeFile(filePath, content, { encoding: 'utf8' });
    
    return fileName;
  } catch (error: any) {
    console.error('Error exporting as text:', error);
    throw new Error(`Failed to export as text: ${error.message}`);
  }
}

/**
 * Exports content as a PDF file
 * @param {string} content - The content to export
 * @param {string} fileId - Unique identifier for the file
 * @returns {Promise<string>} - Name of the generated file
 * @throws {Error} - If there's an error exporting the file
 */
export async function exportAsPDF(content: string, fileId: string): Promise<string> {
  if (!content || typeof content !== 'string') {
    throw new Error('Content must be a non-empty string');
  }

  if (!fileId || typeof fileId !== 'string') {
    throw new Error('File ID must be a non-empty string');
  }

  return new Promise((resolve, reject) => {
    try {
      ensureExportsDir();
      const fileName = `${fileId}.pdf`;
      const filePath = path.join(EXPORTS_DIR, fileName);
      
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      
      // Handle stream errors
      stream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        reject(new Error(`Failed to write PDF: ${error.message}`));
      });
      
      // When the PDF is fully written
      stream.on('finish', () => {
        resolve(fileName);
      });
      
      // Pipe the PDF content to the file
      doc.pipe(stream);
      
      // Add content to PDF
      doc.fontSize(12);
      doc.font('Helvetica');
      
      // Add title
      doc.fontSize(20).text('Course Content', {
        align: 'center',
        underline: true
      });
      
      doc.moveDown();
      
      // Add content
      doc.fontSize(12).text(content, {
        align: 'left',
        width: 500,
        lineGap: 5
      });
      
      // Add footer
      const date = new Date().toLocaleDateString();
      const footer = `Generated by CourseCraft AI • ${date}`;
      
      doc.moveTo(50, doc.page.height - 50)
         .lineTo(550, doc.page.height - 50)
         .stroke();
         
      doc.fontSize(10)
         .text(footer, 50, doc.page.height - 35, {
           align: 'center',
           width: 500
         });
      
      // Finalize the PDF
      doc.end();
      
    } catch (error: any) {
      console.error('Error exporting as PDF:', error);
      reject(new Error(`Failed to export as PDF: ${error.message}`));
    }
  });
}

export default {
  exportAsText,
  exportAsPDF
} as const;