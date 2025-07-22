'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Rnd } from 'react-rnd';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components';
import { Services } from '@/services/serviceapi';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import InputDropdown from '@/components/ui/input-dropdown';

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
  const apiService = new Services(); // ✅ Create an instance
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pegawai, setPegawai] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // PDF States
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pdfRenderedSize, setPdfRenderedSize] = useState({
    width: 0,
    height: 0,
  });

  // Signature Box States
  const [showSignatureBox, setShowSignatureBox] = useState(false);
  const [signatureX, setSignatureX] = useState(0);
  const [signatureY, setSignatureY] = useState(0);
  const [signatureWidth, setSignatureWidth] = useState(200);
  const [signatureHeight, setSignatureHeight] = useState(100);

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
      setIsLoading(true);
      const buffer = await selectedFile.arrayBuffer();
      console.log('buffer', buffer);
      setFileBuffer(buffer);
      setFile(selectedFile);
      setIsUploaded(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
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
  }, []);

  async function handleSubmit(param: 'draft' | 'send' | 'sign') {
    if (!file && param !== 'send') {
      Swal.fire('Error', 'Please upload a PDF document', 'error');
      return;
    }

    try {
      const confirm = await Swal.fire({
        title: 'Are you sure?',
        text:
          param === 'draft'
            ? 'You are about to save this document as a draft.'
            : param === 'sign'
            ? 'You are about to sign this document.'
            : 'You are about to send this document.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${param}!`,
      });

      if (!confirm.isConfirmed) return;
      setIsLoading(true);

      // Form validation
      if (param === 'sign' && !reason) {
        Swal.fire(
          'Validation Error',
          'Please fill in the reason field.',
          'error'
        );
        return;
      }
      if (param === 'send' && !recipient) {
        Swal.fire(
          'Validation Error',
          'Please provide recipient and description.',
          'error'
        );
        return;
      }

      try {
        const formData = new FormData();

        if (file) formData.append('Document', file);
        if (reason) formData.append('Reason', reason);
        if (recipient) formData.append('SendToNpp', recipient);

        if (param === 'sign') {
          formData.append('Xloc', Math.round(signatureX).toString());
          formData.append('Yloc', Math.round(signatureY).toString());
          formData.append('Size', signatureWidth.toString());
          formData.append('PageNumber', currentPage.toString());
          formData.append('IsDraft', 'false');
        } else {
          formData.append('IsDraft', param === 'draft' ? 'true' : 'false');
        }

        const response = await apiService.signCertified(formData);

        Swal.fire(
          'Success',
          response.data.data.message || 'Operation completed',
          'success'
        ).then(() => {
          router.push('/documents');
        });
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error during submission:', error);
    } finally {
      setIsLoading(false);
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
        {/* PDF Viewer */}
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
                  position={{ x: signatureX, y: signatureY }}
                  sigSize={{ w: signatureWidth, h: signatureHeight }}
                  onRenderScaleChange={() => {}} // Provide actual handler if needed
                />

                {showSignatureBox && (
                  <Rnd
                    bounds="parent"
                    default={{
                      x: pdfRenderedSize.height / 2 - 450,
                      y: pdfRenderedSize.height / 2,
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
                  <Label htmlFor="signature-desc">
                    Konfirmasi Tanda Tangan
                  </Label>
                  <Input
                    id="signature-desc"
                    type="text"
                    placeholder="Masukkan deskripsi"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
            )}
            {isUploaded && (
              <>
                {showSignatureBox ? (
                  <Button
                    variant="default"
                    onClick={() => {
                      handleSubmit('sign');
                    }}
                  >
                    Sign
                  </Button>
                ) : (
                  <Button
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

            {isUploaded && (
              <Button
                className="ml-3"
                variant="default"
                onClick={() => {
                  handleSubmit('draft');
                }}
              >
                Draft
              </Button>
            )}
          </div>
        </div>
      </div>
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
