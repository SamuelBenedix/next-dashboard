'use client';
import { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';

import 'react-pdf/dist/Page/TextLayer.css';

import { pdfjs } from 'react-pdf';

// Set up PDF.js worker

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PDFRendererProps {
  fileBuffer: ArrayBuffer | null;

  currentPage: number;

  onLoad: (numPages: number) => void;

  // These props are for display within PDFRenderer, but PdfPage also uses them for the overlay

  signatureURL: string | null;

  position: { x: number; y: number };

  sigSize: { w: number; h: number };

  // These are not actually used by PDFRenderer itself, but passed through for clarity

  onStartDrag?: (e: React.MouseEvent) => void;

  onStartResize?: (e: React.MouseEvent) => void;

  containerRef?: React.RefObject<HTMLDivElement>;

  onPageSize: (size: { width: number; height: number }) => void;

  // NEW: Callback to provide the actual render scale and original PDF dimensions

  onRenderScaleChange: (
    scale: number,

    originalPdfWidth: number,

    originalPdfHeight: number
  ) => void;
}

export default function PDFRenderer({
  fileBuffer,

  currentPage,

  onLoad,

  // Removed signatureURL, position, sigSize, onStartDrag, onStartResize, containerRef from here

  // as the overlay is now solely managed by PdfPage.tsx

  onPageSize,
}: PDFRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleLoadSuccess = (doc: { numPages: number }) => {
    onLoad(doc.numPages);
  };

  const handlePageLoadSuccess = (page: {
    originalWidth: number;
    originalHeight: number;
  }) => {
    // 'any' for page object as its full type is complex

    const originalWidth = page.originalWidth; // Original width in PDF points

    const originalHeight = page.originalHeight; // Original height in PDF points

    const renderedWidthInPx = 800; // This matches the 'width' prop set on the <Page> component

    // Calculate the actual scale factor based on the rendered width

    const calculatedScale = renderedWidthInPx / originalWidth;

    // Report the rendered dimensions (in CSS pixels) back to parent

    // The height will be proportionally scaled

    onPageSize({
      width: renderedWidthInPx,

      height: originalHeight * calculatedScale,
    });

    // Report the calculated scale and original PDF dimensions back to parent
  };

  return (
    <Document file={fileBuffer} onLoadSuccess={handleLoadSuccess}>
      <Page
        pageNumber={currentPage + 1}
        width={containerWidth} // This forces the PDF to render at 800px width in the browser
        onLoadSuccess={handlePageLoadSuccess} // Use this callback to get actual scale
        renderAnnotationLayer={false} // Disable default layers to prevent double rendering if overlay is custom
        renderTextLayer={false} // Disable default layers
      />

      {/*

The signature image and its resize handle are now managed entirely by the

PdfPage component as an absolute overlay. So, this part is removed from here.

*/}
    </Document>
  );
}
