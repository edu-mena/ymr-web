// src/components/AsideGif/index.tsx
interface AsideGifProps {
  img: string;
  title: string;
}

export default function AsideGif({ img, title }: AsideGifProps) {
  return (
    <div className="bg-gray-700 rounded-xl shadow-xl overflow-hidden">
      <div className="relative w-full">
        <img 
          src={img} 
          alt={title} 
          loading="lazy"
          decoding="async"
          className="w-full h-auto object-contain max-h-[600px] mx-auto"
        />
      </div>
    </div>
  );
}

