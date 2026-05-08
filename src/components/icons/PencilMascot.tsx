export function PencilMascot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="rotate(45 50 50) translate(0, -5)">
        {/* Pencil Body */}
        <rect x="35" y="15" width="30" height="65" rx="5" fill="hsl(var(--secondary))" />
        {/* Pencil Tip Wood */}
        <path d="M 35 80 L 50 95 L 65 80 Z" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" />
        {/* Pencil Tip Lead */}
        <path d="M 45 87.5 L 50 95 L 55 87.5 Z" fill="hsl(var(--foreground))" />
        {/* Eraser */}
        <rect x="35" y="0" width="30" height="10" rx="5" fill="hsl(var(--accent))" />
        {/* Metal band */}
        <rect x="35" y="10" width="30" height="5" fill="#d1d5db" />
        {/* Eyes */}
        <circle cx="43" cy="40" r="3.5" fill="hsl(var(--foreground))" />
        <circle cx="57" cy="40" r="3.5" fill="hsl(var(--foreground))" />
        {/* Smile */}
        <path d="M 45 50 Q 50 55 55 50" stroke="hsl(var(--foreground))" fill="none" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
