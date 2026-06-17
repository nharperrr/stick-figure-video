import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, walkCyclePose } from "../components/StickFigure";
import { StaircaseOfWins, WinDot } from "../components/StaircaseOfWins";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 19 - STAIRCASE OF VOTES (6:55-7:20)
// Every small action from earlier in the video reappears as a small
// floating dot, scattered across the room. The dots fly in and assemble
// into a rising staircase. The character begins climbing it.
// ---------------------------------------------------------------------------
// TO ADD/REMOVE A "VOTE": edit the WIN_DOTS array below. The `label` field
// is never rendered - it only documents which earlier beat each dot stands
// for, to keep this list readable.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;

// Scattered starting positions (as fractions of width/height) for each dot,
// spread across the room so they read as "gathering from everywhere" once
// they start flying toward the staircase.
const WIN_DOTS: Array<{ label: string; fx: number; fy: number }> = [
  { label: "first_stand", fx: 0.08, fy: 0.18 },
  { label: "pushups", fx: 0.88, fy: 0.14 },
  { label: "morning_walk", fx: 0.5, fy: 0.08 },
  { label: "job_form", fx: 0.16, fy: 0.42 },
  { label: "cleaned_corner", fx: 0.93, fy: 0.4 },
  { label: "honest_message", fx: 0.32, fy: 0.62 },
  { label: "calendar_block", fx: 0.7, fy: 0.6 },
  { label: "patched_bucket", fx: 0.06, fy: 0.7 },
  { label: "mirror_nod", fx: 0.95, fy: 0.68 },
  { label: "sunlight_sit", fx: 0.46, fy: 0.86 },
  { label: "chosen_door", fx: 0.14, fy: 0.92 },
  { label: "helped_carry", fx: 0.84, fy: 0.9 },
  { label: "guarded_time_block", fx: 0.6, fy: 0.2 },
  { label: "lifted_strap", fx: 0.24, fy: 0.26 },
];

export const Scene19_StaircaseVotes: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;

  // Very slow upward camera drift across the whole scene - subtle, since
  // the staircase itself is sized to stay fully in frame.
  const panY = interpolate(frame, [0, 750], [0, -40], {
    extrapolateRight: "clamp",
  });

  // Phase 1: the dots gather and assemble into the staircase.
  const assembleProgress = interpolate(frame, [40, 540], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: once mostly assembled, the character begins climbing.
  const climbProgress = interpolate(frame, [480, 740], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stepWidth = 56;
  const stepHeight = 38;
  const stepRun = 70;
  const baseAnchor = { x: width * 0.12, y: floorY };

  const dots: WinDot[] = WIN_DOTS.map((d) => ({
    label: d.label,
    from: { x: d.fx * width, y: d.fy * height },
  }));

  // The figure climbs diagonally along the staircase's slope. It only
  // climbs across roughly the first 11 of the 14 steps - by design, it's
  // still climbing as the scene ends, rather than triumphantly finishing.
  const CLIMB_STEPS = 11;
  const climbAnchor = {
    x: baseAnchor.x + climbProgress * stepRun * CLIMB_STEPS + stepWidth / 2,
    y: baseAnchor.y - climbProgress * stepHeight * CLIMB_STEPS - 4,
  };
  const climbPose = walkCyclePose(frame * 0.16, 0.07);

  const lightLevel = interpolate(frame, [0, 750], [0.6, 0.68], {
    extrapolateRight: "clamp",
  });

  return (
    <g transform={`translate(0, ${panY})`}>
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.15}
        lightLevel={lightLevel}
        curtainsOpen={0.75}
        frame={frame}
      >
        <StaircaseOfWins
          baseAnchor={baseAnchor}
          stepWidth={stepWidth}
          stepHeight={stepHeight}
          stepRun={stepRun}
          dots={dots}
          progress={assembleProgress}
          accentColor={palette.accentWarm}
        />

        <StickFigure pose={climbPose} position={climbAnchor} stroke={palette.figureStroke} />
      </RoomScene>
    </g>
  );
};

export default Scene19_StaircaseVotes;
