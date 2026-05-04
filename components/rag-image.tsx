"use client"

interface RagImageProps {
  src: string
  alt: string
  className?: string
}

export function RagImage({ src, alt, className }: RagImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
    />
  )
}
