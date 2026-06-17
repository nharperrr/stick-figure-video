import { Config } from "@remotion/cli/config";

// ---------------------------------------------------------------------------
// GLOBAL RENDER CONFIG
// ---------------------------------------------------------------------------
// Adjust default video codec / quality / image format here.
// This does NOT control resolution or fps - those live in src/Root.tsx on the
// <Composition> tags (MainVideo = horizontal, MainVideoVertical = vertical).
// ---------------------------------------------------------------------------

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
// Crf controls quality vs file size. Lower = higher quality / bigger file.
Config.setCrf(18);
