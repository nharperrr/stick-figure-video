import React from "react";

// ---------------------------------------------------------------------------
// SUNRISE ENDING - the final backdrop: a warm gradient sky with a sun
// rising over a horizon, and a glowing ground path leading toward it.
// ---------------------------------------------------------------------------
// `riseProgress` (0-1) drives the sun's climb up the sky and the gradient's
// shift from dawn pink/purple toward bright warm gold. This component owns
// its own warm color stops (rather than reading utils/colors.ts) because the
// sunrise should always read as warm and golden regardless of the global
// mood-grade value at the moment it appears - by this point in the story
// moodProgress is already near 1, so the two naturally agree.
// ---------------------------------------------------------------------------

export interface SunriseEndingProps {
  width: number;
  height: number;
  riseProgress: number; // 0-1
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.replace("#", ""), 16);
  const pb = parseInt(b.replace("#", ""), 16);
  const ar = (pa >> 16) & 255,
    ag = (pa >> 8) & 255,
    ab = pa & 255;
  const br = (pb >> 16) & 255,
    bg = (pb >> 8) & 255,
    bb = pb & 255;
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bch = Math.round(lerp(ab, bb, t));
  return `#${[r, g, bch]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

export const SunriseEnding: React.FC<SunriseEndingProps> = ({
  width,
  height,
  riseProgress,
}) => {
  const t = Math.max(0, Math.min(1, riseProgress));
  const horizonY = height * 0.72;

  // Sky gradient shifts from a dawn (dusty rose / soft purple at top) to a
  // brighter golden-orange sky as the sun climbs.
  const skyTop = lerpHex("#cfa3c9", "#ffcf8a", t);
  const skyMid = lerpHex("#f0b08a", "#ffe3a8", t);
  const skyHorizon = lerpHex("#ffd9a0", "#fff3d6", t);

  const sunR = lerp(70, 95, t);
  const sunCy = lerp(horizonY + sunR * 0.5, horizonY - height * 0.32, t);
  const sunCx = width * 0.5;

  const gradId = "sunriseSkyGradient";
  const sunGlowId = "sunGlow";

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="55%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyHorizon} />
        </linearGradient>
        <radialGradient id={sunGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,250,230,0.9)" />
          <stop offset="100%" stopColor="rgba(255,250,230,0)" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect x={0} y={0} width={width} height={horizonY} fill={`url(#${gradId})`} />

      {/* soft glow halo behind the sun */}
      <circle cx={sunCx} cy={sunCy} r={sunR * 2.4} fill={`url(#${sunGlowId})`} />

      {/* sun */}
      <circle cx={sunCx} cy={sunCy} r={sunR} fill="#fff4d8" opacity={0.95} />

      {/* ground */}
      <rect
        x={0}
        y={horizonY}
        width={width}
        height={height - horizonY}
        fill={lerpHex("#d8c39a", "#f3e3c0", t)}
      />

      {/* glowing path leading from the foreground toward the sun */}
      <path
        d={`M ${width * 0.5} ${height}
            L ${width * 0.46} ${horizonY + (height - horizonY) * 0.35}
            L ${width * 0.5} ${horizonY}
            L ${width * 0.54} ${horizonY + (height - horizonY) * 0.35}
            Z`}
        fill="rgba(255, 244, 214, 0.35)"
      />
    </g>
  );
};

export default SunriseEnding;
