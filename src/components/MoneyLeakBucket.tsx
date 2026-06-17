import React from "react";
import { Point } from "./StickFigure";

// ---------------------------------------------------------------------------
// MONEY LEAK BUCKET - visual metaphor for "stop being blind about money".
// Coins drip from a crack until `patched` becomes true, then the drip stops.
// `dripPhase` should be a steadily increasing number (e.g. frame * 0.2) used
// to animate the falling coin particles in a loop.
// ---------------------------------------------------------------------------

export interface MoneyLeakBucketProps {
  position: Point; // top-center of the bucket
  patched: boolean;
  dripPhase: number;
  scale?: number;
}

const DRIP_COUNT = 4;

export const MoneyLeakBucket: React.FC<MoneyLeakBucketProps> = ({
  position,
  patched,
  dripPhase,
  scale = 1,
}) => {
  const bucketW = 70 * scale;
  const bucketH = 60 * scale;
  const crackY = position.y + bucketH * 0.55;
  const crackX = position.x + bucketW * 0.32;

  return (
    <g>
      {/* bucket body */}
      <path
        d={`M ${position.x - bucketW / 2} ${position.y}
            L ${position.x + bucketW / 2} ${position.y}
            L ${position.x + bucketW / 2 - 6 * scale} ${position.y + bucketH}
            L ${position.x - bucketW / 2 + 6 * scale} ${position.y + bucketH} Z`}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={5 * scale}
      />
      <ellipse
        cx={position.x}
        cy={position.y}
        rx={bucketW / 2}
        ry={8 * scale}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={4 * scale}
      />

      {/* crack, with a patch shape covering it once patched=true */}
      {!patched && (
        <line
          x1={crackX - 6 * scale}
          y1={crackY - 8 * scale}
          x2={crackX + 6 * scale}
          y2={crackY + 8 * scale}
          stroke="#1a1a1a"
          strokeWidth={3 * scale}
        />
      )}
      {patched && (
        <rect
          x={crackX - 10 * scale}
          y={crackY - 10 * scale}
          width={20 * scale}
          height={20 * scale}
          rx={4 * scale}
          fill="#d9c79a"
          stroke="#1a1a1a"
          strokeWidth={3 * scale}
        />
      )}

      {/* dripping coins, stop once patched */}
      {!patched &&
        Array.from({ length: DRIP_COUNT }).map((_, i) => {
          const t = ((dripPhase + i * 1.4) % 4) / 4; // 0-1 loop per drip
          const dropY = crackY + t * 70 * scale;
          const opacity = 1 - t;
          return (
            <circle
              key={i}
              cx={crackX}
              cy={dropY}
              r={5 * scale}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth={2.5 * scale}
              opacity={opacity}
            />
          );
        })}
    </g>
  );
};

export default MoneyLeakBucket;
