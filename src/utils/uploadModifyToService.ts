import { PDFDocument } from 'pdf-lib';
import { Services } from '@/services/serviceapi';
import { addImageToPDF } from './addImageToPDF';

const apiService = new Services();

type Orientation = 'Potrait' | 'Landscape';

type AddSignatureToPDFParams = {
 signatureDataURL: string;
 x: number;
 y: number;
 pdfBytes: ArrayBuffer | Uint8Array;
 selectedPage: number;
 width?: number;
 height?: number;
};

export async function addSignatureToPDF({
 signatureDataURL,
 x,
 y,
 pdfBytes,
 selectedPage,
 width = 100,
 height = 50,
}: AddSignatureToPDFParams): Promise<Uint8Array> {
 try {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const targetPage = pdfDoc.getPages()[selectedPage - 1];

  const image = await pdfDoc.embedPng(signatureDataURL);
  const originalOrientation = await checkOrientation(
   pdfBytes instanceof ArrayBuffer
    ? pdfBytes
    : (pdfBytes as Uint8Array).buffer.slice((pdfBytes as Uint8Array).byteOffset, (pdfBytes as Uint8Array).byteOffset + (pdfBytes as Uint8Array).byteLength)
  );

  console.log('Signature:', signatureDataURL);
  console.log('x:', x, 'y:', y, 'width:', width, 'height:', height);
  console.log('Original orientation:', originalOrientation);

  targetPage.drawImage(image, { x, y, width, height });

  const modifiedPdfBytes = await pdfDoc.save();
  return modifiedPdfBytes;
 } catch (error) {
  console.error('Error adding signature to PDF:', error);
  throw error;
 }
}

export async function checkOrientation(arrayBuffer: ArrayBuffer | SharedArrayBuffer): Promise<Orientation> {
 const orientationByte = new Uint8Array(arrayBuffer.slice(17, 18))[0];
 return (orientationByte & 0x01) === 0 ? 'Potrait' : 'Landscape';
}

export async function uploadModifiedPdf(modifiedPdfBytes: Uint8Array | ArrayBuffer): Promise<unknown> {
 const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
 const formData = new FormData();
 formData.append('file', blob, 'pdf-with-signature.pdf');

 try {
  const res = await apiService.uploadFile(formData);
  return res;
 } catch (error) {
  console.error('Upload error:', error);
  throw error;
 }
}

type UploadParams = {
 documentURL: string | null;
 capturedSignature?: string; // base64 string
 selectedImageUrl?: string;  // URL or base64
 currentPage: number;
 xCoordinate: number;
 yCoordinate: number;
 pdfPaperWidth: number;
 pdfPaperHeight: number;
 scale: number;
 fileBytesOverride?: Uint8Array;
 width?: number;
 height?: number;
};

export const uploadModifyToService = async ({
 documentURL,
 capturedSignature,
 selectedImageUrl,
 currentPage,
 xCoordinate,
 yCoordinate,
 pdfPaperWidth,
 pdfPaperHeight,
 scale,
 fileBytesOverride,
}: UploadParams): Promise<void> => {
 if (!documentURL) {
  console.error('documentURL is empty');
  return;
 }

 const existingPdfBytes =
  fileBytesOverride ?? (await fetch(documentURL).then(res => res.arrayBuffer()));

 const selectedPage = currentPage;
 let x = yCoordinate;
 let y = xCoordinate;

 if (capturedSignature) {
  try {
   const modifiedPdfBytes = await addSignatureToPDF({
    signatureDataURL: capturedSignature,
    x: y,
    y: x,
    pdfBytes: existingPdfBytes as ArrayBuffer | Uint8Array,
    selectedPage,
   });

   const response = await uploadModifiedPdf(modifiedPdfBytes);
   if (response && typeof response === 'object' && 'object' in response && response.object && typeof response.object === 'object' && 'id' in response.object) {
    // @ts-expect-error: TypeScript cannot infer the type of response.object.id
    localStorage.setItem('IdUpload', response.object.id);
   }
  } catch (error) {
   console.error('Error uploading signature file:', error);
  }

  return;
 }

 if (selectedImageUrl) {
  const sectionHeight = pdfPaperHeight / 3;
  const sectionWidth = pdfPaperWidth / 3;

  if (scale > 1) {
   // Penyesuaian posisi berdasarkan koordinat (scaling logic)
   if (yCoordinate <= sectionHeight) {
    x -= 15;
    y += xCoordinate <= sectionWidth ? 3 : xCoordinate <= sectionWidth * 2 ? 10 : 15;
   } else if (yCoordinate <= sectionHeight * 2) {
    x -= 10;
    y += xCoordinate <= sectionWidth ? 3 : xCoordinate <= sectionWidth * 2 ? 10 : 15;
   } else {
    x -= 3;
    y += xCoordinate <= sectionWidth ? 3 : xCoordinate <= sectionWidth * 2 ? 10 : 15;
   }
  }

  try {
   const modifiedPdfBytes = await addImageToPDF({
    imageUrl: selectedImageUrl,
    x: y,
    y: x,
    pdfBytes: existingPdfBytes as ArrayBuffer | Uint8Array,
    selectedPage: selectedPage,
   });

   const response = await uploadModifiedPdf(modifiedPdfBytes);
   if (
    response &&
    typeof response === 'object' &&
    'object' in response &&
    response.object &&
    typeof response.object === 'object' &&
    'id' in response.object
   ) {
    // @ts-expect-error: TypeScript cannot infer the type of response.object.id
    localStorage.setItem('IdUpload', response.object.id);
   }
  } catch (error) {
   console.error('Error uploading image file:', error);
  }

  return;
 }

 alert('Please capture a signature or select an image preview first.');
};
