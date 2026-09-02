import { useRef, useEffect } from "react";

export function ForkliftScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
    };

    const draw = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) { raf = requestAnimationFrame(draw); return; }

      const w = cw / 2;
      const h = ch / 2;
      const cycle = (frame * 0.008) % 1; // 0..1 full cycle

      ctx.save();
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "#17181c";
      ctx.fillRect(0, 0, w, h);

      // Floor
      const floorY = h * 0.78;
      ctx.fillStyle = "#1d1f24";
      ctx.fillRect(0, floorY, w, h - floorY);
      ctx.strokeStyle = "#2a2d34";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();

      // Shelves
      const shelfX = w * 0.6;
      const shelfW = w * 0.35;
      const shelfH = h * 0.55;
      const shelfY = floorY - shelfH;
      const colors = ["#c1121c", "#2271b3", "#57a639", "#f7c500", "#ff6a2b"];

      for (let col = 0; col < 3; col++) {
        const sx = shelfX + col * shelfW / 3;
        const sw = shelfW / 3 - 4;
        ctx.fillStyle = "#22242a";
        ctx.fillRect(sx, shelfY, sw, shelfH);
        ctx.strokeStyle = "#2f3238";
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, shelfY, sw, shelfH);

        for (let row = 0; row < 4; row++) {
          const ry = shelfY + row * shelfH / 4;
          ctx.fillStyle = "#2f3238";
          ctx.fillRect(sx, ry + shelfH / 4 - 2, sw, 2);
          ctx.fillStyle = colors[(col + row) % colors.length];
          ctx.globalAlpha = 0.5;
          ctx.fillRect(sx + 3, ry + 4, sw - 6, shelfH / 4 - 8);
          ctx.globalAlpha = 1;
        }
      }

      // Animation phases
      // 0.0-0.3: drive to shelves
      // 0.3-0.4: lower forks
      // 0.4-0.6: load bags
      // 0.6-0.7: lift forks
      // 0.7-1.0: drive back

      const scale = w / 500;
      const fw = 70 * scale;
      const fh = 45 * scale;

      // Forklift X position
      const startX = w * 0.12;
      const endX = w * 0.48;
      let fx: number;
      if (cycle < 0.3) {
        // Drive to shelves
        const t = cycle / 0.3;
        fx = startX + (endX - startX) * easeInOut(t);
      } else if (cycle < 0.7) {
        // At shelves (loading)
        fx = endX;
      } else {
        // Drive back
        const t = (cycle - 0.7) / 0.3;
        fx = endX - (endX - startX) * easeInOut(t);
      }

      const fy = floorY - fh - 8 * scale;

      // Fork Y offset (lowering to pick up bags)
      let forkOffset = 0;
      if (cycle > 0.3 && cycle < 0.4) {
        forkOffset = fh * 0.25 * easeInOut((cycle - 0.3) / 0.1);
      } else if (cycle >= 0.4 && cycle < 0.6) {
        forkOffset = fh * 0.25;
      } else if (cycle >= 0.6 && cycle < 0.7) {
        forkOffset = fh * 0.25 * (1 - easeInOut((cycle - 0.6) / 0.1));
      }

      // Bags visibility
      const showBags = cycle >= 0.45;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(fx + fw * 0.15, floorY + 1, fw * 0.45, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // === DRAW ORDER: forks → body → bags ===

      // 1. FORKS
      ctx.fillStyle = "#555a64";
      ctx.fillRect(fx - fw * 0.12, fy - fh * 0.08, fw * 0.05, fh * 1.12);
      ctx.fillRect(fx - fw * 0.14, fy + fh * 0.2, fw * 0.1, fh * 0.04);
      ctx.fillStyle = "#6b707a";
      ctx.fillRect(fx - fw * 0.55, fy + fh * 0.55 + forkOffset, fw * 0.42, fh * 0.05);
      ctx.fillRect(fx - fw * 0.55, fy + fh * 0.78 + forkOffset, fw * 0.42, fh * 0.05);
      ctx.fillStyle = "#8a8f99";
      ctx.fillRect(fx - fw * 0.58, fy + fh * 0.53 + forkOffset, fw * 0.05, fh * 0.09);
      ctx.fillRect(fx - fw * 0.58, fy + fh * 0.76 + forkOffset, fw * 0.05, fh * 0.09);

      // 2. BODY
      const bodyGrad = ctx.createLinearGradient(fx - fw * 0.1, fy, fx + fw * 0.5, fy + fh);
      bodyGrad.addColorStop(0, "#ff7a3d");
      bodyGrad.addColorStop(0.5, "#ff6a2b");
      bodyGrad.addColorStop(1, "#e55a1b");
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(fx - fw * 0.1, fy, fw * 0.6, fh);
      ctx.fillStyle = "#ff8c5a";
      ctx.fillRect(fx - fw * 0.08, fy, fw * 0.56, fh * 0.04);
      ctx.fillStyle = "#0a0b0e";
      ctx.fillRect(fx + fw * 0.08, fy + fh * 0.1, fw * 0.28, fh * 0.35);
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(fx + fw * 0.08, fy + fh * 0.1, fw * 0.12, fh * 0.35);
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(fx - fw * 0.1, fy, fw * 0.6, fh);
      ctx.fillStyle = "#3a3d46";
      ctx.fillRect(fx + fw * 0.45, fy + fh * 0.25, fw * 0.14, fh * 0.75);

      // Wheels
      ctx.fillStyle = "#1a1b1f";
      ctx.beginPath();
      ctx.arc(fx - fw * 0.15, floorY - 5 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a3d46";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#555a64";
      ctx.beginPath();
      ctx.arc(fx - fw * 0.15, floorY - 5 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1a1b1f";
      ctx.beginPath();
      ctx.arc(fx + fw * 0.38, floorY - 5 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a3d46";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#555a64";
      ctx.beginPath();
      ctx.arc(fx + fw * 0.38, floorY - 5 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 3. BAGS on forks
      if (showBags) {
        const bagColors = ["#c1121c", "#2271b3", "#57a639"];
        const bagAlpha = Math.min(1, (cycle - 0.45) / 0.1);
        for (let i = 0; i < 3; i++) {
          const bx = fx - fw * 0.5 + i * fw * 0.14;
          const by = fy + fh * 0.12 + forkOffset - i * fh * 0.05;
          const bw = fw * 0.12;
          const bh = fh * 0.4;
          ctx.globalAlpha = bagAlpha;
          ctx.fillStyle = bagColors[i];
          ctx.fillRect(bx, by, bw, bh);
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(bx, by, bw, bh * 0.1);
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.fillRect(bx + bw * 0.7, by, bw * 0.3, bh);
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();
      frame++;
      raf = requestAnimationFrame(draw);
    };

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    resize();
    draw();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement || canvas);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
