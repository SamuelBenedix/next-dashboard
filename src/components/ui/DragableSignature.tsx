// components/DraggableSignature.tsx
import { Rnd } from 'react-rnd';

export default function DraggableSignature({ src }: { src: string }) {
  return (
    <Rnd
      default={{
        x: 50,
        y: 50,
        width: 150,
        height: 80,
      }}
      bounds="parent"
    >
      <img
        src={src}
        alt="signature"
        style={{ width: '100%', height: '100%' }}
      />
    </Rnd>
  );
}
