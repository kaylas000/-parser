import { useRef, useEffect, useState } from "react";

export function KolormarketIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let frame = 0;
    const totalFrames = 180;

    const resize = () => {
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const p = Math.min(1, frame / totalFrames);
      setProgress(p);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#17181c";
      ctx.fillRect(0, 0, w, h);

      // Draw text
      const fontSize = Math.min(w * 0.08, 72);
      ctx.font = `900 ${fontSize}px Tektur, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const text = "КОЛОР МАРКЕТ";
      const textX = w / 2;
      const textY = h / 2;

      // Particles assembling into text
      ctx.fillStyle = "#ff6a2b";
      const letters = text.split("");
      let offsetX = textX - ctx.measureText(text).width / 2;

      for (let i = 0; i < letters.length; i++) {
        const letterP = Math.max(0, Math.min(1, (p * letters.length - i) * 2));
        const letter = letters[i];
        const lw = ctx.measureText(letter).width;

        if (letterP > 0) {
          ctx.globalAlpha = letterP;
          ctx.fillText(letter, offsetX + lw / 2, textY);
          ctx.globalAlpha = 1;
        }

        // Particles
        if (letterP < 1 && letterP > 0) {
          const particleCount = 8;
          for (let j = 0; j < particleCount; j++) {
            const angle = (j / particleCount) * Math.PI * 2 + frame * 0.05;
            const radius = (1 - letterP) * 50;
            const px = offsetX + lw / 2 + Math.cos(angle) * radius;
            const py = textY + Math.sin(angle) * radius;
            ctx.fillStyle = `hsl(${(i * 30 + j * 20) % 360}, 80%, 60%)`;
            ctx.globalAlpha = letterP;
            ctx.beginPath();
            ctx.arc(px, py, 3 * letterP, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }

        offsetX += lw;
      }

      // Subtitle
      if (p > 0.7) {
        const subP = (p - 0.7) / 0.3;
        ctx.globalAlpha = subP;
        ctx.fillStyle = "#9d9f9a";
        ctx.font = `500 ${fontSize * 0.18}px 'Golos Text', sans-serif`;
        ctx.fillText("поставщик химического сырья с 1995 года", textX, textY + fontSize * 0.7);
        ctx.globalAlpha = 1;
      }

      if (p >= 1 && !doneRef.current) {
        doneRef.current = true;
        setTimeout(onDone, 500);
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] bg-coal">
      <canvas ref={canvasRef} className="h-full w-full" />
      <button
        onClick={onDone}
        className="absolute bottom-8 right-8 border border-steel-2 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-fog hover:border-heat hover:text-heat"
      >
        Пропустить
      </button>
      <div className="absolute bottom-8 left-8 h-0.5 w-32 bg-steel">
        <div className="h-full bg-heat" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
