// src/components/HeroSlider/index.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAutoSlide } from "../..//hooks/useAutoSlide";
import type { HeroSlide } from "../../types";

type Props = {
  slides: HeroSlide[];
  delay?: number;
  heightClass?: string;
};

const HeroSlider: React.FC<Props> = ({ slides, delay = 5000, heightClass = "h-[70vh]" }) => {
  const { index, next, prev, goTo, pause, resume } = useAutoSlide(slides.length, delay, false);
  const current = index;

  return (
    <section
      className={`relative overflow-hidden ${heightClass}`}
      aria-roledescription="carousel"
      aria-label="Hero slider"
    >
      <div
        className="relative h-full"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") prev();
          if (e.key === "ArrowRight") next();
        }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${slides.length}: ${s.title}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* imagem de fundo */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${s.image})` }}
              aria-hidden
            >
              {/* Overlay em gradiente para melhorar legibilidade sem esconder o fundo */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            </div>

            {/* conteúdo */}
            <div className="relative z-10 flex items-center h-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-0 rounded-xl p-4 md:p-0">
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-4 text-white">
                    {s.title}
                  </h1>
                  {s.subtitle && (
                    <h2 className="hidden md:block text-base md:text-xl lg:text-2xl font-medium mb-3 md:mb-4 text-white/90">
                      {s.subtitle}
                    </h2>
                  )}
                  <p className="text-sm md:text-lg lg:text-xl text-gray-200 mb-6 md:mb-8 leading-relaxed md:leading-loose">
                    {s.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {s.buttons.map((b, idx) => (
                      <Link
                        key={idx}
                        to={b.link}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 md:py-3 rounded-lg font-medium transition transform hover:scale-[1.03] md:hover:scale-105 ${
                          b.variant === "primary"
                            ? "bg-blue-900 text-white"
                            : "bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900"
                        }`}
                      >
                        {b.text}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* navegação */}
      {/* Áreas de clique invisíveis no mobile; botões visíveis acima de sm */}
      <button
        aria-label="Anterior"
        onClick={prev}
        className="sm:hidden absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer bg-transparent"
      />
      <button
        aria-label="Próximo"
        onClick={next}
        className="sm:hidden absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer bg-transparent"
      />

      <button
        aria-label="Anterior"
        onClick={prev}
        className="hidden sm:flex items-center justify-center absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 rounded-full bg-white/30 hover:bg-white/40 text-white transition"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <button
        aria-label="Próximo"
        onClick={next}
        className="hidden sm:flex items-center justify-center absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 rounded-full bg-white/30 hover:bg-white/40 text-white transition"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* indicadores */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para slide ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
              i === current ? "bg-blue-600 scale-110 md:scale-125" : "bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default React.memo(HeroSlider);
