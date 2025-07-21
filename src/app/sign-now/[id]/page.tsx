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
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import InputDropdown from '@/components/ui/input-dropdown';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';

const PDFRenderer = dynamic(() => import('@/components/ui/PdfRenderer'), {
  ssr: false,
});

type Pegawai = {
  npp: string;
  nama: string;
  email: string;
  alias: string;
};

export default function SignNowPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiService = new Services();
  const docId = typeof id === 'string' ? id : '';

  const [pdfDoc, setPdfDoc] = useState<PDFDocument>();
  const [fileBuffer, setFileBuffer] = useState<Uint8Array>();
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [reason, setReason] = useState('');
  const [recipient, setRecipient] = useState('');
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);

  const [signatureX, setSignatureX] = useState(100);
  const [signatureY, setSignatureY] = useState(100);
  const [signatureWidth, setSignatureWidth] = useState(120);
  const [signatureHeight, setSignatureHeight] = useState(80);
  const [showSignatureBox, setShowSignatureBox] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('idFile', id);

        const blobResponse = await apiService.downloadCertified(formData);
        const blob = blobResponse.data;

        const arrayBuffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        setFileBuffer(uint8);

        const doc = await PDFDocument.load(uint8);
        setPdfDoc(doc);
        setNumPages(doc.getPageCount());
      } catch (error) {
        console.error('Failed to load PDF:', error);
        Swal.fire('Error', 'Gagal memuat dokumen', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploaded(true);

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      setFileBuffer(new Uint8Array(arrayBuffer));
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleSubmit = async (param: 'draft' | 'send' | 'sign') => {
    if (!fileBuffer && param !== 'send') {
      Swal.fire('Error', 'Mohon unggah dokumen PDF terlebih dahulu.', 'error');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text:
        param === 'draft'
          ? 'Anda akan menyimpan dokumen ini sebagai draft.'
          : param === 'sign'
          ? 'Anda akan menandatangani dokumen ini.'
          : 'Anda akan mengirim dokumen ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Ya, ${param}!`,
    });

    if (!confirm.isConfirmed) return;
    setIsLoading(true);

    try {
      if (param === 'sign' && !reason) {
        Swal.fire(
          'Validasi Gagal',
          'Alasan tanda tangan harus diisi.',
          'error'
        );
        return;
      }

      if (param === 'send' && !recipient) {
        Swal.fire('Validasi Gagal', 'Penerima wajib dipilih.', 'error');
        return;
      }

      const formData = new FormData();
      if (docId) formData.append('IdDoc', docId);
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

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/sign`,
        formData
      );

      Swal.fire(
        'Sukses',
        response?.data?.message || 'Operasi berhasil.',
        'success'
      ).then(() => {
        router.push('/documents');
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Terjadi kesalahan. Silakan coba lagi.', 'error');
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
                    <option key={i} value={i + 1}>
                      Halaman {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative border" style={{ width: 'fit-content' }}>
                <PDFRenderer
                  fileBuffer={{ data: fileBuffer }}
                  currentPage={currentPage}
                  onLoad={setNumPages}
                  onPageSize={() => {}}
                  signatureURL=""
                  position={{ x: signatureX, y: signatureY }}
                  sigSize={{ w: signatureWidth, h: signatureHeight }}
                  onRenderScaleChange={() => {}}
                />

                {showSignatureBox && (
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
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <h4 className="text-center">Dokumen akan ditampilkan di sini</h4>
            </div>
          )}
        </div>

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
              <>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="show-signature-box"
                    checked={showSignatureBox}
                    onCheckedChange={(checked) =>
                      setShowSignatureBox(!!checked)
                    }
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="show-signature-box" className="font-medium">
                      Tanda Tangan Digital
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Tampilkan kotak tanda tangan di atas dokumen.
                    </p>
                  </div>
                </div>

                {!showSignatureBox && (
                  <div className="grid gap-2 mt-3">
                    <Label htmlFor="recipient">Pilih Pegawai Penerima</Label>
                    <InputDropdown<Pegawai>
                      data={pegawai}
                      labelKey="nama"
                      valueKey="npp"
                      filterKey="nama"
                      filterExclude="ADMINISTRATOR"
                      placeholder="Pilih Pegawai"
                      onChange={(val) => setRecipient(val)}
                    />
                  </div>
                )}

                <div className="grid gap-2 mt-3">
                  <Label htmlFor="signature-desc">Alasan Tanda Tangan</Label>
                  <Input
                    id="signature-desc"
                    type="text"
                    placeholder="Masukkan alasan/signing reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button variant="default" onClick={() => handleSubmit('sign')}>
              {isLoading ? 'Memproses...' : 'Tandatangani Dokumen'}
            </Button>
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
