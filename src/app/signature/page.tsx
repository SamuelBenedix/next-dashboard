'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'buffer';
import { Rnd } from 'react-rnd';
import { Upload } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFRenderer = dynamic(() => import('@/components/ui/PdfRenderer'), {
  ssr: false,
});

export default function PdfPage() {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [uploadedSigImage, setUploadedSigImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [sigSize, setSigSize] = useState({ w: 150, h: 75 });
  const [pdfRenderedSize, setPdfRenderedSize] = useState({
    width: 0,
    height: 0,
  });
  const [pdfOriginalSize, setPdfOriginalSize] = useState({
    width: 0,
    height: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Mohon unggah file PDF!');
      return;
    }

    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');

    setFileBuffer(buffer);
    setPdfBase64(base64String);
    setUploadedSigImage(null);
    setPosition({ x: 0, y: 0 });
  };

  const exportPDF = async () => {
    if (!pdfBase64 || !uploadedSigImage) {
      alert('Harap unggah PDF dan tanda tangan terlebih dahulu!');
      return;
    }

    try {
      setLoading(true);

      const pdfBytes = Buffer.from(pdfBase64, 'base64');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[currentPage];

      const base64Image = uploadedSigImage.split(',')[1];
      const imageBytes = Buffer.from(base64Image, 'base64');
      const pngImage = await pdfDoc.embedPng(imageBytes);

      // Ukuran asli PNG dalam point
      const pngDims = pngImage.scale(1); // point (1 point = 1/72 inch)

      // Konversi pixel ke point berdasarkan lebar
      const pixelToPdfX = pdfOriginalSize.width / pdfRenderedSize.width;

      // Ukuran tampilan (di layar) dikonversi ke ukuran PDF
      const widthInPdfPoints = sigSize.w * pixelToPdfX;

      // Gunakan rasio gambar PNG untuk menghitung tinggi PDF
      const heightInPdfPoints =
        (widthInPdfPoints / pngDims.width) * pngDims.height;

      // Posisi
      const xInPdfPoints = position.x * pixelToPdfX;
      const yRatio = position.y / pdfRenderedSize.height;
      const yInPdfPoints = pdfOriginalSize.height * yRatio;

      // Koreksi posisi Y karena titik 0 PDF di kiri bawah
      const yForPdfLib =
        pdfOriginalSize.height - yInPdfPoints - heightInPdfPoints;

      // Gambar tanda tangan di halaman
      page.drawImage(pngImage, {
        x: xInPdfPoints,
        y: yForPdfLib - 10,
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
      alert(`Gagal ekspor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Input type="file" accept="application/pdf" onChange={handleUpload} />

      {fileBuffer && (
        <>
          <div className="flex items-center gap-4">
            <select
              className="p-2 border rounded"
              onChange={(e) => setCurrentPage(+e.target.value)}
              value={currentPage}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <option key={i} value={i}>
                  Halaman {i + 1}
                </option>
              ))}
            </select>

            <label className="cursor-pointer flex items-center gap-2 p-2 border rounded hover:bg-gray-100">
              <Upload className="w-5 h-5" />
              <span className="text-sm">Upload Tanda Tangan</span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size <= 2 * 1024 * 1024) {
                    const reader = new FileReader();
                    reader.onload = () =>
                      setUploadedSigImage(reader.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    alert('Maksimal ukuran gambar adalah 2MB.');
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <div className="relative border" style={{ width: 'fit-content' }}>
            <PDFRenderer
              fileBuffer={fileBuffer}
              currentPage={currentPage}
              onLoad={(n) => setNumPages(n)}
              onPageSize={(size) => setPdfRenderedSize(size)}
              onRenderScaleChange={(scale, w, h) => {
                setPdfOriginalSize({ width: w, height: h });
              }}
            />

            {uploadedSigImage && (
              <Rnd
                size={{ width: sigSize.w, height: sigSize.h }}
                position={{ x: position.x, y: position.y }}
                onDragStop={(_, d) => setPosition({ x: d.x, y: d.y })}
                onResizeStop={(_, __, ref, ___, pos) => {
                  setSigSize({
                    w: parseFloat(ref.style.width),
                    h: parseFloat(ref.style.height),
                  });
                  setPosition(pos);
                }}
                bounds="parent"
                lockAspectRatio={true}
                style={{
                  zIndex: 10,
                  border: '2px dashed #3b82f6',
                  borderRadius: '4px',
                }}
              >
                <img
                  src={uploadedSigImage}
                  alt="signature"
                  className="w-full h-full object-contain"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                />
              </Rnd>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setUploadedSigImage(null)}
              disabled={!uploadedSigImage}
            >
              Hapus Tanda Tangan
            </Button>
            <Button onClick={exportPDF} disabled={loading}>
              {loading ? 'Mengekspor...' : 'Ekspor PDF Bertanda Tangan'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
