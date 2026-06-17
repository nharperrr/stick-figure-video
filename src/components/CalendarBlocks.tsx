import React from "react";
import { Point } from "./StickFigure";

// ---------------------------------------------------------------------------
// CALENDAR BLOCKS - a grid of small blocks that light up one at a time.
// Used in calendar_blocks (many blocks lighting up under the character's
// feet) and time_block_shield (a single highlighted, protected block).
// ---------------------------------------------------------------------------

export interface CalendarBlocksProps {
  position: Point; // top-left anchor of the grid
  columns: number;
  rows: number;
  blockSize: number;
  gap: number;
  litCount: number; // how many blocks (in row-major order) are lit
  highlightIndex?: number; // optional single block to pulse/glow extra
  highlightPulse?: number; // 0-1, drives the pulsing glow scale
  accentColor: string;
  dimColor: string;
}

export const CalendarBlocks: React.FC<CalendarBlocksProps> = ({
  position,
  columns,
  rows,
  blockSize,
  gap,
  litCount,
  highlightIndex,
  highlightPulse = 0,
  accentColor,
  dimColor,
}) => {
  const blocks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const index = r * columns + c;
      const isLit = index < litCount;
      const isHighlight = index === highlightIndex;
      const x = position.x + c * (blockSize + gap);
      const y = position.y + r * (blockSize + gap);
      const pulseScale = isHighlight ? 1 + Math.sin(highlightPulse) * 0.06 : 1;
      const size = blockSize * (isLit || isHighlight ? pulseScale : 1);
      const offset = (blockSize - size) / 2;
      blocks.push(
        <rect
          key={index}
          x={x + offset}
          y={y + offset}
          width={size}
          height={size}
          rx={6}
          fill={isLit || isHighlight ? accentColor : dimColor}
          opacity={isLit || isHighlight ? 0.95 : 0.35}
        />
      );
      if (isHighlight) {
        blocks.push(
          <rect
            key={`glow-${index}`}
            x={x - 8}
            y={y - 8}
            width={blockSize + 16}
            height={blockSize + 16}
            rx={10}
            fill="none"
            stroke={accentColor}
            strokeWidth={2}
            opacity={0.4 + Math.sin(highlightPulse) * 0.2}
          />
        );
      }
    }
  }
  return <g>{blocks}</g>;
};

export default CalendarBlocks;
