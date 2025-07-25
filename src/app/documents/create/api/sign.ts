/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument } from 'pdf-lib';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // agar cukup untuk base64 PDF + image
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Use req.body directly as it's already parsed by Next.js if `bodyParser` is enabled
    // and content-type is application/json
    const { pdfBase64, sigDataUrl, x, y, w, h, pageIndex } = req.body;

    if (!pdfBase64 || !sigDataUrl || typeof x === 'undefined' || typeof y === 'undefined' || !w || !h) {
      return res.status(400).send('Missing required parameters.');
    }

    // Decode PDF base64 using Buffer.from
    const pdfBytes = Buffer.from(pdfBase64, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    if (pageIndex === undefined || pageIndex < 0 || pageIndex >= pages.length) {
      return res.status(400).send('Invalid page index.');
    }
    const page = pages[pageIndex];

    // Extract base64 from data:image/png;base64,...
    const base64Image = sigDataUrl.split(',')[1];
    if (!base64Image) {
      return res.status(400).send('Invalid signature data URL.');
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="signed.pdf"');
    // Send the Buffer directly
    res.send(Buffer.from(signedPdfBytes));
  } catch (err: any) { // Use 'any' for now to easily log error properties
    console.error('SIGN ERROR:', err.message || err);
    res.status(500).send(`Failed to sign PDF: ${err.message || 'Unknown error'}`);
  }
}