'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Rnd } from 'react-rnd';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components';
import { Services } from '@/services/serviceapi';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import InputDropdown from '@/components/ui/input-dropdown';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';

const PDFRenderer = dynamic(() => import('@/components/ui/PdfRenderer'), {
  ssr: false,
});

type Pegawai = {
  npp: string;
  nama: string;
  email: string;
  alias: string;
};

export default function PdfPage() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const { showConfirmDialog, ConfirmDialog } = useConfirmDialog();
  const { showAlertDialog, AlertDialog } = useAlertDialog();
  const apiService = new Services(); // ✅ Create an instance
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pegawai, setPegawai] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pdfRenderedSize, setPdfRenderedSize] = useState({
    width: 0,
    height: 0,
  });

  const [showSignatureBox, setShowSignatureBox] = useState(false);
  const [positionSign, setPositionSign] = useState({
    x: 64,
    y: 176,
  });
  const [sigSize, setSigSize] = useState({ w: 100, h: 100 });

  // Form Fields
  const [reason, setReason] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      alert('Mohon unggah file PDF!');
      return;
    }

    try {
      showLoading();
      const buffer = await selectedFile.arrayBuffer();
      console.log('buffer', buffer);
      setFileBuffer(buffer);
      setFile(selectedFile);
      setIsUploaded(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await apiService.getListPegawai();
      const filtered = data.data.data.filter(
        (item: Pegawai) => item.nama !== 'ADMINISTRATOR'
      );

      setPegawai(filtered);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(param: 'draft' | 'send' | 'sign') {
    if (!file && param !== 'send') {
      await showAlertDialog({
        title: 'Error',
        description: 'Please upload a PDF document',
        variant: 'destructive',
      });
      return;
    }
    try {
      const confirmed = await showConfirmDialog({
        title: 'Are you sure?',
        description:
          param === 'draft'
            ? 'You are about to save this document as a draft.'
            : param === 'sign'
            ? 'You are about to sign this document.'
            : 'You are about to send this document.',
        confirmText: `Yes, ${param}!`,
      });
      if (!confirmed) return;
      showLoading();
      // Validation
      if (param === 'sign' && !reason) {
        await showAlertDialog({
          title: 'Validation Error',
          description: 'Please fill in the reason field.',
          variant: 'destructive',
        });
        return;
      }
      if (param === 'send' && !recipient) {
        await showAlertDialog({
          title: 'Validation Error',
          description: 'Please provide recipient and description.',
          variant: 'destructive',
        });
        return;
      }
      try {
        const formData = new FormData();
        if (file) formData.append('Document', file);
        if (reason) formData.append('Reason', reason);
        if (recipient) formData.append('SendToNpp', recipient);
        const x = positionSign.x + 65;
        const y = pdfRenderedSize.height - positionSign.y - sigSize.h - 240;
        const width = sigSize.w;
        if (param === 'sign') {
          formData.append('Xloc', Math.round(x).toString());
          formData.append('Yloc', Math.round(y).toString());
          formData.append('Size', width.toString());
          formData.append('PageNumber', currentPage.toString());
          formData.append('IsDraft', 'false');
        } else {
          formData.append('IsDraft', param === 'draft' ? 'true' : 'false');
        }
        const response = await apiService.signCertified(formData);
        await showAlertDialog({
          title: 'Success',
          description: response.data.data.message || 'Operation completed.',
          variant: 'success',
        });
        router.push('/documents');
      } catch (error) {
        console.error(error);
        await showAlertDialog({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during submission:', error);
    } finally {
      hideLoading();
    }
  }

  return (
    <AppLayout
      breadcrumb={{
        parent: { name: 'Dashboard' },
        current: 'Dokumen',
      }}
      createButtonText="Create Document"
      isCreate
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7 col-span-12 relative p-4 min-h-[calc(100vh-100px)] bg-gray-200">
          {fileBuffer ? (
            <>
              <div className="flex items-center mb-2">
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
              </div>

              <div className="relative border" style={{ width: 'fit-content' }}>
                <PDFRenderer
                  fileBuffer={fileBuffer}
                  currentPage={currentPage}
                  onLoad={setNumPages}
                  onPageSize={setPdfRenderedSize}
                  signatureURL={''} // Provide actual signature image URL if available
                  position={positionSign}
                  sigSize={sigSize}
                  onRenderScaleChange={() => {}} // Provide actual handler if needed
                />

                {showSignatureBox && (
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
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <h4 className="text-center">Dokumen akan ditampilkan di sini</h4>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-5 col-span-12 px-4">
          <div className="space-y-4 w-full max-w-sm">
            <div className="grid gap-2">
              <Label htmlFor="upload-pdf">Unggah Dokumen PDF</Label>
              <Input
                id="upload-pdf"
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                className="cursor-pointer"
              />
            </div>

            {isUploaded && (
              <div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms-2"
                    checked={showSignatureBox}
                    onCheckedChange={(checked) =>
                      setShowSignatureBox(!!checked)
                    }
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="terms-2" className="font-medium">
                      Tanda Tangan Digital
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Centang untuk menampilkan kolom tanda tangan di atas
                      dokumen sebagai verifikasi digital.
                    </p>
                  </div>
                </div>
                {!showSignatureBox && (
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="signature-desc">
                      Konfirmasi Tanda Tangan
                    </Label>
                    <InputDropdown<Pegawai>
                      data={pegawai}
                      labelKey="nama"
                      valueKey="npp"
                      filterKey="nama"
                      filterExclude="ADMINISTRATOR"
                      placeholder="Pilih Pegawai"
                      onChange={(val) => {
                        setRecipient(val);
                      }}
                    />
                  </div>
                )}
                <div className="grid gap-2 mt-3">
                  <Label htmlFor="signature-desc">Reason</Label>
                  <Input
                    id="signature-desc"
                    type="text"
                    placeholder="Masukkan Alasan"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
            )}
            {isUploaded && (
              <Button
                className="mr-3"
                variant="outline"
                onClick={() => {
                  handleSubmit('draft');
                }}
              >
                Draft
              </Button>
            )}
            {isUploaded && (
              <>
                {showSignatureBox ? (
                  <Button
                    disabled={reason.length === 0} // disable if no reason provided
                    variant="default"
                    onClick={() => {
                      handleSubmit('sign');
                    }}
                  >
                    Sign
                  </Button>
                ) : (
                  <Button
                    disabled={reason.length === 0 || recipient.length === 0}
                    variant="default"
                    onClick={() => {
                      handleSubmit('send');
                    }}
                  >
                    Send
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {ConfirmDialog}
      {AlertDialog}
    </AppLayout>
  );
}
