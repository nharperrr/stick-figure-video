import { Palette } from "../utils/colors";

// ---------------------------------------------------------------------------
// SHARED SCENE PROPS
// ---------------------------------------------------------------------------
// Every top-level scene component (Scene01_IntroRoom, Scene02_..., etc.)
// implements this interface. Scenes are mounted inside a Remotion
// <Sequence> by src/Video.tsx, so each scene's own useCurrentFrame() call
// is automatically LOCAL to that scene (0 at the scene's first frame) -
// scenes never need to know their absolute position in the full timeline.
//
// `palette` is the current color grade (see src/utils/colors.ts), computed
// once per absolute frame in Video.tsx from the continuous mood curve and
// passed down - scenes should always pull colors from here rather than
// hardcoding hex values, so the whole video can be restyled from one file.
// ---------------------------------------------------------------------------

export interface SceneProps {
  width: number;
  height: number;
  palette: Palette;
}
