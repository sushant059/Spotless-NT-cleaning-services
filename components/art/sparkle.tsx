
/** The four-point sparkle from the logo. Used as the brand's signature accent. */
// Retired from the design: decorative sparkles made the site look generic. Kept so imports don't break.
export function Sparkle(props: { className?: string; animated?: boolean }) {
  void props;
  return null;
}

/** The green swoosh from the logo, as a section divider. */
export function Swoosh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden className={className}>
      <path d="M0 50 C150 -10 420 -10 600 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
