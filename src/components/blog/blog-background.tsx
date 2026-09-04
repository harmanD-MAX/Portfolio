export function BlogBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      {/* Base Theme Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Ambient Theme Accent Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--accent-glow),transparent)] opacity-45" />
      
      {/* Subtle Atmospheric Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/85" />
    </div>
  );
}
