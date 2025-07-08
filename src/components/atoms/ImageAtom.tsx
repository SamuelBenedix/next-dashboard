// components/atoms/ImageAtom.tsx
import Image from 'next/image';

type ImageAtomProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

const ImageAtom = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: ImageAtomProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
};

export default ImageAtom;
