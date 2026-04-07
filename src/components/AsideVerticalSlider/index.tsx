// src/components/AsideVerticalSlider/index.tsx
import React from "react";
import { useAutoSlide } from "../../hooks/useAutoSlide";

type Props = { images: string[]; delay?: number; height?: string };

export default function AsideVerticalSlider({ images, delay = 5000 }: Props) {
  const { index, pause, resume, goTo } = useAutoSlide(images.length, delay, false);

  return (
    <div className={`relative "h-40" w-full`} onMouseEnter={pause} onMouseLeave={resume}>
      {images.map((src, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100 relative' : 'opacity-0 absolute pointer-events-none'}`}>
          <img src={src} alt={`Banner ${i+1}`} className="w-full h-full object-contain mx-auto" loading="lazy" />
        </div>
      ))}

      <div className="flex justify-center gap-2 py-3 bg-white">
        {images.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`w-2 h-2 rounded-full ${index === i ? 'bg-gray-800' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
  );
}
