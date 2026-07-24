import { requireNativeModule } from 'expo-modules-core';

// Lazy-load the native module so importing this file never throws at
// module-evaluation time (which would prevent route components that import
// it — e.g. upload.tsx — from registering their default export).
let cached: any | null | undefined;
function getModule(): any | null {
  if (cached !== undefined) return cached;
  try {
    cached = requireNativeModule('PdfTextExtractor');
  } catch {
    cached = null;
  }
  return cached;
}

export function isPdfExtractorAvailable(): boolean {
  return getModule() !== null;
}

/**
 * Extract all text from a PDF file using iOS native PDFKit.
 * @param fileUri - file:// URI or absolute path to the PDF
 * @returns The extracted text content
 */
export async function extractPdfText(fileUri: string): Promise<string> {
  const mod = getModule();
  if (!mod) {
    throw new Error(
      'PdfTextExtractor native module is not available. Rebuild the dev client (npx expo prebuild && npx expo run:ios) so the local module is linked.'
    );
  }
  return await mod.extractText(fileUri);
}
