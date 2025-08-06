/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Rnd } from 'react-rnd';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components';
import { Services } from '@/services/serviceapi';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';

const PDFRenderer = dynamic(() => import('@/components/ui/PdfRenderer'), {
  ssr: false,
});

export default function SignNowPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiService = new Services();
  const { showConfirmDialog, ConfirmDialog } = useConfirmDialog();
  const { showAlertDialog, AlertDialog } = useAlertDialog();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const docId = typeof id === 'string' ? id : '';
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [desc, setDesc] = useState('');
  const [reason, setReason] = useState('');
  const [pdfRenderedSize, setPdfRenderedSize] = useState({
    width: 0,
    height: 0,
  });
  const [positionSign, setPositionSign] = useState({
    x: 64,
    y: 176,
  });
  const [sigSize, setSigSize] = useState({ w: 100, h: 100 });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!docId) return;

    const load = async () => {
      showLoading('Memuat Data Document');
      try {
        const formData = new FormData();
        formData.append('idFile', docId);
        const response = await apiService.downloadCertified(formData);
        const arrayBuffer = response.data; // this is ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' }); // 👈 manually specify MIME type
        const file = new File([blob], 'document.pdf', {
          type: 'application/pdf',
        }); // 👌 now it's a valid File
        setFile(file);
        setFileBuffer(response.data);
      } catch (error) {
        console.log('error', error);
        await showAlertDialog({
          title: 'Error',
          description: 'Gagal Memuat Document',
          variant: 'destructive',
        });
      } finally {
        hideLoading();
      }
    };

    load();
  }, [docId]);

  const handleSubmit = async (param: 'sign' | 'reject') => {
    if (!id) return;

    const confirmed = await showConfirmDialog({
      title: 'Are you sure?',
      description:
        param === 'sign'
          ? 'You are about to sign this document?'
          : 'You are about to reject this document?',
      confirmText: `Yes, ${param}!`,
    });

    if (!confirmed) return;

    const formData = new FormData();

    if (file) formData.append('Document', file);
    formData.append('idFile', id as string);
    formData.append('reason', reason);
    formData.append('keterangan', desc);
    formData.append('IsDraft', 'false');
    formData.append('IsApprove', param === 'sign' ? 'true' : 'false');

    const x = positionSign.x + 65;
    const y = pdfRenderedSize.height - positionSign.y - sigSize.h - 240;
    const width = sigSize.w;

    if (param === 'sign') {
      formData.append('Xloc', Math.round(x).toString());
      formData.append('Yloc', Math.round(y).toString());
      formData.append('Size', width.toString());
      formData.append('PageNumber', currentPage.toString());
      formData.append('SendToNpp', '');
    }

    try {
      showLoading();
      const response = await apiService.signCertified(formData);
      await showAlertDialog({
        title: 'Success',
        description: response.data.data.message || 'Operation completed.',
        variant: 'success',
      });
      router.push('/documents');
    } catch (error) {
      console.error('Error processing document:', error);
      await showAlertDialog({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      hideLoading();
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
                  onPageSize={setPdfRenderedSize}
                  signatureURL=""
                  position={positionSign}
                  sigSize={sigSize}
                  onRenderScaleChange={() => {}}
                />

                <Rnd
                  bounds="parent"
                  default={{
                    x: positionSign.x,
                    y: positionSign.y,
                    width: sigSize.w,
                    height: sigSize.h,
                  }}
                  onDragStop={(_, d) => {
                    setPositionSign({ x: d.x, y: d.y });
                  }}
                  onResizeStop={(_, __, ref) => {
                    console.log();
                    setSigSize({
                      w: parseFloat(ref.style.width),
                      h: parseFloat(ref.style.height),
                    });
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
            <Button
              className="mr-3"
              variant="destructive"
              onClick={() => handleSubmit('reject')}
            >
              Tolak Document
            </Button>

            <Button
              disabled={reason.length === 0 || desc.length === 0}
              onClick={() => handleSubmit('sign')}
            >
              Tandatangani Dokumen
            </Button>
          </div>
        </div>
      </div>
      {ConfirmDialog}
      {AlertDialog}
    </AppLayout>
  );
}
