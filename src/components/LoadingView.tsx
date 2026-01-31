import { BrailleSpinner } from "./BrailleSpinner";

interface Props {
  filename: string;
  year: number | null;
  status: "extracting-year" | "parsing";
}

export function LoadingView({ filename, year, status }: Props) {
  const statusText = status === "extracting-year"
    ? "Extracting year..."
    : "Parsing tax return...";

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-muted)] flex items-center justify-center mx-auto mb-6">
          <BrailleSpinner className="text-2xl text-[var(--color-text-muted)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
          {year ? `${year} Tax Return` : "Processing"}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-1 max-w-xs truncate px-4">{filename}</p>
        <p className="text-xs text-[var(--color-text-muted)] animate-pulse-soft">{statusText}</p>
      </div>
    </div>
  );
}
