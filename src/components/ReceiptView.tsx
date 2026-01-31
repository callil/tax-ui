import { useState } from "react";
import type { TaxReturn } from "../lib/schema";
import { formatPercent } from "../lib/format";
import { getTotalTax, getEffectiveRate } from "../lib/tax-calculations";
import { type TimeUnit, TIME_UNIT_LABELS, convertToTimeUnit, formatTimeUnitValue } from "../lib/time-units";
import { Row, RateRow } from "./Row";
import { Separator, DoubleSeparator, SectionHeader } from "./Section";
import { SleepingEarnings } from "./SleepingEarnings";
import { TaxFreedomDay } from "./TaxFreedomDay";

interface Props {
  data: TaxReturn;
}

export function ReceiptView({ data }: Props) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("daily");

  const totalTax = getTotalTax(data);
  const netIncome = data.income.total - totalTax;
  const grossMonthly = Math.round(data.income.total / 12);
  const netMonthly = Math.round(netIncome / 12);
  const hourlyRate = netIncome / 2080; // 40 hrs × 52 weeks
  const timeUnitValue = convertToTimeUnit(hourlyRate, timeUnit);
  const effectiveRate = getEffectiveRate(data);

  return (
    <div className="max-w-lg mx-auto px-8 py-12">
      {/* Header Card */}
      <div className="bg-[var(--color-bg-elevated)] rounded-2xl p-6 shadow-[var(--shadow-card)] border border-[var(--color-border-subtle)] mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">{data.year}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Tax Return</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--color-text-secondary)]">{data.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-[var(--color-bg-elevated)] rounded-2xl p-6 shadow-[var(--shadow-card)] border border-[var(--color-border-subtle)]">
        <SectionHeader>Income</SectionHeader>
        <Separator />
        {data.income.items.map((item, i) => (
          <Row key={i} label={item.label} amount={item.amount} />
        ))}
        <Separator />
        <Row label="Total income" amount={data.income.total} isTotal />

        <SectionHeader>Federal</SectionHeader>
        <Separator />
        <Row label="Adjusted gross income" amount={data.federal.agi} />
        {data.federal.deductions.map((item, i) => (
          <Row key={i} label={item.label} amount={item.amount} isMuted />
        ))}
        <Separator />
        <Row label="Taxable income" amount={data.federal.taxableIncome} />
        <Row label="Tax" amount={data.federal.tax} />
        {data.federal.credits.map((item, i) => (
          <Row key={i} label={item.label} amount={item.amount} isMuted />
        ))}
        {data.federal.payments.map((item, i) => (
          <Row key={i} label={item.label} amount={item.amount} isMuted />
        ))}
        <Separator />
        <Row
          label={data.federal.refundOrOwed >= 0 ? "Refund" : "Owed"}
          amount={data.federal.refundOrOwed}
          isTotal
          showSign
        />

        {data.states.map((state, i) => (
          <section key={i}>
            <SectionHeader>{state.name.toUpperCase()}</SectionHeader>
            <Separator />
            <Row label="Adjusted gross income" amount={state.agi} />
            {state.deductions.map((item, j) => (
              <Row key={j} label={item.label} amount={item.amount} isMuted />
            ))}
            <Separator />
            <Row label="Taxable income" amount={state.taxableIncome} />
            <Row label="Tax" amount={state.tax} />
            {state.adjustments.map((item, j) => (
              <Row key={j} label={item.label} amount={item.amount} />
            ))}
            {state.payments.map((item, j) => (
              <Row key={j} label={item.label} amount={item.amount} isMuted />
            ))}
            <Separator />
            <Row
              label={state.refundOrOwed >= 0 ? "Refund" : "Owed"}
              amount={state.refundOrOwed}
              isTotal
              showSign
            />
          </section>
        ))}

        <SectionHeader>Net Position</SectionHeader>
        <Separator />
        <Row
          label={`Federal ${data.summary.federalAmount >= 0 ? "refund" : "owed"}`}
          amount={data.summary.federalAmount}
          showSign
        />
        {data.summary.stateAmounts.map((item, i) => (
          <Row
            key={i}
            label={`${item.state} ${item.amount >= 0 ? "refund" : "owed"}`}
            amount={item.amount}
            showSign
          />
        ))}
        <DoubleSeparator />
        <Row label="Net" amount={data.summary.netPosition} isTotal showSign />

        {data.rates && (
          <>
            <SectionHeader>Tax Rates</SectionHeader>
            <Separator />
            <div className="flex justify-between items-center py-2 px-3 -mx-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wide">
              <span className="flex-1" />
              <span className="w-20 text-right">Marginal</span>
              <span className="w-20 text-right">Effective</span>
            </div>
            <RateRow
              label="Federal"
              marginal={formatPercent(data.rates.federal.marginal)}
              effective={formatPercent(data.rates.federal.effective)}
            />
            {data.rates.state && (
              <RateRow
                label={data.states[0]?.name || "State"}
                marginal={formatPercent(data.rates.state.marginal)}
                effective={formatPercent(data.rates.state.effective)}
              />
            )}
            {data.rates.combined && (
              <>
                <Separator />
                <RateRow
                  label="Combined"
                  marginal={formatPercent(data.rates.combined.marginal)}
                  effective={formatPercent(data.rates.combined.effective)}
                />
              </>
            )}
          </>
        )}

        <SectionHeader>Monthly Breakdown</SectionHeader>
        <Separator />
        <Row label="Gross monthly" amount={grossMonthly} />
        <Row label="Net monthly (after tax)" amount={netMonthly} />

        {/* Time unit take-home */}
        <div className="flex justify-between items-center py-2 px-3 -mx-3 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors text-[var(--color-text-secondary)]">
          <span className="text-sm flex items-center gap-1.5">
            {TIME_UNIT_LABELS[timeUnit]} take-home
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
          </span>
          <span className="tabular-nums font-mono text-sm">
            {formatTimeUnitValue(timeUnitValue, timeUnit)}
          </span>
        </div>

        {/* Time unit switcher */}
        <div className="flex gap-1 mt-3 mb-6">
          {(["daily", "hourly", "minute", "second"] as TimeUnit[]).map((unit) => (
            <button
              key={unit}
              onClick={() => setTimeUnit(unit)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                timeUnit === unit
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]"
              }`}
            >
              {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </button>
          ))}
        </div>

        <SleepingEarnings netIncome={netIncome} />

        <TaxFreedomDay years={[{ year: data.year, effectiveRate }]} />
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-[var(--color-text-muted)]">
          Tax Year {data.year} · Filed {data.year + 1}
        </p>
      </div>
    </div>
  );
}
