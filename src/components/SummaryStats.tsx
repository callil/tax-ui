import { useMemo, useState } from "react";
import type { TaxReturn } from "../lib/schema";
import { formatCompact } from "../lib/format";
import { getTotalTax, getNetIncome } from "../lib/tax-calculations";
import { type TimeUnit, TIME_UNIT_LABELS, convertToTimeUnit, formatTimeUnitValueCompact } from "../lib/time-units";
import { Sparkline } from "./Sparkline";

interface Props {
  returns: Record<number, TaxReturn>;
}

function getDailyTake(data: TaxReturn): number {
  return Math.round(getNetIncome(data) / 365);
}

function getHourlyTake(data: TaxReturn): number {
  return getNetIncome(data) / 2080; // 40 hrs × 52 weeks
}

export function SummaryStats({ returns }: Props) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("daily");

  const years = useMemo(
    () => Object.keys(returns).map(Number).sort((a, b) => a - b),
    [returns]
  );

  const stats = useMemo(() => {
    if (years.length === 0) return null;

    const allReturns = years
      .map((year) => returns[year])
      .filter((r): r is TaxReturn => r !== undefined);

    if (allReturns.length === 0) return null;

    // Sum across all years
    const totalIncome = allReturns.reduce((sum, r) => sum + r.income.total, 0);
    const totalTaxes = allReturns.reduce((sum, r) => sum + getTotalTax(r), 0);
    const netIncome = totalIncome - totalTaxes;

    // Hourly rates for time unit calculations
    const hourlyRates = allReturns.map((r) => getHourlyTake(r));
    const avgHourlyRate =
      hourlyRates.reduce((sum, h) => sum + h, 0) / hourlyRates.length;

    // Per-year values for sparklines (daily for display)
    const dailyTakes = allReturns.map((r) => getDailyTake(r));
    const incomePerYear = allReturns.map((r) => r.income.total);
    const taxesPerYear = allReturns.map((r) => getTotalTax(r));
    const netPerYear = allReturns.map((r) => getNetIncome(r));

    return {
      stats: [
        { label: "Total Income", value: totalIncome, sparkline: incomePerYear, color: "from-emerald-400 to-teal-500" },
        { label: "Taxes Paid", value: totalTaxes, sparkline: taxesPerYear, color: "from-rose-400 to-pink-500" },
        { label: "Net Income", value: netIncome, sparkline: netPerYear, color: "from-blue-400 to-indigo-500" },
      ],
      avgHourlyRate,
      dailySparkline: dailyTakes,
    };
  }, [returns, years]);

  if (!stats) {
    return null;
  }

  const timeUnitValue = convertToTimeUnit(stats.avgHourlyRate, timeUnit);
  const timeUnitLabel =
    timeUnit === "daily" ? "Daily Take" : `${TIME_UNIT_LABELS[timeUnit]} Take`;

  const yearRange =
    years.length > 1
      ? `${years[0]}–${years[years.length - 1]}`
      : years[0]?.toString() ?? "";

  return (
    <div className="p-6 pb-0 flex-shrink-0">
      <div className="grid grid-cols-4 gap-4">
        {stats.stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--color-bg-elevated)] rounded-2xl p-5 shadow-[var(--shadow-card)] border border-[var(--color-border-subtle)] transition-all duration-200 hover:shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center justify-between mb-3">
              <Sparkline
                values={stat.sparkline}
                width={60}
                height={20}
                className="text-[var(--color-text-muted)]"
              />
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
            </div>
            <div className="text-2xl font-semibold tabular-nums font-mono tracking-tight text-[var(--color-text)]">
              {formatCompact(stat.value)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium">
              {stat.label}
            </div>
          </div>
        ))}

        {/* Time Unit Card */}
        <div className="bg-[var(--color-bg-elevated)] rounded-2xl p-5 shadow-[var(--shadow-card)] border border-[var(--color-border-subtle)] transition-all duration-200 hover:shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between mb-3">
            <Sparkline
              values={stats.dailySparkline}
              width={60}
              height={20}
              className="text-[var(--color-text-muted)]"
            />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
          </div>
          <div className="text-2xl font-semibold tabular-nums font-mono tracking-tight text-[var(--color-text)]">
            {formatTimeUnitValueCompact(timeUnitValue, timeUnit)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium flex items-center gap-1.5">
            <span>{timeUnitLabel}</span>
            {timeUnit === "hourly" && (
              <span
                className="cursor-help text-[var(--color-text-muted)]"
                title="Based on 2,080 working hours per year (40 hrs × 52 weeks)"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3M8 10v1" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </div>

          {/* Time unit switcher */}
          <div className="flex gap-1 mt-3">
            {(["daily", "hourly", "minute", "second"] as TimeUnit[]).map(
              (unit) => (
                <button
                  key={unit}
                  onClick={() => setTimeUnit(unit)}
                  className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all duration-200 ${
                    timeUnit === unit
                      ? "bg-[var(--color-accent)] text-white shadow-sm"
                      : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]"
                  }`}
                >
                  {unit.charAt(0).toUpperCase()}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Year range indicator */}
      <div className="text-right text-xs text-[var(--color-text-muted)] mt-3 font-medium">
        {yearRange}
      </div>
    </div>
  );
}
