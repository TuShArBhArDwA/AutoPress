'use client';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SafeImage({ src, alt, className, style }: SafeImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        const parent = e.currentTarget.parentElement;
        if (parent) parent.style.display = 'none';
      }}
    />
  );
}
