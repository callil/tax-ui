import { formatCurrency } from "../lib/format";

interface Props {
  netIncome: number;
}

export function SleepingEarnings({ netIncome }: Props) {
  // Spread income across all hours, calculate portion during sleep
  // 8 hours sleep / 24 hours = 1/3 of income
  const sleepingEarnings = Math.round(netIncome / 3);

  return (
    <div className="px-6 py-4 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-elevated)] rounded-full shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
        <span className="text-sm text-[var(--color-text-secondary)]">
          You earned
        </span>
        <span className="font-semibold font-mono text-[var(--color-text)]">
          {formatCurrency(sleepingEarnings)}
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          while sleeping
        </span>
      </div>
    </div>
  );
}
