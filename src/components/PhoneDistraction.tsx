import React from "react";
import { Point } from "./StickFigure";

// ---------------------------------------------------------------------------
// PHONE DISTRACTION - a simple glowing rounded-rect phone icon.
// Reused in: intro_room (glowing on floor), freeze_scroll (held), and
// phone_shrink (oversized, towering, then shrunk into a drawer).
// `scale` is what makes it "giant" in the phone_shrink scene - drive it with
// an interpolate/spring from the calling scene.
// ---------------------------------------------------------------------------

export interface PhoneDistractionProps {
  position: Point;
  scale?: number;
  glowIntensity?: number; // 0-1
  rotation?: number; // degrees
}

export const PhoneDistraction: React.FC<PhoneDistractionProps> = ({
  position,
  scale = 1,
  glowIntensity = 0.6,
  rotation = 0,
}) => {
  const w = 30 * scale;
  const h = 56 * scale;
  return (
    <g transform={`translate(${position.x}, ${position.y}) rotate(${rotation})`}>
      {/* outer glow */}
      <rect
        x={-w / 2 - 10 * scale}
        y={-h / 2 - 10 * scale}
        width={w + 20 * scale}
        height={h + 20 * scale}
        rx={16 * scale}
        fill={`rgba(255, 233, 176, ${glowIntensity * 0.5})`}
      />
      {/* phone body */}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={6 * scale}
        fill={`rgba(255, 244, 214, ${0.5 + glowIntensity * 0.5})`}
        stroke="#1a1a1a"
        strokeWidth={3 * scale}
      />
      {/* screen line detail, no text */}
      <rect
        x={-w / 2 + 4 * scale}
        y={-h / 2 + 6 * scale}
        width={w - 8 * scale}
        height={h - 16 * scale}
        rx={3 * scale}
        fill={`rgba(255, 255, 255, ${glowIntensity * 0.6})`}
      />
    </g>
  );
};

export default PhoneDistraction;
