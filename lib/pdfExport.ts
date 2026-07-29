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
 * Pure JS OKLCH to RGB/RGBA parser and converter.
 * Converts oklch(L C H [/ A]) or oklch(L, C, H, A) into rgb(r, g, b) or rgba(r, g, b, a).
 */
function parseOklchValues(match: string): { r: number; g: number; b: number; a: number } | null {
  try {
    const inner = match.replace(/^oklch\(\s*/i, '').replace(/\s*\)$/, '').trim();
    let parts: string[];
    let alphaStr: string | null = null;

    if (inner.includes('/')) {
      const slashParts = inner.split('/');
      alphaStr = slashParts[1].trim();
      parts = slashParts[0].trim().split(/[\s,]+/);
    } else {
      parts = inner.split(/[\s,]+/);
    }

    if (parts.length < 3) return null;

    let l = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) l = l / 100;

    let c = parseFloat(parts[1]);
    if (parts[1].endsWith('%')) c = c / 100;

    let h = parseFloat(parts[2]);
    if (parts[2].endsWith('deg')) h = parseFloat(parts[2]);

    let a = 1;
    if (alphaStr) {
      a = parseFloat(alphaStr);
      if (alphaStr.endsWith('%')) a = a / 100;
    } else if (parts.length >= 4) {
      a = parseFloat(parts[3]);
      if (parts[3].endsWith('%')) a = a / 100;
    }

    if (isNaN(l) || isNaN(c) || isNaN(h)) return null;

    // OKLCH -> OKLAB
    const hRad = (h * Math.PI) / 180;
    const aLab = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);

    // OKLAB -> Linear RGB
    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const toSrgb = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(255, srgb * 255)));
    };

    return {
      r: toSrgb(rLin),
      g: toSrgb(gLin),
      b: toSrgb(bLin),
      a: isNaN(a) ? 1 : Math.max(0, Math.min(1, a)),
    };
  } catch {
    return null;
  }
}

/**
 * Pure JS OKLAB to RGB/RGBA parser and converter.
 * Converts oklab(L a b [/ A]) or oklab(L, a, b, A) into rgb(r, g, b) or rgba(r, g, b, a).
 */
function parseOklabValues(match: string): { r: number; g: number; b: number; a: number } | null {
  try {
    const inner = match.replace(/^oklab\(\s*/i, '').replace(/\s*\)$/, '').trim();
    let parts: string[];
    let alphaStr: string | null = null;

    if (inner.includes('/')) {
      const slashParts = inner.split('/');
      alphaStr = slashParts[1].trim();
      parts = slashParts[0].trim().split(/[\s,]+/);
    } else {
      parts = inner.split(/[\s,]+/);
    }

    if (parts.length < 3) return null;

    let l = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) l = l / 100;

    let aLab = parseFloat(parts[1]);
    if (parts[1].endsWith('%')) aLab = aLab / 100;

    let bLab = parseFloat(parts[2]);
    if (parts[2].endsWith('%')) bLab = bLab / 100;

    let a = 1;
    if (alphaStr) {
      a = parseFloat(alphaStr);
      if (alphaStr.endsWith('%')) a = a / 100;
    } else if (parts.length >= 4) {
      a = parseFloat(parts[3]);
      if (parts[3].endsWith('%')) a = a / 100;
    }

    if (isNaN(l) || isNaN(aLab) || isNaN(bLab)) return null;

    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const toSrgb = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(255, srgb * 255)));
    };

    return {
      r: toSrgb(rLin),
      g: toSrgb(gLin),
      b: toSrgb(bLin),
      a: isNaN(a) ? 1 : Math.max(0, Math.min(1, a)),
    };
  } catch {
    return null;
  }
}

export function replaceOklchInString(str: string): string {
  if (!str) return str;
  let res = str;
  if (res.includes('oklch')) {
    res = res.replace(/oklch\([^)]+\)/gi, (match) => {
      const parsed = parseOklchValues(match);
      if (!parsed) return 'rgb(30, 41, 59)';
      if (parsed.a < 1) {
        return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a.toFixed(2)})`;
      }
      return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;
    });
  }
  if (res.includes('oklab')) {
    res = res.replace(/oklab\([^)]+\)/gi, (match) => {
      const parsed = parseOklabValues(match);
      if (!parsed) return 'rgb(30, 41, 59)';
      if (parsed.a < 1) {
        return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a.toFixed(2)})`;
      }
      return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;
    });
  }
  return res;
}

/**
 * Sanitizes all style tags, inline styles, and computed color properties in a document to remove oklch & oklab calls
 */
function sanitizeDocumentColors(doc: Document) {
  try {
    // 1. Sanitize all <style> tag contents
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach((styleEl) => {
      if (styleEl.textContent && (styleEl.textContent.includes('oklch') || styleEl.textContent.includes('oklab'))) {
        styleEl.textContent = replaceOklchInString(styleEl.textContent);
      }
    });

    // 2. Sanitize all elements with inline style containing oklch or oklab
    const elementsWithInlineStyle = doc.querySelectorAll('[style*="oklch"], [style*="oklab"]');
    elementsWithInlineStyle.forEach((el) => {
      const currentStyle = el.getAttribute('style');
      if (currentStyle) {
        el.setAttribute('style', replaceOklchInString(currentStyle));
      }
    });

    // 3. Convert computed color styles to inline RGB styles on all elements
    const allEls = doc.querySelectorAll('*');
    const colorProps = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 'outlineColor'];
    allEls.forEach((el) => {
      if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;
      try {
        const computed = window.getComputedStyle(el);
        colorProps.forEach((prop) => {
          const val = (computed as unknown as Record<string, unknown>)[prop];
          if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
            const rgbVal = replaceOklchInString(val);
            (el.style as unknown as Record<string, string>)[prop] = rgbVal;
          }
        });
      } catch {
        // Ignore un-gettable computed styles
      }
    });
  } catch (err) {
    console.warn('Error sanitizing document oklch/oklab colors:', err);
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


