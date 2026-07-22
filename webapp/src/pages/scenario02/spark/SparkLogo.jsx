// Fully original mark for the fictional "SPARK" dating app used in this
// scenario - a four-point sparkle inside a rounded gradient tile, not a
// flame or heart (avoids reading as a copy of any real dating app's icon).
export function SparkLogo({ size = 32, withWordmark = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="sparkTile" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF5A76" />
            <stop offset="100%" stopColor="#FF8D6B" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#sparkTile)" />
        <path
          d="M16 6 L18.1 13.4 L25.5 16 L18.1 18.6 L16 26 L13.9 18.6 L6.5 16 L13.9 13.4 Z"
          fill="#FFFFFF"
        />
        <circle cx="24.5" cy="7.5" r="1.6" fill="#FFD166" />
      </svg>
      {withWordmark && (
        <span style={{ fontWeight: 800, fontSize: size * 0.56, letterSpacing: '0.02em', color: '#222222' }}>
          SPARK
        </span>
      )}
    </span>
  );
}
