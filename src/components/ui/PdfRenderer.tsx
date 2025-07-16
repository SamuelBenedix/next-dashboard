'use client';
import { Document, Page } from 'react-pdf';
import { useEffect } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export default function PDFRenderer({
  fileBuffer,
  currentPage,
  onLoad,
  signatureURL,
  position,
  sigSize,
  onStartDrag,
  onStartResize,
  containerRef,
  onPageSize,
}) {
  const handleLoad = (doc) => onLoad(doc.numPages);

  return (
    <Document file={fileBuffer} onLoadSuccess={handleLoad}>
      <Page
        pageNumber={currentPage + 1}
        width={800}
        onRenderSuccess={({ width, height }) => {
          onPageSize?.({ width, height });
        }}
      />
      {signatureURL && (
        <>
          <img
            src={signatureURL}
            alt="sig"
            onMouseDown={onStartDrag}
            className="absolute cursor-move"
            style={{
              top: position.y,
              left: position.x,
              width: sigSize.w,
              height: sigSize.h,
            }}
          />
          <div
            onMouseDown={onStartResize}
            className="absolute bg-blue-500 h-4 w-4 cursor-se-resize"
            style={{
              top: position.y + sigSize.h - 4,
              left: position.x + sigSize.w - 4,
            }}
          />
        </>
      )}
    </Document>
  );
}
