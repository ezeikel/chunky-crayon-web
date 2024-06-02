'use client';

import { useRef, useEffect, useState } from 'react';
import { ColoringImage } from '@prisma/client';
import { useColoringContext } from '@/contexts/coloring';
import cn from '@/utils/cn';

type ImageCanvasProps = {
  coloringImage: Partial<ColoringImage>;
  className?: string;
};

const ImageCanvas = ({ coloringImage, className }: ImageCanvasProps) => {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedColor } = useColoringContext();
  const [ratio, setRatio] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    const drawingCanvas = drawingCanvasRef.current;
    const imageCanvas = imageCanvasRef.current;
    const drawingCtx = drawingCanvas?.getContext('2d');
    const imageCtx = imageCanvas?.getContext('2d');
    const container = containerRef.current;

    if (drawingCanvas && imageCanvas && drawingCtx && imageCtx && container) {
      const img = new Image();

      img.src = coloringImage.url as string;
      img.onload = () => {
        const imgRatio = img.width / img.height;
        const newWidth = container.clientWidth;
        const newHeight = newWidth / imgRatio;

        setRatio(imgRatio);

        drawingCanvas.width = newWidth;
        drawingCanvas.height = newHeight;
        imageCanvas.width = newWidth;
        imageCanvas.height = newHeight;

        imageCtx.drawImage(img, 0, 0, newWidth, newHeight);
      };

      const handleResize = () => {
        const newWidth = container.clientWidth;
        const newHeight = newWidth / ratio;

        drawingCanvas.width = newWidth;
        drawingCanvas.height = newHeight;

        imageCtx.drawImage(img, 0, 0, newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    return undefined;
  }, [coloringImage.url, ratio]);

  const colorAtPosition = (clientX: number, clientY: number) => {
    const drawingCanvas = drawingCanvasRef.current;
    const drawingCtx = drawingCanvas?.getContext('2d');
    const imageCanvas = imageCanvasRef.current;
    const rect = imageCanvas?.getBoundingClientRect();

    if (drawingCanvas && drawingCtx && rect) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const radius = 5;

      drawingCtx.beginPath();
      drawingCtx.arc(x, y, radius, 0, 2 * Math.PI);
      drawingCtx.fillStyle = selectedColor;
      drawingCtx.fill();
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    colorAtPosition(event.clientX, event.clientY);
  };
  const handleMouseUp = () => setIsDrawing(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }

    colorAtPosition(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const touch = event.touches[0];
    colorAtPosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }

    const touch = event.touches[0];
    colorAtPosition(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-auto relative', {
        [className as string]: !!className,
      })}
    >
      <canvas
        className="w-full h-auto"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp} // ensure drawing stops if mouse leaves the canvas
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={drawingCanvasRef}
      />
      <canvas
        className="absolute top-0 left-0 w-full h-auto pointer-events-none mix-blend-multiply"
        ref={imageCanvasRef}
      />
    </div>
  );
};

export default ImageCanvas;
