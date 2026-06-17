import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import {
  StickFigure,
  POSES,
  interpolatePose,
  getFigurePoints,
} from "../components/StickFigure";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 12 - HEARTBREAK LIGHT (4:05-4:30)
// A cracked heart shape starts large, dragging behind the character on a
// thin chain. Midway through, the chain fades and the heart shrinks into a
// small glowing shape carried on the chest instead. The scene stays subdued
// throughout - this is "steady", not "happy".
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const MIDPOINT = 375; // 50% of 750 frames

function heartPath(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy + r * 0.6}
          C ${cx - r} ${cy - r * 0.4}, ${cx - r * 0.3} ${cy - r * 1.1}, ${cx} ${cy - r * 0.3}
          C ${cx + r * 0.3} ${cy - r * 1.1}, ${cx + r} ${cy - r * 0.4}, ${cx} ${cy + r * 0.6} Z`;
}

export const Scene12_HeartbreakLight: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const position = { x: width * 0.42, y: floorY };

  const moveT = interpolate(frame, [MIDPOINT, MIDPOINT + 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pose = interpolatePose(POSES.carryingWeightBehind, POSES.standingHandOnChest, moveT);
  const pts = getFigurePoints(pose, position);

  // Dragging position behind the character, with a slow wobble standing in
  // for a soft spring-lag follow.
  const wobble = Math.sin(frame * 0.08) * 6;
  const draggingPos = { x: position.x - 70 + wobble * 0.3, y: floorY - 18 + wobble };

  // Chest position once carried as light.
  const chestPos = { x: pts.shoulderR.x - 6, y: (pts.shoulderR.y + pts.hip.y) / 2 };

  const heartX = draggingPos.x + (chestPos.x - draggingPos.x) * moveT;
  const heartY = draggingPos.y + (chestPos.y - draggingPos.y) * moveT;
  const heartScale = interpolate(moveT, [0, 1], [1.3, 0.4]);
  const chainOpacity = interpolate(frame, [MIDPOINT, MIDPOINT + 90], [0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowOpacity = interpolate(moveT, [0.6, 1], [0, 0.7], { extrapolateLeft: "clamp" });

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={0.45}
      lightLevel={0.5}
      curtainsOpen={0.5}
      frame={frame}
    >
      {/* chain link to the dragging heart, fades out once the heart moves in */}
      {chainOpacity > 0.01 && (
        <line
          x1={pts.hip.x - 10}
          y1={pts.hip.y}
          x2={heartX}
          y2={heartY}
          stroke={palette.figureStroke}
          strokeWidth={2}
          strokeDasharray="6 5"
          opacity={chainOpacity}
        />
      )}

      {glowOpacity > 0.01 && (
        <circle cx={heartX} cy={heartY} r={26} fill={palette.accentWarm} opacity={glowOpacity * 0.4} />
      )}

      <path
        d={heartPath(heartX, heartY, 34 * heartScale)}
        fill="none"
        stroke={palette.figureStroke}
        strokeWidth={3.5}
      />
      <line
        x1={heartX - 4}
        y1={heartY - 6}
        x2={heartX + 4}
        y2={heartY + 8}
        stroke={palette.figureStroke}
        strokeWidth={2.5}
        opacity={1 - moveT * 0.5}
      />

      <StickFigure pose={pose} position={position} stroke={palette.figureStroke} />
    </RoomScene>
  );
};

export default Scene12_HeartbreakLight;
