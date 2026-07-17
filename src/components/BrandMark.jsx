// The Fitness-Elevated FE diamond mark — identical artwork to the homepage nav.
export default function BrandMark({ size = 26 }) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Fitness-Elevated logo"
      role="img"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="fe-mark-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#A9821C" />
          <stop offset=".5" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#F6D899" />
        </linearGradient>
      </defs>
      <polygon
        points="120,30 210,120 120,210 30,120"
        fill="none"
        stroke="url(#fe-mark-g)"
        strokeWidth="9"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />
      <g
        transform="translate(120,120)"
        fill="none"
        stroke="url(#fe-mark-g)"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeWidth="11"
      >
        <path d="M -44 -23 L -13 -54 L -13 54  M -13 0 L -43 0" />
        <path d="M 44 -23 L 13 -54 L 13 54 L 44 23  M 13 0 L 43 0" />
      </g>
    </svg>
  );
}
