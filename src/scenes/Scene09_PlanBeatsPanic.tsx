import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES, interpolatePose } from "../components/StickFigure";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 09 - PLAN BEATS PANIC (2:55-3:20)
// A storm cloud hovering over the character steadily shrinks while a simple
// winding path draws itself across the floor, glowing, leading off into
// the distance - panic replaced by a plan.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const PATH_LENGTH_APPROX = 900; // used for the stroke-dasharray draw trick

export const Scene09_PlanBeatsPanic: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const duration = 750;

  const cloudScale = interpolate(frame, [0, duration], [1, 0.3], { extrapolateRight: "clamp" });
  const cloudOpacity = interpolate(frame, [0, duration], [0.9, 0.3], { extrapolateRight: "clamp" });

  const drawAmount = interpolate(frame, [60, 600], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashOffset = PATH_LENGTH_APPROX * (1 - drawAmount);

  const shoulderRelax = interpolate(frame, [0, duration], [0, 6], { extrapolateRight: "clamp" });
  const pose = interpolatePose(POSES.standingLookingForward, {
    ...POSES.standingLookingForward,
    leftShoulderAngle: POSES.standingLookingForward.leftShoulderAngle - shoulderRelax,
    rightShoulderAngle: POSES.standingLookingForward.rightShoulderAngle + shoulderRelax,
  }, 1);

  const lightLevel = interpolate(frame, [0, duration], [0.5, 0.55], { extrapolateRight: "clamp" });

  const cloudX = width * 0.42;
  const cloudY = floorY - 230;

  const pathD = `M ${width * 0.1} ${floorY + 30}
                 Q ${width * 0.3} ${floorY - 10}, ${width * 0.5} ${floorY + 20}
                 T ${width * 0.92} ${floorY}`;

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={0.55}
      lightLevel={lightLevel}
      curtainsOpen={0.5}
      frame={frame}
    >
      {/* winding glowing path, drawing itself across the floor */}
      <path
        d={pathD}
        fill="none"
        stroke={palette.accentWarm}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.8}
        strokeDasharray={PATH_LENGTH_APPROX}
        strokeDashoffset={dashOffset}
      />

      {/* storm cloud, shrinking and fading */}
      <g
        transform={`translate(${cloudX}, ${cloudY}) scale(${cloudScale})`}
        opacity={cloudOpacity}
      >
        <ellipse cx={-30} cy={0} rx={42} ry={26} fill={palette.wallShadow} />
        <ellipse cx={20} cy={-10} rx={50} ry={32} fill={palette.wallShadow} />
        <ellipse cx={55} cy={6} rx={36} ry={22} fill={palette.wallShadow} />
      </g>

      <StickFigure pose={pose} position={{ x: width * 0.42, y: floorY }} stroke={palette.figureStroke} />
    </RoomScene>
  );
};

export default Scene09_PlanBeatsPanic;
