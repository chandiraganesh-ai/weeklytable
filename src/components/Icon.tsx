// Thin wrapper around Google's Material Symbols icon font (loaded in
// src/app/layout.tsx). Purely decorative — every use here sits alongside
// its own text label, so the icon itself is aria-hidden.
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
    >
      {name}
    </span>
  );
}
