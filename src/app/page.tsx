'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rnd } from 'react-rnd';
import { Upload } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { uploadModifyToService } from '@/utils/uploadModifyToService';
import { Services } from '@/services/serviceapi';

const apiService = new Services();
const PDFRenderer = dynamic(() => import('@/components/ui/PdfRenderer'), {
  ssr: false,
});

export default function PdfPage() {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileBufferArray, setFileBufferArray] = useState<Uint8Array | null>(
    null
  );
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [uploadedSigImage, setUploadedSigImage] = useState<string | null>(null);
  const [positionSign, setPositionSign] = useState({ x: 0, y: 0 });
  const [sigSize, setSigSize] = useState({ w: 100, h: 50 });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
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

  console.log('pdfRenderedSize', pdfRenderedSize);
  console.log('pdfOriginalSize', pdfOriginalSize);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setUploadedDocument(objectUrl);
    localStorage.setItem('documentURL', objectUrl);

    const arrayBuffer = await file.arrayBuffer(); // ← ini baru valid
    const bufferCopy = new Uint8Array(arrayBuffer.byteLength);
    bufferCopy.set(new Uint8Array(arrayBuffer));

    setFileBufferArray(bufferCopy);

    if (!file || file.type !== 'application/pdf') {
      alert('Mohon unggah file PDF!');
      return;
    }

    const buffer = await file.arrayBuffer();

    setFileBuffer(buffer);
    setUploadedSigImage(null);
  };

  const downloadPDFbyID = async (
    updateProgress: (progress: number) => void
  ) => {
    const getUploadID = localStorage.getItem('IdUpload');

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}${
      currentDate.getMonth() + 1
    }${currentDate.getFullYear()}`;

    const param = {
      FileId: getUploadID,
    };

    try {
      const fileData = await apiService.downloadFile(param);
      const blob = new Blob([fileData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${formattedDate}_BNI_SignatureNonCertificate.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      updateProgress(100);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL('image/png');
    setUploadedSigImage(dataURL);
    setShowSignatureModal(false);
  };

  const exportPDF = async () => {
    if (!fileBufferArray || !uploadedSigImage) {
      alert('Upload PDF dan tanda tangan terlebih dahulu!');
      return;
    }

    setLoading(true);
    try {
      // Hitung skala dari tampilan ke ukuran asli PDF
      const x = positionSign.x;
      const y = pdfRenderedSize.height - positionSign.y - sigSize.h - 250;

      const width = sigSize.w;
      const height = sigSize.h - 20;

      console.log('width', width);
      console.log('height', height);

      await uploadModifyToService({
        documentURL: uploadedDocument, // tidak digunakan karena kita punya file buffer
        capturedSignature: uploadedSigImage, // base64 image
        selectedImageUrl: '', // tidak pakai image mode
        currentPage: currentPage + 1, // karena page dimulai dari 1
        xCoordinate: x,
        yCoordinate: y,
        pdfPaperWidth: pdfRenderedSize.width,
        pdfPaperHeight: pdfRenderedSize.height,
        scale: 1, // tidak perlu penyesuaian karena posisi sudah dikalkulasi
        fileBytesOverride: fileBufferArray, // tambahan argumen jika perlu override
        width,
        height,
      });

      await downloadPDFbyID(setProgress);

      alert('Berhasil mengunggah PDF yang telah dimodifikasi.');
    } catch (err) {
      console.error('Error uploading PDF:', err);
      alert('Gagal mengunggah PDF');
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

            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={() => setShowSignatureModal(true)}
            >
              Tanda Tangan Manual
            </Button>
          </div>

          <div className="relative border" style={{ width: 'fit-content' }}>
            <PDFRenderer
              fileBuffer={fileBuffer}
              currentPage={currentPage}
              onLoad={(n) => setNumPages(n)}
              onPageSize={(size) => {
                console.log('size', size);
                setPdfRenderedSize(size);
              }}
              onRenderScaleChange={(scale, w, h) => {
                console.log('pdf w', w);
                console.log('pdf h', h);
                setPdfOriginalSize({ width: w, height: h });
              }}
            />

            {uploadedSigImage && (
              <Rnd
                size={{ width: sigSize.w, height: sigSize.h }}
                position={{ x: positionSign.x, y: positionSign.y }}
                onDragStop={(_, d) => {
                  setPositionSign({ x: d.x, y: d.y });
                }}
                onResizeStop={(_, __, ref) => {
                  console.log('ref.style.', ref.style);
                  setSigSize({
                    w: parseFloat(ref.style.width),
                    h: parseFloat(ref.style.height),
                  });
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

          {showSignatureModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 shadow-lg w-[500px] max-w-full">
                <h2 className="text-lg font-semibold mb-4">
                  Buat Tanda Tangan
                </h2>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="border border-gray-300 rounded cursor-crosshair"
                  onMouseDown={(e) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    ctx.beginPath();
                    const rect = canvas.getBoundingClientRect();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                    const draw = (moveEvent: MouseEvent) => {
                      ctx.lineTo(
                        moveEvent.clientX - rect.left,
                        moveEvent.clientY - rect.top
                      );
                      ctx.stroke();
                    };
                    const stop = () => {
                      window.removeEventListener('mousemove', draw);
                      window.removeEventListener('mouseup', stop);
                    };
                    window.addEventListener('mousemove', draw);
                    window.addEventListener('mouseup', stop);
                  }}
                />

                <div className="mt-4 flex justify-between">
                  <Button variant="ghost" onClick={clearCanvas}>
                    Clear
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowSignatureModal(false)}
                    >
                      Batal
                    </Button>
                    <Button onClick={confirmSignature}>
                      Gunakan Tanda Tangan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
