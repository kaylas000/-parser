import { useState, useEffect } from "react";

const SLIDES = [
  { src: "https://kolormarket.ru/wp-content/uploads/GREEN-5605-500x500.jpg", label: "Пигменты Tongchem", sub: "Китай" },
  { src: "https://kolormarket.ru/wp-content/uploads/Titanium-dioxide-Precheza-FS-500x500.jpg", label: "Диоксид титана Pretiox", sub: "Чехия" },
  { src: "https://kolormarket.ru/wp-content/uploads/B-15-1--500x500.jpg", label: "VIPUL ORGANICS", sub: "Индия" },
  { src: "https://kolormarket.ru/wp-content/uploads/PLASTIFIKATOR-S-3-500x500.jpg", label: "Пластификаторы", sub: "Россия" },
  { src: "https://kolormarket.ru/wp-content/uploads/Jakor-500x500.jpg", label: "Пигменты Precheza", sub: "Чехия" },
  { src: "https://kolormarket.ru/wp-content/uploads/698-1-1-500x500.jpg", label: "Lomon Billions BLR-698", sub: "Китай" },
  { src: "https://kolormarket.ru/wp-content/uploads/R-254-500x500.jpg", label: "VIPUL Red 254", sub: "Индия" },
  { src: "https://kolormarket.ru/wp-content/uploads/Uskorin-500x500.jpg", label: "ФОРТ УСКОРИН", sub: "Россия" },
];

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-coal-2">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide.src}
            alt={slide.label}
            className="max-h-[85%] max-w-[85%] object-contain"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      {/* Label */}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-concrete sm:text-base">
            {SLIDES[current].label}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-fog-2">
            {SLIDES[current].sub}
          </p>
        </div>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 w-4 transition-colors duration-300 ${
                i === current ? "bg-heat" : "bg-steel-2"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
