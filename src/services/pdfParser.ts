import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

type PdfJs = typeof import('pdfjs-dist');

let pdfjsPromise: Promise<PdfJs> | null = null;

/**
 * PDF.js is ~500kB, so it is only pulled in when a PDF is actually dropped.
 * The worker is pinned to a matching CDN build, which keeps the bundler
 * completely out of worker resolution — zero extra Vite config needed.
 */
function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= import('pdfjs-dist').then((pdfjsLib) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    return pdfjsLib;
  });
  return pdfjsPromise;
}

/** Providers choke on huge payloads; the system prompt caps study text here. */
export const MAX_STUDY_TEXT_LENGTH = 35_000;

export const ACCEPTED_FILE_TYPES = '.pdf,.txt,.md,.markdown,text/plain,application/pdf';

export interface ParsedDocument {
  title: string;
  text: string;
  pageCount: number;
  characterCount: number;
}

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfParseError';
  }
}

function tidy(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, '').trim() || 'Untitled Manuscript';
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function isPlainText(file: File): boolean {
  return file.type.startsWith('text/') || /\.(txt|md|markdown)$/i.test(file.name);
}

export function isSupportedFile(file: File): boolean {
  return isPdf(file) || isPlainText(file);
}

/** Truncate on a word boundary so the LLM never receives a severed token. */
export function truncateStudyText(text: string, limit = MAX_STUDY_TEXT_LENGTH): string {
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  const lastBreak = clipped.lastIndexOf(' ');
  return (lastBreak > limit * 0.9 ? clipped.slice(0, lastBreak) : clipped).trimEnd();
}

async function extractPdfText(file: File): Promise<ParsedDocument> {
  const pdfjsLib = await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  let doc: PDFDocumentProxy;
  try {
    doc = await task.promise;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new PdfParseError(`This PDF could not be opened (${reason}).`);
  }

  try {
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: unknown) => {
          const textItem = item as TextItem;
          if (typeof textItem.str !== 'string') return '';
          return textItem.hasEOL ? `${textItem.str}\n` : textItem.str;
        })
        .join(' ');
      pages.push(tidy(pageText));
      page.cleanup();
    }

    const text = tidy(pages.filter(Boolean).join('\n\n'));
    if (text.length < 200) {
      throw new PdfParseError(
        'Almost no selectable text was found. This looks like a scanned or image-only PDF — paste the text manually instead.',
      );
    }

    const metadataTitle = await doc
      .getMetadata()
      .then((meta: { info?: unknown }) => {
        const info = meta.info as { Title?: unknown } | undefined;
        return typeof info?.Title === 'string' ? info.Title.trim() : '';
      })
      .catch(() => '');

    return {
      title: metadataTitle || stripExtension(file.name),
      text,
      pageCount: doc.numPages,
      characterCount: text.length,
    };
  } finally {
    await task.destroy().catch(() => undefined);
  }
}

async function extractPlainText(file: File): Promise<ParsedDocument> {
  const text = tidy(await file.text());
  if (text.length < 200) {
    throw new PdfParseError('That file is too short to build a six-puzzle escape room from.');
  }
  return {
    title: stripExtension(file.name),
    text,
    pageCount: 1,
    characterCount: text.length,
  };
}

/** Extract study text from a .pdf, .txt or .md file entirely in the browser. */
export async function parseStudyFile(file: File): Promise<ParsedDocument> {
  if (isPdf(file)) return extractPdfText(file);
  if (isPlainText(file)) return extractPlainText(file);
  throw new PdfParseError(`Unsupported file type "${file.name}". Use a PDF, TXT or MD file.`);
}

/** Backup path: the player pasted raw study text straight into the setup screen. */
export function parsePastedText(raw: string, title = 'Pasted Study Notes'): ParsedDocument {
  const text = tidy(raw);
  if (text.length < 200) {
    throw new PdfParseError(
      'Paste at least a couple of paragraphs (200+ characters) so Black Mask has something to work with.',
    );
  }
  return { title, text, pageCount: 1, characterCount: text.length };
}
