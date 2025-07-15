'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Dynamically import the PDF viewer component (client only)
const PDFViewer = dynamic(() => import('@/components/ui/PdfViewer'), {
  ssr: false,
});

export default function PdfPage() {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported!');
      return;
    }

    const buffer = await file.arrayBuffer();
    setFileBuffer(buffer);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Tanda Tangan Elektronik
      </h1>

      <Card className="mb-6">
        <CardContent className=" flex flex-col items-center gap-2">
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            Hanya file PDF yang diperbolehkan
          </p>
        </CardContent>
      </Card>

      {fileBuffer ? (
        <Card>
          <CardContent className="p-4">
            <PDFViewer fileBuffer={fileBuffer} />
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground text-center">
          Tidak ada file PDF yang diunggah.
        </p>
      )}
    </div>
  );
}
