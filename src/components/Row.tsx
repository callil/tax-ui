import { formatCurrency } from "../lib/format";

interface RowProps {
  label: string;
  amount: number;
  showSign?: boolean;
  isTotal?: boolean;
  isMuted?: boolean;
}

export function Row({ label, amount, showSign, isTotal, isMuted }: RowProps) {
  return (
    <div
      className={`flex justify-between items-center py-2 px-3 -mx-3 rounded-lg transition-colors hover:bg-[var(--color-bg-subtle)] ${
        isTotal ? "font-semibold text-[var(--color-text)]" : ""
      } ${isMuted ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-secondary)]"}`}
    >
      <span className="text-sm">{label}</span>
      <span className="tabular-nums font-mono text-sm">{formatCurrency(amount, showSign)}</span>
    </div>
  );
}

interface RateRowProps {
  label: string;
  marginal: string;
  effective: string;
}

export function RateRow({ label, marginal, effective }: RateRowProps) {
  return (
    <div className="flex justify-between items-center py-2 px-3 -mx-3 rounded-lg transition-colors hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]">
      <span className="text-sm flex-1">{label}</span>
      <span className="w-20 text-right tabular-nums font-mono text-sm">{marginal}</span>
      <span className="w-20 text-right tabular-nums font-mono text-sm">{effective}</span>
    </div>
  );
}
