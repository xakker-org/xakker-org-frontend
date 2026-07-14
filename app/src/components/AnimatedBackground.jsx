/**
 * AnimatedBackground — ambient backdrop for the authenticated app.
 *
 * Mounted once inside AppShell (persistent layout root, outside the
 * content route/AnimatePresence), so it never remounts on navigation.
 * Pure CSS (transform/opacity only) — no canvas, no new deps.
 *
 * Round 10 — "Aurora Mesh": drops the grid/dots + glow + sheen
 * formula used in rounds 7-9 entirely (no repeating pattern, no hard
 * sweep edge). Instead: 4 large, independently-timed, softly-blurred
 * colour blobs (signature accent red + violet + sky, all existing
 * tokens) overlap and continuously drift/breathe across the whole
 * viewport on long offset loops, so the entire field is always
 * slowly reshaping rather than a static texture with one moving
 * accent. See animated-background.css for the per-layer rationale.
 *
 * Respects prefers-reduced-motion (media query in this file's CSS) —
 * animations freeze into a single static composition.
 */
export default function AnimatedBackground() {
  return (
    <div className="xk-bg" aria-hidden="true">
      <div className="xk-bg-blob xk-bg-blob-a" />
      <div className="xk-bg-blob xk-bg-blob-b" />
      <div className="xk-bg-blob xk-bg-blob-c" />
      <div className="xk-bg-blob xk-bg-blob-d" />
    </div>
  );
}
