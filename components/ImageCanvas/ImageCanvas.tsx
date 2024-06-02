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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedColor } = useColoringContext();
  const [ratio, setRatio] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const container = containerRef.current;

    if (canvas && ctx && container) {
      const img = new Image();

      img.src = coloringImage.url as string;
      img.onload = () => {
        const imgRatio = img.width / img.height;
        setRatio(imgRatio);
        canvas.width = container.clientWidth;
        canvas.height = container.clientWidth / imgRatio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };

      const handleResize = () => {
        const newWidth = container.clientWidth;
        const newHeight = newWidth / ratio;
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    return undefined;
  }, [coloringImage.url, ratio]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      ctx.fillStyle = selectedColor;
      ctx.fillRect(x, y, 10, 10);
    }
  };

  const handleMouseDown = () => setIsDrawing(true);

  const handleMouseUp = () => setIsDrawing(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      ctx.fillStyle = selectedColor;
      ctx.fillRect(x, y, 10, 10); // fill 10x10 pixel area
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-auto', {
        [className as string]: !!className,
      })}
    >
      <canvas
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        ref={canvasRef}
      />
    </div>
  );
};

export default ImageCanvas;
