import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  elementId: string;
  filename?: string;
  paperSize?: 'a4' | 'a3';
  orientation?: 'landscape' | 'portrait';
  marginMm?: number;
  qualityScale?: number;
}

/**
 * Utility to convert oklch(...) color strings into html2canvas-compatible hex or rgb/rgba colors.
 */
function convertOklchColorInString(str: string): string {
  if (!str || !str.includes('oklch')) return str;

  let ctx: CanvasRenderingContext2D | null = null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    ctx = canvas.getContext('2d');
  } catch {
    // Canvas fallback if not supported
  }

  return str.replace(/oklch\([^)]+\)/gi, (match) => {
    if (ctx) {
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = match;
        const res = ctx.fillStyle;
        if (res && !res.includes('oklch')) {
          return res;
        }
      } catch {
        // Fallthrough
      }
    }
    return 'rgb(30, 41, 59)';
  });
}

/**
 * Sanitizes all style tags and inline styles in a document to remove oklch calls
 */
function sanitizeDocumentColors(doc: Document) {
  try {
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach((styleEl) => {
      if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
        styleEl.textContent = convertOklchColorInString(styleEl.textContent);
      }
    });

    const elementsWithInlineStyle = doc.querySelectorAll('[style*="oklch"]');
    elementsWithInlineStyle.forEach((el) => {
      const currentStyle = el.getAttribute('style');
      if (currentStyle) {
        el.setAttribute('style', convertOklchColorInString(currentStyle));
      }
    });
  } catch (err) {
    console.warn('Error sanitizing document oklch colors:', err);
  }
}

/**
 * High quality client-side PDF export with standard margins compliant for DAB
 */
export async function exportElementToPdf({
  elementId,
  filename = 'چارت_سازمانی_شرکت_برکت_الله_غفوری_د_افغانستان_بانک.pdf',
  paperSize = 'a4',
  orientation = 'landscape',
  marginMm = 10,
  qualityScale = 2.5,
}: PdfExportOptions): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found for PDF export.`);
      return false;
    }

    // Sanitize oklch colors in current document before html2canvas runs
    sanitizeDocumentColors(document);

    // Force background color and high scale for crisp text and graphics
    const canvas = await html2canvas(element, {
      scale: qualityScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: Math.max(element.scrollWidth, 1200),
      onclone: (clonedDoc) => {
        sanitizeDocumentColors(clonedDoc);
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.padding = '20px';
          clonedElement.style.backgroundColor = '#ffffff';
          clonedElement.style.color = '#0f172a';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: paperSize,
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Standard DAB margins
    const printableWidth = pdfWidth - marginMm * 2;
    const printableHeight = pdfHeight - marginMm * 2;

    // Convert canvas px to mm (1 px ≈ 0.264583 mm)
    const imgWidthMm = (canvas.width * 0.264583) / qualityScale;
    const imgHeightMm = (canvas.height * 0.264583) / qualityScale;

    // Calculate scaling factor to fit within printable area
    const widthScale = printableWidth / imgWidthMm;
    const heightScale = printableHeight / imgHeightMm;
    const scaleFactor = Math.min(widthScale, heightScale, 1.0); // Don't enlarge beyond 100%

    const finalWidthMm = imgWidthMm * scaleFactor;
    const finalHeightMm = imgHeightMm * scaleFactor;

    // Center horizontally and top/center vertically with standard margin offset
    const xPos = marginMm + (printableWidth - finalWidthMm) / 2;
    const yPos = marginMm + (printableHeight - finalHeightMm) / 2;

    pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidthMm, finalHeightMm, undefined, 'FAST');

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Failed to export PDF:', err);
    return false;
  }
}

