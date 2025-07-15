// components/SignaturePad.tsx
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';

export default function SignaturePad({
  onSave,
}: {
  onSave: (dataUrl: string) => void;
}) {
  const sigRef = useRef<SignatureCanvas>(null);

  return (
    <div>
      <SignatureCanvas
        penColor="black"
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
        ref={sigRef}
      />
      <button onClick={() => sigRef.current?.clear()}>Clear</button>
      <button
        onClick={() => {
          const data = sigRef.current?.toDataURL();
          if (data) onSave(data);
        }}
      >
        Save
      </button>
    </div>
  );
}
