"use client";

import React, { useRef, useEffect, useMemo, useState, startTransition } from "react";

const ASCII_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";
const generateCode = (width, height) => {
  let text = "";
  for (let i = 0; i < width * height; i++) {
    text += ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
  }
  let out = "";
  for (let i = 0; i < height; i++) {
    out += text.substring(i * width, (i + 1) * width) + "\n";
  }
  return out;
};

export default function ScannerCardStream({ file = null, isScanning = true }) {
  const scannerCanvasRef = useRef(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const asciiCode = useMemo(() => generateCode(40, 25), []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      startTransition(() => setPreviewUrl(url));
      return () => URL.revokeObjectURL(url);
    }
    startTransition(() => setPreviewUrl(null));
  }, [file]);

  useEffect(() => {
    const scannerCanvas = scannerCanvasRef.current;
    if (!scannerCanvas) return;

    const ctx = scannerCanvas.getContext("2d");
    scannerCanvas.width = 400;
    scannerCanvas.height = 300;

    let scanY = 0;
    const particles = [];

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isScanning) {
        ctx.clearRect(0, 0, scannerCanvas.width, scannerCanvas.height);
        scanY = (scanY + 0.6) % scannerCanvas.height;
        setScanProgress(scanY / scannerCanvas.height);

        ctx.strokeStyle = "rgba(255, 85, 62, 0.9)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255, 85, 62, 0.8)";
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(scannerCanvas.width, scanY);
        ctx.stroke();

        for (let i = 0; i < 3; i++) {
          particles.push({
            x: Math.random() * scannerCanvas.width,
            y: scanY,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 1) * 1.5,
            life: 1.0,
            size: Math.random() * 2 + 0.5,
          });
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.01;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255, 85, 62, ${p.life})`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScanning]);

  return (
    <div className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-black shadow-2xl">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950">
        {/* Digital code layer */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden p-4 text-center font-mono text-[9px] leading-[1.2] break-all whitespace-pre text-white/30">
          <div className="max-w-full">{asciiCode}</div>
        </div>

        {/* PDF preview layer – revealed by scan (match v3) */}
        <div
          className="absolute inset-0 bg-white"
          style={{
            clipPath: isScanning ? `inset(${scanProgress * 100}% 0 0 0)` : "none",
          }}
        >
          {previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="pointer-events-none h-full w-full border-0"
              title="Resume Preview"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white p-8">
              <div className="w-full max-w-sm space-y-4">
                <div className="mx-auto h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-2 w-full rounded bg-slate-50" />
                <div className="h-2 w-full rounded bg-slate-50" />
                <div className="space-y-2 pt-8">
                  <div className="mx-auto h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-2 w-full rounded bg-slate-50" />
                  <div className="mx-auto h-2 w-5/6 rounded bg-slate-50" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scanner line and particles canvas */}
        <canvas
          ref={scannerCanvasRef}
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
