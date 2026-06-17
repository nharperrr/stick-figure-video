// ---------------------------------------------------------------------------
// COLOR / MOOD SYSTEM
// ---------------------------------------------------------------------------
// Everything in this video is graded off ONE number: moodProgress (0 to 1).
// 0   = the bleak, gray, overwhelmed opening world.
// 1   = the bright, warm, hopeful sunrise ending.
// Scenes never set raw colors directly - they ask this file for a palette at
// their current moodProgress (see src/timeline.ts -> getMoodProgressAtFrame).
//
// TO RESTYLE THE WHOLE VIDEO: change the hex values in BLEAK_PALETTE and
// HOPEFUL_PALETTE below. Every scene will re-grade automatically.
// ---------------------------------------------------------------------------

export interface Palette {
  sky: string;
  wallBack: string;
  wallShadow: string;
  floor: string;
  fogOpacity: number;
  figureStroke: string;
  accentWarm: string;
  accentCool: string;
  saturationBoost: number; // 0 = fully desaturated look, 1 = full color
}

const BLEAK_PALETTE: Palette = {
  sky: "#3a3d42",
  wallBack: "#43464b",
  wallShadow: "#2c2e32",
  floor: "#34363a",
  fogOpacity: 0.35,
  figureStroke: "#161616",
  accentWarm: "#6b6b66",
  accentCool: "#52565c",
  saturationBoost: 0.05,
};

const HOPEFUL_PALETTE: Palette = {
  sky: "#ffd9a0",
  wallBack: "#fff3e2",
  wallShadow: "#f3dcb8",
  floor: "#f7e6c8",
  fogOpacity: 0.0,
  figureStroke: "#1a1a1a",
  accentWarm: "#ff9e4a",
  accentCool: "#7fc7e8",
  saturationBoost: 1,
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const [r0, g0, b0] = hexToRgb(a);
  const [r1, g1, b1] = hexToRgb(b);
  return rgbToHex(
    r0 + (r1 - r0) * t,
    g0 + (g1 - g0) * t,
    b0 + (b1 - b0) * t
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Returns a full color palette for a given moodProgress (0-1).
 * Use this in every scene/component instead of hardcoding colors.
 */
export function getPalette(moodProgress: number): Palette {
  const t = Math.min(1, Math.max(0, moodProgress));
  return {
    sky: lerpColor(BLEAK_PALETTE.sky, HOPEFUL_PALETTE.sky, t),
    wallBack: lerpColor(BLEAK_PALETTE.wallBack, HOPEFUL_PALETTE.wallBack, t),
    wallShadow: lerpColor(
      BLEAK_PALETTE.wallShadow,
      HOPEFUL_PALETTE.wallShadow,
      t
    ),
    floor: lerpColor(BLEAK_PALETTE.floor, HOPEFUL_PALETTE.floor, t),
    fogOpacity: lerp(BLEAK_PALETTE.fogOpacity, HOPEFUL_PALETTE.fogOpacity, t),
    figureStroke: lerpColor(
      BLEAK_PALETTE.figureStroke,
      HOPEFUL_PALETTE.figureStroke,
      t
    ),
    accentWarm: lerpColor(
      BLEAK_PALETTE.accentWarm,
      HOPEFUL_PALETTE.accentWarm,
      t
    ),
    accentCool: lerpColor(
      BLEAK_PALETTE.accentCool,
      HOPEFUL_PALETTE.accentCool,
      t
    ),
    saturationBoost: lerp(
      BLEAK_PALETTE.saturationBoost,
      HOPEFUL_PALETTE.saturationBoost,
      t
    ),
  };
}

// A couple of fixed accent colors that stay constant regardless of mood,
// used sparingly for things that should always read clearly (e.g. the
// warm glow of a spark of hope appearing early in a still-bleak scene).
export const CONSTANTS = {
  sparkGlow: "#ffe9b0",
  shadowFill: "#15161a",
  glowWhite: "#ffffff",
};
