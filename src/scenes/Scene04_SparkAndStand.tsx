import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { RoomScene } from "../components/RoomScene";
import {
  StickFigure,
  POSES,
  interpolatePose,
  getFigurePoints,
} from "../components/StickFigure";
import { ShadowExcuse, ShadowKind } from "../components/ShadowExcuse";
import { CONSTANTS } from "../utils/colors";
import { FPS } from "../timeline";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 04 - SPARK AND STAND (0:55-1:15)
// The character sits up, a small spark of hope appears overhead, and the
// character pushes up to stand for the first time in the video. The stand
// is deliberately a little shaky (low spring damping) - this is effortful,
// not triumphant yet.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const SHADOW_KINDS: ShadowKind[] = [
  "money",
  "body",
  "heartbreak",
  "direction",
  "time",
  "overwhelm",
];

export const Scene04_SparkAndStand: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;

  // Stage 1: lyingDown -> sittingUp (smooth). Stage 2: sittingUp -> standing,
  // driven by a low-damping spring so the stand reads as shaky/effortful.
  const sitT = interpolate(frame, [0, 200], [0, 1], {
    extrapolateRight: "clamp",
  });
  const standSpring = spring({
    frame: frame - 220,
    fps: FPS,
    config: { damping: 9, mass: 1.1 },
  });
  const standT = Math.max(0, Math.min(1, standSpring));

  const pose =
    frame < 220
      ? interpolatePose(POSES.lyingDown, POSES.sittingUp, sitT)
      : interpolatePose(POSES.sittingUp, POSES.standing, standT);

  const position = { x: width * 0.4, y: floorY };
  const figurePoints = getFigurePoints(pose, position);

  // Spark of hope: appears ~40% through the scene (frame 240), springs in,
  // then bobs gently above the character's head.
  const sparkSpring = spring({
    frame: frame - 240,
    fps: FPS,
    config: { damping: 10 },
  });
  const sparkScale = Math.max(0, Math.min(1, sparkSpring));
  const sparkBob = Math.sin(frame * 0.1) * 6;
  const sparkPos = {
    x: figurePoints.head.x,
    y: figurePoints.head.y - 50 + sparkBob,
  };

  // Camera: a slow tilt that subtly follows the character upward.
  const overall = frame / 600;
  const cameraShiftY = interpolate(overall, [0, 1], [16, -10]);

  // Shadows recede slightly as the character reclaims space.
  const recede = interpolate(overall, [0, 1], [1, 0.95]);

  return (
    <g transform={`translate(0, ${cameraShiftY})`}>
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.9}
        lightLevel={0.35}
        curtainsOpen={0}
        frame={frame}
      />

      <g
        opacity={0.3}
        transform={`scale(${recede})`}
        style={{ transformOrigin: `${width / 2}px ${floorY}px` }}
      >
        {SHADOW_KINDS.map((kind, i) => (
          <ShadowExcuse
            key={kind}
            kind={kind}
            position={{ x: width * (0.12 + i * 0.145), y: floorY }}
            riseProgress={1}
          />
        ))}
      </g>

      <StickFigure pose={pose} position={position} stroke={palette.figureStroke} />

      {sparkScale > 0 && (
        <g transform={`translate(${sparkPos.x}, ${sparkPos.y}) scale(${sparkScale})`}>
          <circle r={18} fill={CONSTANTS.sparkGlow} opacity={0.25} />
          <circle r={8} fill={CONSTANTS.sparkGlow} opacity={0.9} />
        </g>
      )}
    </g>
  );
};

export default Scene04_SparkAndStand;
