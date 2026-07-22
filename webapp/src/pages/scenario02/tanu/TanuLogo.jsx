// Original wordmark, HTML/CSS only (no image asset): "tanu", all lowercase.
// The mark above the word is two small overlapping circles rather than a
// single dot - meant to read as "two people getting close", not as a
// flame/heart/star. Sized off `size` (font-size in px) so header vs. splash
// usage share one component.
export function TanuLogo({ size = 22 }) {
  return (
    <span className="tanu-logo" style={{ fontSize: size }}>
      <span className="tanu-logo-mark" aria-hidden="true">
        <span className="tanu-logo-mark-circle a" />
        <span className="tanu-logo-mark-circle b" />
      </span>
      tanu
    </span>
  );
}
