"use client";

import { useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
  code?: string;
  onRefresh: () => void;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function Captcha({
  code,
  onRefresh,
  value,
  onChange,
  error,
}: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptchaImage = (captchaCode: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = 160);
    const height = (canvas.height = 50);

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 噪点 - 随机小点
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 0 : 100}, ${Math.random() > 0.5 ? 0 : 100}, ${Math.random() > 0.5 ? 0 : 100}, ${Math.random() * 0.3})`;
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // 干扰线 - 多条随机曲线
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const hue = Math.random() * 360;
      ctx.strokeStyle = `hsla(${hue}, 60%, 40%, ${Math.random() * 0.4 + 0.1})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
      );
      ctx.stroke();
    }

    // 字符设置
    const chars = captchaCode.split("");
    const fonts = ["monospace", "serif", "sans-serif"];
    const fontSizes = [22, 24, 26, 28];

    chars.forEach((char, i) => {
      ctx.save();
      const x = 20 + i * 22;
      const y = 32 + (Math.random() - 0.5) * 16;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.5);
      ctx.font = `${fontSizes[Math.floor(Math.random() * fontSizes.length)]}px ${fonts[Math.floor(Math.random() * fonts.length)]}`;
      ctx.fillStyle = `rgb(${Math.random() * 50 + 30}, ${Math.random() * 50 + 30}, ${Math.random() * 50 + 30})`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // 额外的干扰点 - 大小不一
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      const hue = Math.random() * 360;
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${Math.random() * 0.5 + 0.2})`;
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  };

  useEffect(() => {
    if (code) {
      generateCaptchaImage(code);
    }
  }, [code]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="验证码"
          className={`w-32 px-3 py-2 border rounded-lg bg-background ${
            error ? "border-red-500" : "border-border"
          }`}
          maxLength={6}
          autoComplete="off"
        />
        <canvas
          ref={canvasRef}
          className="border border-border rounded bg-muted cursor-pointer"
          onClick={onRefresh}
          title="点击刷新验证码"
        />
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-md hover:bg-accent transition"
          title="刷新验证码"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
