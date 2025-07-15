// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
 const formData = await req.formData();
 const file = formData.get('file') as File;

 if (!file || !file.name.endsWith('.pdf')) {
  return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
 }

 const bytes = await file.arrayBuffer();
 const buffer = Buffer.from(bytes);

 const uploadDir = path.join(process.cwd(), 'public/uploads');
 await mkdir(uploadDir, { recursive: true });

 const filePath = path.join(uploadDir, file.name);
 await writeFile(filePath, buffer);

 return NextResponse.json({ message: 'Uploaded', fileUrl: `/uploads/${file.name}` });
}
