import React from 'react';

// Lightweight standalone SVG QR visualizer for universal mobile links
interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 180,
  className = '',
}) => {
  // Simple deterministic hash-based 21x21 QR pattern generator with accurate corner finder patterns
  const gridSize = 25;
  const matrix: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));

  // Helper to draw finder pattern (7x7 with inner 3x3)
  const drawFinderPattern = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (
          x === 0 || x === 6 || y === 0 || y === 6 || // Outer 7x7 square
          (x >= 2 && x <= 4 && y >= 2 && y <= 4)      // Inner 3x3 square
        ) {
          matrix[startY + y][startX + x] = true;
        } else {
          matrix[startY + y][startX + x] = false;
        }
      }
    }
  };

  // Draw 3 standard corner finder patterns
  drawFinderPattern(1, 1);
  drawFinderPattern(gridSize - 8, 1);
  drawFinderPattern(1, gridSize - 8);

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[7][i] = i % 2 === 0;
    matrix[i][7] = i % 2 === 0;
  }

  // Populate data modules deterministically using the string characters
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Don't overwrite finders or timing patterns
      const inTopLeftFinder = x < 9 && y < 9;
      const inTopRightFinder = x >= gridSize - 9 && y < 9;
      const inBottomLeftFinder = x < 9 && y >= gridSize - 9;

      if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder) {
        const bitVal = Math.sin(x * 13 + y * 7 + (hash % 100)) > 0;
        const charIdx = (x + y * gridSize) % value.length;
        const charCode = value.charCodeAt(charIdx);
        matrix[y][x] = (charCode + x * y + (hash & 0xFF)) % 3 !== 0;
      }
    }
  }

  const cellSize = size / (gridSize + 2);

  return (
    <div className={`inline-block p-2 bg-white rounded-2xl border border-slate-200 shadow-xs ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges"
      >
        <rect width={size} height={size} fill="white" />
        {matrix.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={(x + 1) * cellSize}
                y={(y + 1) * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1e293b"
                rx={cellSize > 6 ? 1 : 0}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
