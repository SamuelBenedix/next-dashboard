'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Rnd } from 'react-rnd';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components';
import { Services } from '@/services/serviceapi';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFRenderer = dynamic(() => import('@/components/ui/PdfRenderer'), {
  ssr: false,
});

export default function SignNowPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiService = new Services();
  const docId = typeof id === 'string' ? id : '';
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [desc, setDesc] = useState('');
  const [reason, setReason] = useState('');
  const [signatureX, setSignatureX] = useState(100);
  const [signatureY, setSignatureY] = useState(100);
  const [signatureWidth, setSignatureWidth] = useState(120);
  const [signatureHeight, setSignatureHeight] = useState(80);
  const pdfPaperHeight = 842;
  const pdfPaperWidth = 595;

  const formRef = useRef<{ validate: () => Promise<{ valid: boolean }> }>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!docId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('idFile', docId);
        const response = await apiService.downloadCertified(formData);
        setFileBuffer(response.data);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        Swal.fire('Error', 'Gagal memuat dokumen', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [docId]);

  const handleSubmit = async (param: 'sign' | 'reject') => {
    if (!id) return;
    const confirmText =
      param === 'sign'
        ? 'You are about to sign this document?'
        : 'You are about to reject this document?';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${param} it!`,
    });

    if (!result.isConfirmed) return;

    const valid = (await formRef.current?.validate())?.valid;
    if (!valid) {
      Swal.fire(
        'Validation Error',
        'Please fill in the reason field.',
        'error'
      );
      return;
    }

    const formData = new FormData();
    formData.append('IdDoc', id as string);
    formData.append('Reason', reason);
    formData.append('IsDraft', 'false');
    formData.append('IsApprove', param === 'sign' ? 'true' : 'false');

    if (param === 'sign') {
      formData.append('Xloc', Math.round(signatureX).toString());
      formData.append('Yloc', Math.round(signatureY).toString());
      const sizeAdjustment = pdfPaperWidth > pdfPaperHeight ? 20 : 10;
      formData.append('Size', (signatureWidth - sizeAdjustment).toString());
      formData.append('PageNumber', currentPage.toString());
      formData.append('SendToNpp', '');
    }

    try {
      setIsLoading(true);
      const response = await apiService.signCertified(formData);
      Swal.fire(
        'Validation Success',
        response.data.data.message,
        'success'
      ).then(() => {
        router.push('/documents');
      });
    } catch (error) {
      console.error('Error processing document:', error);
      Swal.fire('Error', `Failed to ${param} document`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      breadcrumb={{ parent: { name: 'Dashboard' }, current: 'Dokumen' }}
      createButtonText="Create Document"
      isCreate
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* PDF Area */}
        <div className="md:col-span-7 col-span-12 relative p-4 min-h-[calc(100vh-100px)] bg-gray-200">
          {fileBuffer ? (
            <>
              <div className="flex items-center mb-2">
                <select
                  className="p-2 border rounded"
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  value={currentPage}
                >
                  {Array.from({ length: numPages }, (_, i) => (
                    <option key={i} value={i + 1}>
                      Halaman {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative border" style={{ width: 'fit-content' }}>
                <PDFRenderer
                  fileBuffer={fileBuffer}
                  currentPage={currentPage}
                  onLoad={setNumPages}
                  onPageSize={() => {}}
                  signatureURL=""
                  position={{ x: signatureX, y: signatureY }}
                  sigSize={{ w: signatureWidth, h: signatureHeight }}
                  onRenderScaleChange={() => {}}
                />

                <Rnd
                  bounds="parent"
                  default={{
                    x: signatureX,
                    y: signatureY,
                    width: signatureWidth,
                    height: signatureHeight,
                  }}
                  onDragStop={(_, d) => {
                    setSignatureX(d.x);
                    setSignatureY(d.y);
                  }}
                  onResizeStop={(_, __, ref, ___, position) => {
                    setSignatureWidth(ref.offsetWidth);
                    setSignatureHeight(ref.offsetHeight);
                    setSignatureX(position.x);
                    setSignatureY(position.y);
                  }}
                  className="z-50"
                >
                  <div className="w-full h-full border-2 border-blue-500 bg-white/40 rounded-md flex items-center justify-center text-sm text-blue-700 font-semibold">
                    Signature
                  </div>
                </Rnd>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <h4 className="text-center">Dokumen akan ditampilkan di sini</h4>
            </div>
          )}
        </div>

        {/* Form Area */}
        <div className="md:col-span-5 col-span-12 px-4">
          <div className="space-y-4 w-full max-w-sm">
            <div className="grid gap-2 mt-3">
              <Label htmlFor="signature-desc">Keterangan Tambahan</Label>
              <Input
                id="signature-desc"
                type="text"
                placeholder="Masukkan keterangan tambahan"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="grid gap-2 mt-3">
              <Label htmlFor="signature-reason">Alasan Penandatanganan</Label>
              <Input
                id="signature-reason"
                type="text"
                placeholder="Masukkan alasan penandatanganan"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button onClick={() => handleSubmit('sign')}>
              {isLoading ? 'Memproses...' : 'Tandatangani Dokumen'}
            </Button>

            <Button
              className="ml-3"
              variant="destructive"
              onClick={() => handleSubmit('reject')}
            >
              {isLoading ? 'Memproses...' : 'Tolak Dokumen'}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 bg-white p-6 rounded-xl shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memproses data...</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
