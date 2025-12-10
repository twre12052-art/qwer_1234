"use client";

import { useRef, useState, useEffect } from "react";

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null) => void;
  initialSignature?: string | null;
  disabled?: boolean;
}

export function SignaturePad({ onSignatureChange, initialSignature, disabled = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

  // 초기 서명 이미지 로드
  useEffect(() => {
    if (initialSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = initialSignature;
      }
    }
  }, [initialSignature]);

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정 (고정 크기)
    canvas.width = 600;
    canvas.height = 200;
    
    // 그리기 스타일 설정
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL("image/png");
    onSignatureChange(dataURL);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`text-lg font-bold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>서명</label>
        {hasSignature && !disabled && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-base text-red-600 hover:text-red-700 font-medium"
          >
            지우기
          </button>
        )}
      </div>
      <div className={`border-2 rounded-lg bg-white overflow-hidden ${disabled ? 'border-gray-200 opacity-50' : 'border-gray-300'}`}>
        <canvas
          ref={canvasRef}
          className={`w-full h-48 touch-none block ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
          onMouseDown={disabled ? undefined : startDrawing}
          onMouseMove={disabled ? undefined : draw}
          onMouseUp={disabled ? undefined : stopDrawing}
          onMouseLeave={disabled ? undefined : stopDrawing}
          onTouchStart={disabled ? undefined : startDrawing}
          onTouchMove={disabled ? undefined : draw}
          onTouchEnd={disabled ? undefined : stopDrawing}
        />
      </div>
      <p className="text-sm text-gray-500">
        💡 마우스나 손가락으로 서명해주세요
      </p>
    </div>
  );
}

