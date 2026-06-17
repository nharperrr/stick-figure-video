import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { StickFigure, POSES, walkCyclePose, Pose } from "../components/StickFigure";
import { activeBeatIndex } from "../utils/poseSequence";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 13 - MOVE ANYWAY (4:30-4:55)
// Four quick beats: shower (behind a frosted panel), walk outside, call
// someone, sit calmly in a patch of warm sunlight - the scene's first true
// warm light, signalling the corner has been turned.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const BEAT_LENGTH = 187;
const BEAT_COUNT = 4;
const DISSOLVE = 10;

function beatOpacity(localFrame: number) {
  const fadeIn = interpolate(localFrame, [0, DISSOLVE], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(localFrame, [BEAT_LENGTH - DISSOLVE, BEAT_LENGTH], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
}

export const Scene13_MoveAnyway: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const beatIdx = activeBeatIndex(frame, BEAT_LENGTH, BEAT_COUNT);
  const localFrame = frame - beatIdx * BEAT_LENGTH;
  const opacity = beatOpacity(localFrame);
  const centerX = width * 0.46;

  let pose: Pose;
  let extras: React.ReactNode = null;
  let sunlightOpacity = 0;

  if (beatIdx === 0) {
    pose = POSES.showering;
    extras = (
      <g>
        {/* frosted panel the figure showers behind */}
        <rect x={centerX - 70} y={floorY - 230} width={140} height={230} rx={10} fill="rgba(255,255,255,0.18)" />
        {/* simple wavy steam lines */}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M ${centerX - 30 + i * 30} ${floorY - 240} q 8 -10 0 -20 q -8 -10 0 -20`}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={3}
          />
        ))}
      </g>
    );
  } else if (beatIdx === 1) {
    pose = walkCyclePose(localFrame * 0.25, 0.1);
  } else if (beatIdx === 2) {
    pose = POSES.phoneCallPose;
    extras = (
      <g transform={`translate(${centerX + 60}, ${floorY - 180})`}>
        <rect x={-24} y={-16} width={48} height={30} rx={9} fill="none" stroke={palette.figureStroke} strokeWidth={3} />
        <path
          d="M -10 4 q 5 -8 10 0 q 5 -8 10 0"
          fill="none"
          stroke={palette.figureStroke}
          strokeWidth={2}
        />
      </g>
    );
  } else {
    pose = POSES.sittingInSun;
    sunlightOpacity = interpolate(localFrame, [0, 80], [0, 1], { extrapolateRight: "clamp" });
  }

  // Simple outdoor sky/ground backdrop, shared by all four beats.
  const horizonY = height * 0.7;

  return (
    <g opacity={opacity}>
      <rect x={0} y={0} width={width} height={horizonY} fill={palette.sky} opacity={0.6} />
      <rect x={0} y={0} width={width} height={height} fill={palette.wallBack} opacity={0.4} />
      <rect x={0} y={floorY} width={width} height={height - floorY} fill={palette.floor} />

      {sunlightOpacity > 0.01 && (
        <circle cx={centerX} cy={floorY - 60} r={220} fill={palette.accentWarm} opacity={sunlightOpacity * 0.35} />
      )}

      <StickFigure pose={pose} position={{ x: centerX, y: floorY }} stroke={palette.figureStroke} />
      {extras}
    </g>
  );
};

export default Scene13_MoveAnyway;
