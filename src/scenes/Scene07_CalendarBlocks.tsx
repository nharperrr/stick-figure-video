import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES } from "../components/StickFigure";
import { CalendarBlocks } from "../components/CalendarBlocks";
import { FPS } from "../timeline";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 07 - CALENDAR BLOCKS (2:05-2:30)
// One floor-tile-like block lights up roughly every 3.5 seconds as the
// character keeps showing up. A small "page flip" flash in the corner marks
// each new day. Camera slowly zooms out to reveal the growing pattern.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const COLUMNS = 7;
const LIGHT_INTERVAL = 107; // ~3.5s at 30fps

export const Scene07_CalendarBlocks: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const blockSize = 56;
  const gap = 14;
  const gridWidth = COLUMNS * blockSize + (COLUMNS - 1) * gap;

  const litCount = Math.min(COLUMNS, Math.floor(frame / LIGHT_INTERVAL) + 1);

  // Slow zoom-out reveal.
  const cameraScale = interpolate(frame, [0, 750], [1.06, 1.0], {
    extrapolateRight: "clamp",
  });

  // Nod whenever a new block lights (brief spring on headTilt).
  const sinceLight = frame % LIGHT_INTERVAL;
  const nodSpring = spring({ frame: sinceLight, fps: FPS, config: { damping: 12 } });
  const nod = Math.sin(Math.min(1, nodSpring) * Math.PI) * 6;

  // Page-flip flash in the corner each time a block lights.
  const flashOpacity = interpolate(sinceLight, [0, 6, 16], [0.8, 0.8, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <g
      transform={`scale(${cameraScale})`}
      style={{ transformOrigin: `${width / 2}px ${floorY}px` }}
    >
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.65}
        lightLevel={0.5}
        curtainsOpen={0.5}
        frame={frame}
      />

      <CalendarBlocks
        position={{ x: width / 2 - gridWidth / 2, y: floorY - blockSize - 12 }}
        columns={COLUMNS}
        rows={1}
        blockSize={blockSize}
        gap={gap}
        litCount={litCount}
        accentColor={palette.accentWarm}
        dimColor={palette.wallShadow}
      />

      <StickFigure
        pose={{ ...POSES.standingConfidentIdle, headTilt: POSES.standingConfidentIdle.headTilt - nod }}
        position={{ x: width / 2, y: floorY }}
        stroke={palette.figureStroke}
      />

      {/* small page-flip flash, top-right corner, marking a new day */}
      <rect
        x={width * 0.86}
        y={height * 0.08}
        width={36}
        height={46}
        rx={3}
        fill="#ffffff"
        opacity={flashOpacity}
      />
    </g>
  );
};

export default Scene07_CalendarBlocks;
