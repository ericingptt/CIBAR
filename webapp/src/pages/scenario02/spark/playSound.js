// Best-effort sound cue. No audio files have been supplied yet for
// scenario-02 (see public/assets/scenarios/README.md) - this stays a no-op
// until match.mp3/message.mp3/warning.mp3 are dropped into
// public/assets/scenarios/scenario-02/audio/, since a missing file should
// never break the flow it's just decorating.
export function playSound(name) {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}assets/scenarios/scenario-02/audio/${name}.mp3`);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    // ignore - the cue is decorative
  }
}
