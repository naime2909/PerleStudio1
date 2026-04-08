import React, { useMemo, useRef, useEffect } from 'react';
import type { ProjectState, BeadType } from '../types';

interface MiniGridPreviewProps {
  projectData: ProjectState;
  beadsData: BeadType[] | null;
  width?: number;
  height?: number;
  className?: string;
}

const MiniGridPreview: React.FC<MiniGridPreviewProps> = ({
  projectData,
  beadsData,
  width = 300,
  height = 160,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const beadColors = useMemo(() => {
    const map: Record<string, string> = {};
    if (beadsData) {
      beadsData.forEach((b) => {
        map[b.id] = b.hex;
      });
    }
    return map;
  }, [beadsData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { columns, rows, grid } = projectData;

    // Calculate cell size to fit the canvas
    const cellW = width / columns;
    const cellH = height / rows;
    const cellSize = Math.min(cellW, cellH);

    // Center the grid
    const gridW = columns * cellSize;
    const gridH = rows * cellSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(offsetX, offsetY, gridW, gridH);

    // Draw beads
    for (const [key, beadId] of Object.entries(grid)) {
      const color = beadColors[beadId];
      if (!color) continue;

      const parts = key.split('-');
      const r = parseInt(parts[0]);
      const c = parseInt(parts[1]);

      if (r >= 0 && r < rows && c >= 0 && c < columns) {
        ctx.fillStyle = color;
        ctx.fillRect(
          offsetX + c * cellSize,
          offsetY + r * cellSize,
          cellSize,
          cellSize
        );
      }
    }

    // Draw grid lines if cells are big enough
    if (cellSize >= 4) {
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      for (let c = 1; c < columns; c++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + c * cellSize, offsetY);
        ctx.lineTo(offsetX + c * cellSize, offsetY + gridH);
        ctx.stroke();
      }
      for (let r = 1; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + r * cellSize);
        ctx.lineTo(offsetX + gridW, offsetY + r * cellSize);
        ctx.stroke();
      }
    }

    // Draw border
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, gridW, gridH);
  }, [projectData, beadColors, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className={className}
    />
  );
};

export default MiniGridPreview;
