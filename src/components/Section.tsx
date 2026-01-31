export function Separator() {
  return (
    <div className="h-px bg-[var(--color-border-subtle)] my-3" />
  );
}

export function DoubleSeparator() {
  return (
    <div className="flex flex-col gap-0.5 my-3">
      <div className="h-px bg-[var(--color-border)]" />
      <div className="h-px bg-[var(--color-border)]" />
    </div>
  );
}

interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mt-8 mb-3">
      {children}
    </h2>
  );
}
