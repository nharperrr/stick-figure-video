import React from "react";
import { Point } from "./StickFigure";

// ---------------------------------------------------------------------------
// DOOR CHOICE - a row of identical, ordinary doors. One is "chosen" and
// opens, spilling light. Deliberately none of the doors look special or
// glowing ahead of time - the point of the "no direction" metaphor is that
// the character picks ANY reasonable door rather than waiting for an
// obviously-correct one to appear.
// ---------------------------------------------------------------------------

export interface DoorChoiceProps {
  /** Top-left of the first (leftmost) door. */
  position: Point;
  doorWidth: number;
  doorHeight: number;
  gap: number;
  count: number;
  chosenIndex: number;
  /** 0-1: how far the chosen door has opened / how much light spills out. */
  openProgress: number;
  doorColor?: string;
  lightColor?: string;
}

export const DoorChoice: React.FC<DoorChoiceProps> = ({
  position,
  doorWidth,
  doorHeight,
  gap,
  count,
  chosenIndex,
  openProgress,
  doorColor = "#1a1a1a",
  lightColor = "rgba(255, 233, 176, 0.9)",
}) => {
  const clamped = Math.max(0, Math.min(1, openProgress));

  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const x = position.x + i * (doorWidth + gap);
        const isChosen = i === chosenIndex;
        const open = isChosen ? clamped : 0;

        return (
          <g key={i}>
            {/* door frame slot (always visible, reads as a doorway even
                once the panel below fades for the chosen door) */}
            <rect
              x={x - 4}
              y={position.y - 4}
              width={doorWidth + 8}
              height={doorHeight + 4}
              fill="none"
              stroke={doorColor}
              strokeWidth={3}
              opacity={0.5}
            />

            {/* light glow growing behind the chosen door as it opens */}
            {isChosen && (
              <rect
                x={x}
                y={position.y}
                width={doorWidth}
                height={doorHeight}
                fill={lightColor}
                opacity={0.15 + open * 0.75}
              />
            )}

            {/* the door panel itself - fades and "swings" (scaleX squeeze
                toward the hinge edge) as the chosen door opens */}
            <g
              transform={`translate(${x}, 0) scale(${1 - open * 0.85}, 1) translate(${-x}, 0)`}
              opacity={1 - open * 0.9}
            >
              <rect
                x={x}
                y={position.y}
                width={doorWidth}
                height={doorHeight}
                rx={4}
                fill={doorColor}
              />
              {/* doorknob */}
              <circle
                cx={x + doorWidth * 0.82}
                cy={position.y + doorHeight * 0.52}
                r={5}
                fill="none"
                stroke="#f2f2f2"
                strokeWidth={2}
              />
            </g>
          </g>
        );
      })}
    </g>
  );
};

export default DoorChoice;
