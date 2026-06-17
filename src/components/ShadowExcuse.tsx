import React from "react";
import { Point } from "./StickFigure";

// ---------------------------------------------------------------------------
// SHADOW EXCUSE - tall dark silhouette representing one internal obstacle.
// `kind` picks a small icon silhouette drawn at the top of the shadow shape.
// `riseProgress` (0-1) controls how much of the shadow has risen out of the
// floor - drive this with a staggered spring per-shadow from the scene.
// ---------------------------------------------------------------------------

export type ShadowKind =
  | "money"
  | "body"
  | "heartbreak"
  | "direction"
  | "time"
  | "overwhelm";

export interface ShadowExcuseProps {
  position: Point; // floor anchor (bottom-center of the shadow)
  kind: ShadowKind;
  riseProgress: number; // 0-1
  maxHeight?: number;
  width?: number;
  fill?: string;
}

const Icon: React.FC<{ kind: ShadowKind; cx: number; cy: number; r: number }> = ({
  kind,
  cx,
  cy,
  r,
}) => {
  switch (kind) {
    case "money":
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0c0c0c" strokeWidth={3} />
          <line x1={cx - r * 0.5} y1={cy + r * 0.4} x2={cx + r * 0.5} y2={cy - r * 0.4} stroke="#0c0c0c" strokeWidth={3} />
        </g>
      );
    case "body":
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0c0c0c" strokeWidth={3} />
          <line x1={cx - r * 0.6} y1={cy - r * 0.6} x2={cx + r * 0.6} y2={cy + r * 0.6} stroke="#0c0c0c" strokeWidth={3} />
        </g>
      );
    case "heartbreak":
      return (
        <g>
          <path
            d={`M ${cx} ${cy + r * 0.6} C ${cx - r} ${cy - r * 0.4}, ${cx - r * 0.3} ${cy - r * 1.1}, ${cx} ${cy - r * 0.3} C ${cx + r * 0.3} ${cy - r * 1.1}, ${cx + r} ${cy - r * 0.4}, ${cx} ${cy + r * 0.6} Z`}
            fill="none"
            stroke="#0c0c0c"
            strokeWidth={3}
          />
          <line x1={cx - r * 0.15} y1={cy - r * 0.4} x2={cx + r * 0.15} y2={cy + r * 0.4} stroke="#0c0c0c" strokeWidth={3} />
        </g>
      );
    case "direction":
      return (
        <g>
          <line x1={cx - r} y1={cy + r * 0.3} x2={cx + r * 0.3} y2={cy - r * 0.6} stroke="#0c0c0c" strokeWidth={3} />
          <line x1={cx + r * 0.3} y1={cy + r * 0.6} x2={cx - r * 0.3} y2={cy - r * 0.6} stroke="#0c0c0c" strokeWidth={3} />
        </g>
      );
    case "time":
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0c0c0c" strokeWidth={3} />
          <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.6} stroke="#0c0c0c" strokeWidth={3} />
          <line x1={cx} y1={cy} x2={cx + r * 0.4} y2={cy} stroke="#0c0c0c" strokeWidth={3} />
        </g>
      );
    case "overwhelm":
    default:
      return (
        <g>
          <path
            d={`M ${cx - r} ${cy} a ${r * 0.5} ${r * 0.5} 0 1 1 ${r * 0.3} -${r * 0.5} a ${r * 0.6} ${r * 0.6} 0 1 1 ${r * 1.4} ${r * 0.5} Z`}
            fill="none"
            stroke="#0c0c0c"
            strokeWidth={3}
          />
        </g>
      );
  }
};

export const ShadowExcuse: React.FC<ShadowExcuseProps> = ({
  position,
  kind,
  riseProgress,
  maxHeight = 230,
  width = 60,
  fill = "#15161a",
}) => {
  const clamped = Math.max(0, Math.min(1, riseProgress));
  const h = maxHeight * clamped;
  if (h <= 1) return null;
  const topY = position.y - h;
  return (
    <g opacity={Math.min(1, clamped * 1.6)}>
      <rect
        x={position.x - width / 2}
        y={topY}
        width={width}
        height={h}
        rx={width * 0.35}
        fill={fill}
      />
      <Icon kind={kind} cx={position.x} cy={topY + width * 0.45} r={width * 0.3} />
    </g>
  );
};

export default ShadowExcuse;
