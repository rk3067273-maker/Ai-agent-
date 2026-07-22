import type { FileAttachment } from '@/types';

export class FileParserService {
  static async parseFile(file: File): Promise<FileAttachment> {
    const attachment: FileAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
    };

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (file.type.startsWith('image/')) {
        attachment.url = URL.createObjectURL(file);
      } else if (extension === 'pdf') {
        attachment.content = await this.parsePDF(file);
      } else if (extension === 'docx' || extension === 'doc') {
        attachment.content = await this.parseDOCX(file);
      } else if (['zip', 'tar', 'gz', 'rar', '7z'].includes(extension || '')) {
        attachment.content = `[Archive file: ${file.name}\nSize: ${this.formatBytes(file.size)}\nUse the file manager to extract and view contents.]`;
      } else {
        attachment.content = await file.text();
      }
    } catch (error) {
      attachment.content = `[Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }

    return attachment;
  }

  private static async parsePDF(file: File): Promise<string> {
    // In a real implementation, use pdf-parse or pdfjs
    return `[PDF Document: ${file.name}\nSize: ${this.formatBytes(file.size)}\nUse a PDF parser library to extract text content.]`;
  }

  private static async parseDOCX(file: File): Promise<string> {
    // In a real implementation, use mammoth.js
    return `[Word Document: ${file.name}\nSize: ${this.formatBytes(file.size)}\nUse mammoth.js to extract text content.]`;
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getSupportedTypes(): string[] {
    return [
      'text/plain',
      'text/markdown',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'application/xml',
      'application/javascript',
      'application/typescript',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
    ];
  }

  static getLanguageFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
    };
    return map[ext || ''] || 'plaintext';
  }
}
