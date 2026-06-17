import React from "react";
import { useCurrentFrame } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES } from "../components/StickFigure";
import { CalendarBlocks } from "../components/CalendarBlocks";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 17 - TIME BLOCK SHIELD (6:05-6:30)
// One calendar block glows, protected by a faint shield. Small distraction
// icons bounce off it instead of landing. No numbers or words anywhere.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;

// Each distraction icon has a fixed scattered "exit" direction it bounces
// toward once it hits the shield, so the bounces don't all look identical.
const ICONS: { startAngle: number; exitAngle: number; phase: number; kind: "phone" | "dot" | "bubble" }[] = [
  { startAngle: 200, exitAngle: 250, phase: 0, kind: "phone" },
  { startAngle: -20, exitAngle: 40, phase: 0.33, kind: "dot" },
  { startAngle: 100, exitAngle: 60, phase: 0.6, kind: "bubble" },
  { startAngle: 280, exitAngle: 320, phase: 0.85, kind: "dot" },
];

export const Scene17_TimeBlockShield: React.FC<SceneProps> = ({ width, height, palette }) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const centerX = width * 0.5;
  const blockY = floorY - 70;
  const blockSize = 60;

  const shieldR = 110;
  const shieldPulse = 1 + Math.sin(frame * 0.06) * 0.03;

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={0.35}
      lightLevel={0.55}
      curtainsOpen={0.6}
      frame={frame}
    >
      {/* faint protective shield around the glowing block */}
      <circle
        cx={centerX}
        cy={blockY}
        r={shieldR * shieldPulse}
        fill="none"
        stroke={palette.accentCool}
        strokeWidth={2}
        opacity={0.35}
      />

      <CalendarBlocks
        position={{ x: centerX - blockSize / 2, y: blockY - blockSize / 2 }}
        columns={1}
        rows={1}
        blockSize={blockSize}
        gap={0}
        litCount={0}
        highlightIndex={0}
        highlightPulse={frame * 0.15}
        accentColor={palette.accentWarm}
        dimColor={palette.wallShadow}
      />

      {/* distraction icons looping toward the shield, then bouncing away */}
      {ICONS.map((icon, i) => {
        const cycle = ((frame * 0.012 + icon.phase) % 1);
        const farR = Math.max(width, height) * 0.4;
        const startPt = {
          x: centerX + Math.cos((icon.startAngle * Math.PI) / 180) * farR,
          y: blockY + Math.sin((icon.startAngle * Math.PI) / 180) * farR,
        };
        const exitPt = {
          x: centerX + Math.cos((icon.exitAngle * Math.PI) / 180) * farR,
          y: blockY + Math.sin((icon.exitAngle * Math.PI) / 180) * farR,
        };
        const contactPt = {
          x: centerX + Math.cos((icon.startAngle * Math.PI) / 180) * shieldR,
          y: blockY + Math.sin((icon.startAngle * Math.PI) / 180) * shieldR,
        };

        let x: number, y: number;
        if (cycle < 0.55) {
          const t = cycle / 0.55;
          x = startPt.x + (contactPt.x - startPt.x) * t;
          y = startPt.y + (contactPt.y - startPt.y) * t;
        } else {
          const t = (cycle - 0.55) / 0.45;
          x = contactPt.x + (exitPt.x - contactPt.x) * t;
          y = contactPt.y + (exitPt.y - contactPt.y) * t;
        }

        return (
          <g key={i} transform={`translate(${x}, ${y})`} opacity={0.85}>
            {icon.kind === "phone" && (
              <rect x={-9} y={-15} width={18} height={30} rx={4} fill="none" stroke={palette.figureStroke} strokeWidth={2.5} />
            )}
            {icon.kind === "dot" && <circle r={8} fill={palette.accentCool} />}
            {icon.kind === "bubble" && (
              <rect x={-14} y={-10} width={28} height={18} rx={6} fill="none" stroke={palette.figureStroke} strokeWidth={2.5} />
            )}
          </g>
        );
      })}

      <StickFigure
        pose={POSES.standingGuard}
        position={{ x: centerX, y: floorY }}
        stroke={palette.figureStroke}
      />
    </RoomScene>
  );
};

export default Scene17_TimeBlockShield;
