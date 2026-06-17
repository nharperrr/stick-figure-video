import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES } from "../components/StickFigure";
import { ShadowExcuse, ShadowKind } from "../components/ShadowExcuse";
import { FPS } from "../timeline";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 02 - SHADOW EXCUSES (0:15-0:35)
// Six tall dark shapes rise around the seated character, one every 1.5s:
// money, body, heartbreak, direction, time, overwhelm.
// ---------------------------------------------------------------------------
// TO CHANGE WHICH OBSTACLES APPEAR OR THEIR ORDER: edit SHADOW_KINDS below.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const STAGGER_FRAMES = 45; // 1.5s at 30fps between each shadow's rise

const SHADOW_KINDS: ShadowKind[] = [
  "money",
  "body",
  "heartbreak",
  "direction",
  "time",
  "overwhelm",
];

export const Scene02_ShadowExcuses: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;

  // Slow left-to-right pan across the row of shadows.
  const pan = interpolate(frame, [0, 600], [-width * 0.015, width * 0.015], {
    extrapolateRight: "clamp",
  });

  const breathe = Math.sin(frame * 0.07) * 1.2;
  const headTrack = Math.min(10, frame * 0.04);
  const pose = {
    ...POSES.slumpedFloor,
    hipOffsetY: POSES.slumpedFloor.hipOffsetY + breathe,
    headTilt: POSES.slumpedFloor.headTilt - headTrack,
  };

  return (
    <g transform={`translate(${pan}, 0)`}>
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.95}
        lightLevel={0.3}
        curtainsOpen={0}
        frame={frame}
      />

      {SHADOW_KINDS.map((kind, i) => {
        const localFrame = frame - i * STAGGER_FRAMES;
        const rise = spring({
          frame: localFrame,
          fps: FPS,
          config: { damping: 14 },
        });
        const x = width * (0.12 + i * 0.145);
        return (
          <ShadowExcuse
            key={kind}
            kind={kind}
            position={{ x, y: floorY }}
            riseProgress={Math.max(0, Math.min(1, rise))}
          />
        );
      })}

      <StickFigure
        pose={pose}
        position={{ x: width * 0.4, y: floorY }}
        stroke={palette.figureStroke}
      />
    </g>
  );
};

export default Scene02_ShadowExcuses;
