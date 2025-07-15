declare module '*.worker.js?url' {
 const src: string;
 export default src;
}

declare module '*.min.js?url' {
 const src: string;
 export default src;
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
 const workerSrc: string;
 export default workerSrc;
}
