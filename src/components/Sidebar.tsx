import { useRef } from "react";
import { Menu } from "@base-ui/react/menu";
import { BrailleSpinner } from "./BrailleSpinner";

interface FileItem {
  id: string;
  label: string;
  isPending?: boolean;
  status?: "extracting-year" | "parsing";
}

interface Props {
  items: FileItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
  isUploading: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  onConfigureApiKey: () => void;
}

export function Sidebar({ items, selectedId, onSelect, onUpload, onDelete, isUploading, isDark, onToggleDark, onConfigureApiKey }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      onUpload(files);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      onUpload(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const canDelete = (id: string) => id !== "demo" && id !== "summary" && !id.startsWith("pending:");

  return (
    <aside className="w-64 flex-shrink-0 bg-[var(--color-bg-subtle)] flex flex-col h-screen border-r border-[var(--color-border-subtle)]">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between">
        <h1 className="text-base font-semibold tracking-tight text-[var(--color-text)]">
          Taxes
        </h1>
        <Menu.Root>
          <Menu.Trigger className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded-lg transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="3" r="1" />
              <circle cx="8" cy="8" r="1" />
              <circle cx="8" cy="13" r="1" />
            </svg>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={8}>
              <Menu.Popup className="bg-[var(--color-bg-elevated)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-1.5 min-w-[180px] animate-slide-up">
                <Menu.Item
                  onClick={onConfigureApiKey}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--color-bg-subtle)] data-[highlighted]:bg-[var(--color-bg-subtle)] outline-none transition-colors flex items-center gap-3"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path d="M10.5 7.5L14 11l-1.5 1.5M12 9.5l1.5 1.5" />
                  </svg>
                  API Key
                </Menu.Item>
                <Menu.Item
                  onClick={onToggleDark}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--color-bg-subtle)] data-[highlighted]:bg-[var(--color-bg-subtle)] outline-none transition-colors flex items-center gap-3"
                >
                  {isDark ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="8" r="3" />
                      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.414 1.414M11.536 11.536l1.414 1.414M3.05 12.95l1.414-1.414M11.536 4.464l1.414-1.414" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 10.5A6.5 6.5 0 1 1 5.5 2 5 5 0 0 0 14 10.5Z" />
                    </svg>
                  )}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </header>

      {/* Upload area */}
      <div className="px-4 pb-3">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={[
            "border-2 border-dashed rounded-xl px-4 py-4 text-center cursor-pointer transition-all duration-200",
            "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]",
            isUploading ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center">
              {isUploading ? (
                <BrailleSpinner className="text-sm text-[var(--color-text-muted)]" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted)]">
                  <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                {isUploading ? "Uploading..." : "Upload PDF"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Drop files or click
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <button
                onClick={() => onSelect(item.id)}
                className={[
                  "w-full px-3 py-2.5 text-left text-sm rounded-lg flex items-center justify-between transition-all duration-200",
                  selectedId === item.id
                    ? "bg-[var(--color-bg-elevated)] shadow-[var(--shadow-card)] text-[var(--color-text)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)]",
                  item.isPending ? "opacity-60" : "",
                ].join(" ")}
              >
                <span className="flex items-center gap-2.5">
                  {item.isPending && <BrailleSpinner className="text-xs" />}
                  {item.id === "summary" && (
                    <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      S
                    </span>
                  )}
                  {item.id === "demo" && (
                    <span className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-medium">
                      D
                    </span>
                  )}
                  {!item.isPending && item.id !== "summary" && item.id !== "demo" && (
                    <span className="w-5 h-5 rounded-md bg-[var(--color-bg-muted)] flex items-center justify-center text-[var(--color-text-muted)] text-xs font-mono">
                      {item.label.slice(-2)}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              </button>

              {canDelete(item.id) && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Menu.Root>
                    <Menu.Trigger
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded-md transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="3" r="1" />
                        <circle cx="8" cy="8" r="1" />
                        <circle cx="8" cy="13" r="1" />
                      </svg>
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner sideOffset={4}>
                        <Menu.Popup className="bg-[var(--color-bg-elevated)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-1.5 min-w-[120px] animate-slide-up">
                          <Menu.Item
                            onClick={() => onDelete(item.id)}
                            className="px-4 py-2 text-sm cursor-pointer text-[var(--color-error)] hover:bg-[var(--color-error-soft)] data-[highlighted]:bg-[var(--color-error-soft)] outline-none transition-colors"
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)]">
        <p className="text-xs text-[var(--color-text-muted)] text-center">
          Data stored locally
        </p>
      </div>
    </aside>
  );
}
