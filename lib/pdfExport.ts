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

    // Force background color and high scale for crisp text and graphics
    const canvas = await html2canvas(element, {
      scale: qualityScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: Math.max(element.scrollWidth, 1200),
      onclone: (clonedDoc) => {
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
    const imgWidthMm = canvas.width * 0.264583 / qualityScale;
    const imgHeightMm = canvas.height * 0.264583 / qualityScale;

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
