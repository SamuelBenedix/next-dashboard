// /Users/samuelbenedict/Documents/GitHub/next-dashboard/src/app/api/sign/route.ts

import { PDFDocument } from 'pdf-lib';
import { NextResponse } from 'next/server'; // Important for App Router responses

// You can still keep this config if you need it, though bodyParser is handled differently in App Router's Request object
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '10mb', // This will be handled by the default Request object's body parsing
//     },
//   },
// };

export async function POST(req: Request) { // App Router API routes use standard Request objects
 try {
  // req.json() is used to parse the request body in App Router
  const { pdfBase64, sigDataUrl, x, y, w, h, pageIndex } = await req.json();

  if (!pdfBase64 || !sigDataUrl || typeof x === 'undefined' || typeof y === 'undefined' || !w || !h) {
   // Use NextResponse.json() for structured JSON responses
   return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
  }

  // Decode PDF base64 using Buffer.from
  const pdfBytes = Buffer.from(pdfBase64, 'base64');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  if (pageIndex === undefined || pageIndex < 0 || pageIndex >= pages.length) {
   return NextResponse.json({ error: 'Invalid page index.' }, { status: 400 });
  }
  const page = pages[pageIndex];

  // Extract base64 from data:image/png;base64,...
  const base64Image = sigDataUrl.split(',')[1];
  if (!base64Image) {
   return NextResponse.json({ error: 'Invalid signature data URL.' }, { status: 400 });
  }
  const imageBytes = Buffer.from(base64Image, 'base64'); // Decode image using Buffer.from
  const pngImage = await pdfDoc.embedPng(imageBytes);

  page.drawImage(pngImage, {
   x,
   y,
   width: w,
   height: h,
  });

  const signedPdfBytes = await pdfDoc.save();

  // To send a PDF file directly, create a new Response with the bytes and headers
  return new Response(signedPdfBytes, {
   headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="signed.pdf"',
   },
  });

 } catch (err: any) {
  console.error('SIGN ERROR:', err.message || err);
  return NextResponse.json(
   { error: `Failed to sign PDF: ${err.message || 'Unknown error'}` },
   { status: 500 }
  );
 }
}