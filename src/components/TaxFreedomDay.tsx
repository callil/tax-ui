import { useMemo } from "react";
import { getTaxFreedomDay, getTodayDayOfYear } from "../lib/tax-freedom";

interface YearData {
  year: number;
  effectiveRate: number;
}

interface Props {
  years: YearData[];
}

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function TaxFreedomDay({ years }: Props) {
  const todayDayOfYear = useMemo(() => getTodayDayOfYear(), []);

  const markers = useMemo(
    () =>
      years
        .map(({ year, effectiveRate }) => ({
          year,
          ...getTaxFreedomDay(effectiveRate),
        }))
        .sort((a, b) => a.dayOfYear - b.dayOfYear),
    [years]
  );

  if (markers.length === 0) return null;

  const avgDayOfYear = Math.round(
    markers.reduce((sum, m) => sum + m.dayOfYear, 0) / markers.length
  );

  return (
    <div className="px-6 py-4">
      <div className="bg-[var(--color-bg-elevated)] rounded-2xl p-5 shadow-[var(--shadow-card)] border border-[var(--color-border-subtle)]">
        {/* Progress bar */}
        <div className="relative">
          <div className="h-10 flex rounded-xl overflow-hidden bg-[var(--color-bg-muted)]">
            <div
              className="bg-gradient-to-r from-rose-400/40 to-rose-500/40 transition-all duration-500"
              style={{ width: `${(avgDayOfYear / 365) * 100}%` }}
            />
            <div className="flex-1 bg-gradient-to-r from-emerald-400/40 to-emerald-500/40" />
          </div>

          {/* Today marker */}
          <div
            className="absolute top-0 h-10 w-0.5 bg-[var(--color-text)]"
            style={{ left: `${(todayDayOfYear / 365) * 100}%` }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[var(--color-text-secondary)] whitespace-nowrap px-1.5 py-0.5 bg-[var(--color-bg-elevated)] rounded-full border border-[var(--color-border-subtle)]">
              Today
            </div>
          </div>

          {/* Tax freedom day marker(s) */}
          {markers.map((marker, i) => (
            <div
              key={marker.year}
              className="absolute top-0 h-10 w-0.5 bg-white shadow-sm"
              style={{
                left: `${(marker.dayOfYear / 365) * 100}%`,
              }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap px-1.5 py-0.5 bg-[var(--color-bg-elevated)] rounded-full border border-[var(--color-border-subtle)] shadow-sm"
                style={{
                  bottom: `-${20 + (i % 2) * 16}px`,
                }}
              >
                <span className="font-semibold text-[var(--color-text)]">{marker.year}</span>
              </div>
            </div>
          ))}

          {/* Month labels */}
          <div className="flex justify-between mt-2 text-[10px] text-[var(--color-text-muted)] font-medium">
            {MONTH_LABELS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>

        {/* Label */}
        <div
          className="mt-8 text-xs text-center cursor-help"
          title="Tax Freedom Day represents when you've earned enough to pay your total tax bill for the year. Before this date, you're effectively working to pay taxes; after it, you keep what you earn."
        >
          <span className="text-[var(--color-text-muted)]">Tax Freedom Day: </span>
          <span className="font-semibold text-[var(--color-text)]">
            {markers.length === 1
              ? markers[0]?.date
              : `${markers[0]?.date} – ${markers[markers.length - 1]?.date}`}
          </span>
        </div>
      </div>
    </div>
  );
}
