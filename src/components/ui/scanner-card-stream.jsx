'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';

const ASCII_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";
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
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  useEffect(() => {
    const scannerCanvas = scannerCanvasRef.current;
    if (!scannerCanvas) return;

    const ctx = scannerCanvas.getContext('2d');
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
    <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden bg-black rounded-3xl border border-white/5 shadow-2xl">
      <div className="relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center">
        {/* Digital code layer */}
        <div
          className="absolute inset-0 p-4 font-mono text-[9px] leading-[1.2] text-white/30 overflow-hidden whitespace-pre pointer-events-none flex items-center justify-center text-center break-all"
        >
          <div className="max-w-full">{asciiCode}</div>
        </div>

        {/* PDF preview layer – revealed by scan (match v3) */}
        <div
          className="absolute inset-0 bg-white"
          style={{
            clipPath: isScanning ? `inset(${scanProgress * 100}% 0 0 0)` : 'none',
          }}
        >
          {previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-0 pointer-events-none"
              title="Resume Preview"
            />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center p-8">
              <div className="space-y-4 w-full max-w-sm">
                <div className="h-4 w-2/3 bg-slate-100 rounded mx-auto" />
                <div className="h-2 w-full bg-slate-50 rounded" />
                <div className="h-2 w-full bg-slate-50 rounded" />
                <div className="pt-8 space-y-2">
                  <div className="h-3 w-1/2 bg-slate-100 rounded mx-auto" />
                  <div className="h-2 w-full bg-slate-50 rounded" />
                  <div className="h-2 w-5/6 bg-slate-50 rounded mx-auto" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scanner line and particles canvas */}
        <canvas
          ref={scannerCanvasRef}
          className="absolute inset-0 pointer-events-none z-30 w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
