// src/app/signature/page.tsx

'use client';

import React, { useState, useRef } from 'react';

import dynamic from 'next/dynamic';

import SignatureCanvas from 'react-signature-canvas';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import 'react-pdf/dist/Page/AnnotationLayer.css';

import 'react-pdf/dist/Page/TextLayer.css';

import { PDFDocument } from 'pdf-lib';

import { Buffer } from 'buffer';

const PDFRenderer = dynamic(() => import('@/components/ui/PdfRenderer'), {
  ssr: false,
});

export default function PdfPage() {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  const [pdfBase64, setPdfBase64] = useState<string>('');

  const [signatureURL, setSignatureURL] = useState<string | null>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 }); // Position in CSS pixels

  const [sigSize, setSigSize] = useState({ w: 0, h: 0 }); // Size in CSS pixels

  const [pdfRenderedSize, setPdfRenderedSize] = useState({
    width: 0,

    height: 0,
  }); // Rendered PDF size in CSS pixels

  const [pdfOriginalSize, setPdfOriginalSize] = useState({
    width: 0,

    height: 0,
  }); // Original PDF size in PDF points

  const [pdfRenderScale, setPdfRenderScale] = useState(1); // Scale from PDF points to CSS pixels

  const [isDragging, setIsDragging] = useState(false);

  const [isResizing, setIsResizing] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  const [numPages, setNumPages] = useState(0);

  const [drawMode, setDrawMode] = useState(true);

  const sigRef = useRef<SignatureCanvas>(null);

  const contRef = useRef<HTMLDivElement>(null); // Reference to the main PDF container

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || file.type !== 'application/pdf') {
      alert('PDF only!');

      return;
    }

    const buffer = await file.arrayBuffer();

    const base64String = Buffer.from(buffer).toString('base64');

    setFileBuffer(buffer);

    setPdfBase64(base64String);

    setSignatureURL(null);

    sigRef.current?.clear();

    setPosition({ x: 0, y: 0 }); // Reset position to top-left

    setSigSize({ w: 0, h: 0 }); // Reset size to trigger initial sizing from onPageSize

    setPdfRenderedSize({ width: 0, height: 0 });

    setPdfOriginalSize({ width: 0, height: 0 });

    setPdfRenderScale(1);
  };

  const handleClearSignature = () => {
    sigRef.current?.clear();

    setSignatureURL(null);

    // Option 1: Keep the signature box size/position as is after clearing drawing

    // Option 2: Reset position and size of the signature box to full PDF size for a new drawing

    // If you want option 2, uncomment the following lines:

    // if (pdfRenderedSize.width > 0 && pdfRenderedSize.height > 0) {

    // setPosition({ x: 0, y: 0 });

    // setSigSize({ w: pdfRenderedSize.width, h: pdfRenderedSize.height });

    // }
  };

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!drawMode) {
      setIsDragging(true);
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!drawMode) {
      setIsResizing(true);
    }
  };

  const handleMove = (e: React.MouseEvent) => {
    if (!contRef.current) return;

    const b = contRef.current.getBoundingClientRect();

    if (isDragging) {
      setPosition({
        x: e.clientX - b.left - sigSize.w / 2,

        y: e.clientY - b.top - sigSize.h / 2,
      });
    }

    if (isResizing) {
      const newW = e.clientX - b.left - position.x;

      const newH = e.clientY - b.top - position.y;

      setSigSize({ w: Math.max(50, newW), h: Math.max(25, newH) });
    }
  };

  const endAction = () => {
    setIsDragging(false);

    setIsResizing(false);
  };

  const exportPDF = async () => {
    if (!pdfBase64) {
      alert('Please upload a PDF first!');

      return;
    }

    let finalSignatureDataUrl = signatureURL;

    if (!finalSignatureDataUrl && !sigRef.current?.isEmpty()) {
      finalSignatureDataUrl = sigRef.current

        ?.getTrimmedCanvas()

        .toDataURL('image/png');
    }

    if (!finalSignatureDataUrl) {
      alert('Please add a signature first!');

      return;
    }

    if (
      sigSize.w === 0 ||
      sigSize.h === 0 ||
      pdfOriginalSize.width === 0 ||
      pdfOriginalSize.height === 0 ||
      pdfRenderScale === 0
    ) {
      alert(
        'PDF or signature dimensions are not set, or rendering scale is not determined. Please upload a PDF and ensure signature area is visible.'
      );

      return;
    }

    const xInPdfPoints = position.x / pdfRenderScale;

    const yInPdfPoints = position.y / pdfRenderScale;

    const widthInPdfPoints = sigSize.w / pdfRenderScale;

    const heightInPdfPoints = sigSize.h / pdfRenderScale;

    const yForPdfLib =
      pdfOriginalSize.height - yInPdfPoints - heightInPdfPoints;

    try {
      const pdfBytes = Buffer.from(pdfBase64, 'base64');

      const pdfDoc = await PDFDocument.load(pdfBytes);

      const pages = pdfDoc.getPages();

      if (currentPage < 0 || currentPage >= pages.length) {
        alert('Invalid page selected.');

        return;
      }

      const page = pages[currentPage];

      const base64Image = finalSignatureDataUrl.split(',')[1];

      if (!base64Image) {
        throw new Error('Invalid signature data URL.');
      }

      const imageBytes = Buffer.from(base64Image, 'base64');

      const pngImage = await pdfDoc.embedPng(imageBytes);

      page.drawImage(pngImage, {
        x: xInPdfPoints,

        y: yForPdfLib,

        width: widthInPdfPoints,

        height: heightInPdfPoints,
      });

      const signedPdfBytes = await pdfDoc.save();

      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'signed_document.pdf';

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting PDF:', error);

      alert(`Error exporting PDF: ${error.message}`);
    }
  };

  return (
    <div
      className="p-6 max-w-4xl mx-auto"
      onMouseMove={handleMove}
      onMouseUp={endAction}
      onMouseLeave={endAction}
    >
      <Input type="file" accept="application/pdf" onChange={handleUpload} />

      {fileBuffer && (
        <>
          <div className="flex gap-2 mt-4 items-center">
            <select
              className="p-2 border rounded"
              onChange={(e) => setCurrentPage(+e.target.value)}
              value={currentPage}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <option key={i} value={i}>
                  Page {i + 1}
                </option>
              ))}
            </select>

            <Button
              onClick={() => setDrawMode(!drawMode)}
              variant={drawMode ? 'default' : 'outline'}
            >
              {drawMode ? 'Switch to Move/Resize Mode' : 'Switch to Draw Mode'}
            </Button>
          </div>

          <div className="relative border mt-4" ref={contRef}>
            {/* PDF as background */}

            <div className="relative z-0">
              <PDFRenderer
                fileBuffer={fileBuffer}
                currentPage={currentPage}
                onLoad={(n) => setNumPages(n)}
                onPageSize={(size) => {
                  setPdfRenderedSize(size); // Store the rendered pixel size

                  // <--- IMPORTANT CHANGE HERE ---

                  // Initialize signature canvas size to match the rendered PDF size

                  // This ensures the canvas covers the whole PDF area initially

                  if (sigSize.w === 0 && sigSize.h === 0) {
                    // Only set if not already set by user interaction

                    setSigSize({ w: size.width, h: size.height });
                  }

                  // --- END IMPORTANT CHANGE ---
                }}
                onRenderScaleChange={(
                  scale,

                  originalPdfWidth,

                  originalPdfHeight
                ) => {
                  setPdfRenderScale(scale);

                  setPdfOriginalSize({
                    width: originalPdfWidth,

                    height: originalPdfHeight,
                  });

                  // The initial sigSize is now handled by onPageSize, no need for redundant logic here
                }}
              />
            </div>

            {/* Signature layer (z-10 to be on top of PDF) */}

            <div
              className="absolute border bg-transparent z-10"
              style={{
                top: position.y,

                left: position.x,

                width: sigSize.w, // This will now match pdfRenderedSize.width

                height: sigSize.h, // This will now match pdfRenderedSize.height

                pointerEvents: drawMode ? 'none' : 'auto', // Disable pointer events in move/resize mode for canvas
              }}
              onMouseDown={(e) => {
                if (!drawMode) startDrag(e);
              }}
            >
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                backgroundColor="transparent"
                canvasProps={{
                  width: sigSize.w,

                  height: sigSize.h,

                  className: 'w-full h-full',

                  style: { pointerEvents: drawMode ? 'auto' : 'none' }, // Disable pointer events in move/resize mode for canvas
                }}
              />

              {!drawMode && (
                <div
                  onMouseDown={startResize}
                  className="absolute bg-blue-500 h-4 w-4 right-0 bottom-0 cursor-se-resize"
                />
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={handleClearSignature}>
              Clear Signature
            </Button>

            <Button onClick={exportPDF}>Export Signed PDF</Button>
          </div>
        </>
      )}
    </div>
  );
}
