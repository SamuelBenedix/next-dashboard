import { PDFDocument } from 'pdf-lib';

/**
 * Tambahkan image ke halaman tertentu dalam PDF.
 * @param imageUrl - URL atau base64 dari gambar PNG.
 * @param x - Posisi X.
 * @param y - Posisi Y.
 * @param pdfBytes - Uint8Array dari file PDF.
 * @param selectedPage - Nomor halaman (1-based).
 * @param width - Lebar gambar yang diinginkan.
 * @param height - Tinggi gambar yang diinginkan.
 * @returns Uint8Array dari PDF yang dimodifikasi.
 */

type AddImageToPDFParams = {
 imageUrl: string;
 x: number;
 y: number;
 pdfBytes: ArrayBuffer | Uint8Array;
 selectedPage: number;
 width?: number;
 height?: number;
};

export async function convertToPNG(imageUrl: string): Promise<string> {
 return new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.crossOrigin = 'Anonymous'; // Untuk menghindari masalah CORS
  img.src = imageUrl;

  img.onload = () => {
   canvas.width = img.width;
   canvas.height = img.height;
   ctx?.drawImage(img, 0, 0);
   const pngUrl = canvas.toDataURL('image/png');
   resolve(pngUrl);
  };

  img.onerror = () => {
   reject(new Error('Gagal memuat gambar'));
  };
 });
}


export async function addImageToPDF({
 imageUrl,
 x,
 y,
 pdfBytes,
 selectedPage,
 width = 100,
 height = 50,
}: AddImageToPDFParams): Promise<Uint8Array> {
 const pdfDoc = await PDFDocument.load(pdfBytes);
 const targetPage = pdfDoc.getPages()[selectedPage - 1];

 if (!targetPage) throw new Error(`Page ${selectedPage} not found in PDF`);

 // Konversi ke PNG jika perlu (kamu harus punya convertToPNG function)
 if (!imageUrl.endsWith('.png')) {
  imageUrl = await convertToPNG(imageUrl);
 }

 const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
 const embeddedImage = await pdfDoc.embedPng(imageBytes);

 // Penyesuaian posisi berdasarkan ukuran gambar
 let adjustedX = x;
 let adjustedY = y;

 if (width > 60 || height > 60) {
  adjustedY = y - height + 47;
 } else if (width < 60 || height < 60) {
  adjustedY = y - (height - 45);
 } else {
  adjustedY = y - 18;
  adjustedX = x + 3;
 }

 targetPage.drawImage(embeddedImage, {
  x: adjustedX,
  y: adjustedY,
  width,
  height,
 });

 const modifiedPdfBytes = await pdfDoc.save();
 return modifiedPdfBytes;
}
