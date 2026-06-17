import React from "react";
import { Point } from "./StickFigure";

// ---------------------------------------------------------------------------
// STAIRCASE OF WINS - every small action-dot from earlier in the video
// flies in from a scattered position and snaps into place as one step of a
// rising staircase, then morphs from a soft dot into a solid glowing step.
// ---------------------------------------------------------------------------
// `progress` (0-1) drives the WHOLE assembly. Each dot/step is staggered
// automatically based on its index, so the calling scene only has to
// animate a single number across the scene's duration.
// ---------------------------------------------------------------------------

export interface WinDot {
  /** Scattered starting position the dot flies in from. */
  from: Point;
  /** Optional label for code readability only (e.g. "pushups", "patched
   * bucket") - never rendered on screen. */
  label?: string;
}

export interface StaircaseOfWinsProps {
  /** Floor anchor of the staircase - bottom-left corner of step 0. */
  baseAnchor: Point;
  stepWidth: number;
  stepHeight: number;
  /** Horizontal run of each step (how far right + up the next step goes). */
  stepRun: number;
  dots: WinDot[];
  /** 0-1 master progress: dots arrive and assemble left-to-right/bottom-to-top. */
  progress: number;
  accentColor: string;
  dotColor?: string;
}

/** Simple ease so the staggered arrivals don't feel mechanical. */
function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

export const StaircaseOfWins: React.FC<StaircaseOfWinsProps> = ({
  baseAnchor,
  stepWidth,
  stepHeight,
  stepRun,
  dots,
  progress,
  accentColor,
  dotColor = "#fff4d6",
}) => {
  const n = dots.length;

  return (
    <g>
      {dots.map((dot, i) => {
        // Stagger: dot i starts arriving once progress passes i/n, and has
        // a fixed-size window (1/n, with a little overlap) to arrive.
        const windowSize = 1.4 / n;
        const startAt = (i / n) * 0.85;
        const localT = easeOutCubic((progress - startAt) / windowSize);

        if (localT <= 0) return null; // not yet launched

        // Target step position (ascending to the right).
        const stepX = baseAnchor.x + i * stepRun;
        const stepTopY = baseAnchor.y - (i + 1) * stepHeight;
        const target: Point = {
          x: stepX + stepWidth / 2,
          y: stepTopY + stepHeight / 2,
        };

        const x = dot.from.x + (target.x - dot.from.x) * Math.min(1, localT);
        const y = dot.from.y + (target.y - dot.from.y) * Math.min(1, localT);

        // Morph from a small glowing dot into a solid step rectangle once
        // the dot has nearly arrived.
        const morphT = Math.max(0, Math.min(1, (localT - 0.7) / 0.3));

        return (
          <g key={i}>
            {/* dot, fading out as the step rectangle fades in */}
            <circle
              cx={x}
              cy={y}
              r={9}
              fill={dotColor}
              opacity={Math.min(1, localT) * (1 - morphT)}
            />
            {/* solid glowing step, fading in as the dot "lands" */}
            <rect
              x={stepX}
              y={stepTopY}
              width={stepWidth}
              height={stepHeight}
              rx={4}
              fill={accentColor}
              opacity={morphT * 0.9}
            />
          </g>
        );
      })}

      {/* a faint baseline so the staircase reads as grounded even before
          any steps have solidified */}
      <line
        x1={baseAnchor.x - 20}
        y1={baseAnchor.y}
        x2={baseAnchor.x + n * stepRun + 20}
        y2={baseAnchor.y}
        stroke={accentColor}
        strokeWidth={2}
        opacity={0.25}
      />
    </g>
  );
};

export default StaircaseOfWins;
