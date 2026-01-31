import { useMemo, useState } from "react";
import type { TaxReturn, PendingUpload } from "../lib/schema";
import { getNetIncome, getEffectiveRate } from "../lib/tax-calculations";
import { ReceiptView } from "./ReceiptView";
import { SleepingEarnings } from "./SleepingEarnings";
import { SummaryStats } from "./SummaryStats";
import { SummaryTable } from "./SummaryTable";
import { SummaryReceiptView } from "./SummaryReceiptView";
import { TaxFreedomDay } from "./TaxFreedomDay";
import { LoadingView } from "./LoadingView";

interface CommonProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
}

interface ReceiptProps extends CommonProps {
  view: "receipt";
  data: TaxReturn;
  title: string;
}

interface SummaryProps extends CommonProps {
  view: "summary";
  returns: Record<number, TaxReturn>;
}

interface LoadingProps extends CommonProps {
  view: "loading";
  pendingUpload: PendingUpload;
}

type Props = ReceiptProps | SummaryProps | LoadingProps;

type SummaryViewMode = "table" | "receipt";

export function MainPanel(props: Props) {
  const [summaryViewMode, setSummaryViewMode] = useState<SummaryViewMode>("table");
  const title = props.view === "summary" ? "Summary" : props.view === "loading" ? "Processing" : props.title;

  const summaryData = useMemo(() => {
    if (props.view !== "summary") return null;
    const years = Object.keys(props.returns).map(Number).sort((a, b) => a - b);
    const allReturns = years.map((year) => props.returns[year]).filter((r): r is TaxReturn => r !== undefined);

    const totalNetIncome = allReturns.reduce((sum, r) => sum + getNetIncome(r), 0);

    const taxFreedomYears = years
      .map((year) => {
        const r = props.returns[year];
        if (!r) return null;
        return { year, effectiveRate: getEffectiveRate(r) };
      })
      .filter((x): x is { year: number; effectiveRate: number } => x !== null);

    return { totalNetIncome, taxFreedomYears };
  }, [props]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Header */}
      <header className="px-8 py-4 flex items-center justify-between flex-shrink-0 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
          {props.view === "receipt" && props.title !== "Demo" && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
              Tax Year
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {props.view === "summary" && (
            <div className="flex bg-[var(--color-bg-muted)] rounded-lg p-0.5">
              <button
                onClick={() => setSummaryViewMode("table")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  summaryViewMode === "table"
                    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setSummaryViewMode("receipt")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  summaryViewMode === "receipt"
                    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Cards
              </button>
            </div>
          )}
          <button
            onClick={props.onToggleChat}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
              props.isChatOpen
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] hover:shadow-sm"
            }`}
            title={props.isChatOpen ? "Close chat" : "Open chat"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 10c0 .55-.45 1-1 1H5l-3 3V3c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v7z" />
            </svg>
            Chat
          </button>
        </div>
      </header>

      {/* Content */}
      {props.view === "loading" ? (
        <LoadingView
          filename={props.pendingUpload.filename}
          year={props.pendingUpload.year}
          status={props.pendingUpload.status}
        />
      ) : props.view === "summary" && summaryData ? (
        summaryViewMode === "table" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <SummaryStats returns={props.returns} />
            <SleepingEarnings netIncome={summaryData.totalNetIncome} />
            <TaxFreedomDay years={summaryData.taxFreedomYears} />
            <div className="flex-1 overflow-auto">
              <SummaryTable returns={props.returns} />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <SummaryReceiptView returns={props.returns} />
          </div>
        )
      ) : props.view === "receipt" ? (
        <div className="flex-1 overflow-y-auto">
          <ReceiptView data={props.data} />
        </div>
      ) : null}
    </div>
  );
}
