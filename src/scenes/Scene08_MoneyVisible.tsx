import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES, interpolatePose } from "../components/StickFigure";
import { MoneyLeakBucket } from "../components/MoneyLeakBucket";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 08 - MONEY VISIBLE (2:30-2:55)
// Character sits at a table with blank paper shapes (no written numbers).
// Coins flow in from one side and out the other. A leaking bucket beside
// the table gets patched about 70% through the scene.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const PATCH_AT = 525; // 70% of 750 frames
const COIN_COUNT = 4;

export const Scene08_MoneyVisible: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const tableX = width * 0.42;
  const tableY = floorY - 56;

  const reachT = interpolate(frame, [PATCH_AT - 30, PATCH_AT + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pose =
    frame < PATCH_AT + 20
      ? interpolatePose(POSES.sittingAtTable, POSES.armReachSide, reachT)
      : interpolatePose(POSES.armReachSide, POSES.sittingAtTable, interpolate(frame, [PATCH_AT + 20, PATCH_AT + 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const patched = frame >= PATCH_AT;
  const reliefGlow = interpolate(frame, [PATCH_AT, PATCH_AT + 20, PATCH_AT + 60], [0, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bucketPos = { x: width * 0.62, y: tableY - 10 };

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={0.6}
      lightLevel={0.5}
      curtainsOpen={0.5}
      frame={frame}
    >
      {/* table */}
      <rect x={tableX - 80} y={tableY} width={160} height={10} fill={palette.wallShadow} />
      <rect x={tableX - 70} y={tableY + 10} width={8} height={46} fill={palette.wallShadow} />
      <rect x={tableX + 62} y={tableY + 10} width={8} height={46} fill={palette.wallShadow} />

      {/* blank paper shapes - explicitly no numbers, just rectangles */}
      <rect x={tableX - 40} y={tableY - 22} width={36} height={24} rx={2} fill="#f4ead2" opacity={0.85} />
      <rect x={tableX + 10} y={tableY - 18} width={30} height={20} rx={2} fill="#f4ead2" opacity={0.7} />

      {/* coins flowing in (left) and out (right) of the table */}
      {Array.from({ length: COIN_COUNT }).map((_, i) => {
        const inT = ((frame * 0.02 + i * 0.27) % 1);
        const inX = width * 0.12 + (tableX - 40 - width * 0.12) * inT;
        const inY = tableY - 30 - Math.sin(inT * Math.PI) * 18;
        const outT = ((frame * 0.02 + i * 0.27 + 0.5) % 1);
        const outOpacity = patched ? Math.max(0, 1 - outT * 4) : 1;
        const outX = tableX + 40 + (width * 0.86 - (tableX + 40)) * outT;
        const outY = tableY - 30 - Math.sin(outT * Math.PI) * 18;
        return (
          <g key={i}>
            <circle cx={inX} cy={inY} r={9} fill="none" stroke={palette.figureStroke} strokeWidth={2.5} opacity={0.9} />
            <circle cx={outX} cy={outY} r={9} fill="none" stroke={palette.figureStroke} strokeWidth={2.5} opacity={outOpacity * 0.9} />
          </g>
        );
      })}

      <MoneyLeakBucket position={bucketPos} patched={patched} dripPhase={frame * 0.2} scale={0.9} />

      {reliefGlow > 0 && (
        <circle cx={width * 0.42} cy={floorY - 110} r={70} fill={palette.accentWarm} opacity={reliefGlow * 0.3} />
      )}

      <StickFigure pose={pose} position={{ x: width * 0.42, y: floorY }} stroke={palette.figureStroke} />
    </RoomScene>
  );
};

export default Scene08_MoneyVisible;
