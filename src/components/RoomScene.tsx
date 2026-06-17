import React from "react";
import { Palette } from "../utils/colors";

// ---------------------------------------------------------------------------
// ROOM SCENE - the indoor backdrop used by most early/mid scenes.
// ---------------------------------------------------------------------------
// clutterLevel: 1 = fully messy (Scene 1), 0 = fully clean (Scene 20).
// lightLevel:   0 = dim/gray, 1 = fully bright daylight.
// curtainsOpen: 0 = closed, 1 = fully open.
// All clutter shapes use a fixed seeded layout (CLUTTER_ITEMS) so the room
// doesn't "reshuffle" randomly between frames - only opacity/scale change
// with clutterLevel.
// ---------------------------------------------------------------------------

export interface RoomSceneProps {
  width: number;
  height: number;
  palette: Palette;
  clutterLevel: number; // 0-1
  lightLevel: number; // 0-1
  curtainsOpen?: number; // 0-1
  showClock?: boolean;
  clockSpinSpeed?: number; // radians per frame, for the frantic spinning clock
  frame?: number;
  children?: React.ReactNode;
}

const CLUTTER_ITEMS = [
  { x: 0.12, y: 0.86, w: 70, h: 26, rot: -6 }, // crumpled clothes pile
  { x: 0.78, y: 0.84, w: 50, h: 40, rot: 4 }, // box
  { x: 0.62, y: 0.9, w: 60, h: 16, rot: 10 }, // paper scraps
  { x: 0.3, y: 0.88, w: 40, h: 18, rot: -12 }, // crumpled paper
  { x: 0.9, y: 0.88, w: 36, h: 30, rot: -4 }, // bag
];

export const RoomScene: React.FC<RoomSceneProps> = ({
  width,
  height,
  palette,
  clutterLevel,
  lightLevel,
  curtainsOpen = 0,
  showClock = false,
  clockSpinSpeed = 0,
  frame = 0,
  children,
}) => {
  const windowW = width * 0.18;
  const windowH = height * 0.34;
  const windowX = width * 0.78;
  const windowY = height * 0.18;

  const lightGlow = `rgba(255, 244, 214, ${0.15 + lightLevel * 0.45})`;

  return (
    <>
      {/* back wall */}
      <rect x={0} y={0} width={width} height={height} fill={palette.wallBack} />

      {/* soft light wash from the window, brighter as lightLevel rises */}
      <rect
        x={windowX - windowW * 1.6}
        y={0}
        width={windowW * 3.2}
        height={height}
        fill={lightGlow}
      />

      {/* floor */}
      <rect
        x={0}
        y={height * 0.82}
        width={width}
        height={height * 0.18}
        fill={palette.floor}
      />
      <rect
        x={0}
        y={height * 0.82}
        width={width}
        height={6}
        fill={palette.wallShadow}
      />

      {/* window */}
      <rect
        x={windowX}
        y={windowY}
        width={windowW}
        height={windowH}
        fill={`rgba(255, 240, 200, ${0.2 + lightLevel * 0.6})`}
        stroke={palette.wallShadow}
        strokeWidth={8}
      />
      <line
        x1={windowX + windowW / 2}
        y1={windowY}
        x2={windowX + windowW / 2}
        y2={windowY + windowH}
        stroke={palette.wallShadow}
        strokeWidth={5}
      />

      {/* curtains slide open based on curtainsOpen */}
      <rect
        x={windowX - windowW * 0.1 - (windowW * 0.55) * curtainsOpen}
        y={windowY - 14}
        width={windowW * 0.55}
        height={windowH + 28}
        fill={palette.wallShadow}
        opacity={0.9}
      />
      <rect
        x={windowX + windowW * 0.55 + (windowW * 0.55) * curtainsOpen}
        y={windowY - 14}
        width={windowW * 0.55}
        height={windowH + 28}
        fill={palette.wallShadow}
        opacity={0.9}
      />

      {/* frantic wall clock from scene 1 */}
      {showClock && (
        <g transform={`translate(${width * 0.14}, ${height * 0.2})`}>
          <circle r={46} fill="none" stroke={palette.wallShadow} strokeWidth={6} />
          <line
            x1={0}
            y1={0}
            x2={Math.cos(frame * clockSpinSpeed) * 30}
            y2={Math.sin(frame * clockSpinSpeed) * 30}
            stroke={palette.wallShadow}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={0}
            y1={0}
            x2={Math.cos(frame * clockSpinSpeed * 1.6) * 20}
            y2={Math.sin(frame * clockSpinSpeed * 1.6) * 20}
            stroke={palette.wallShadow}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* clutter, fades and shrinks as the room gets cleaner */}
      {CLUTTER_ITEMS.map((item, i) => (
        <rect
          key={i}
          x={item.x * width}
          y={item.y * height}
          width={item.w * Math.max(0.1, clutterLevel)}
          height={item.h * Math.max(0.1, clutterLevel)}
          fill={palette.wallShadow}
          opacity={Math.min(1, clutterLevel * 1.4)}
          transform={`rotate(${item.rot} ${item.x * width} ${item.y * height})`}
          rx={4}
        />
      ))}

      {/* fog/haze overlay for the bleakest scenes */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={palette.sky}
        opacity={palette.fogOpacity * 0.4}
      />

      {children}
    </>
  );
};

export default RoomScene;
