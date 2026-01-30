import { useRef } from "react";
import { Menu } from "@base-ui/react/menu";

interface FileItem {
  id: string;
  label: string;
}

interface Props {
  items: FileItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  isUploading: boolean;
}

export function Sidebar({ items, selectedId, onSelect, onUpload, onDelete, isUploading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      onUpload(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") {
      onUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const canDelete = (id: string) => id !== "demo" && id !== "summary";

  return (
    <aside className="w-70 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col h-screen">
      <header className="px-4 py-3 border-b border-[var(--color-border)]">
        <h1 className="text-sm font-bold tracking-tight">Tax UI</h1>
      </header>

      <div className="p-3">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={[
            "border border-dashed px-3 py-2 text-xs text-center cursor-pointer transition-colors",
            "border-[var(--color-border)]",
            isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--color-text)]/5",
          ].join(" ")}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? "Uploading..." : "upload..."}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative"
          >
            <button
              onClick={() => onSelect(item.id)}
              className={[
                "w-full px-4 py-1.5 text-left text-sm flex items-center justify-between",
                "hover:bg-[var(--color-text)]/5 transition-colors",
                selectedId === item.id ? "font-medium" : "",
              ].join(" ")}
            >
              <span>{item.label}</span>
              {selectedId === item.id && (
                <span className="text-[var(--color-muted)] group-hover:hidden">&gt;</span>
              )}
            </button>

            {canDelete(item.id) && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Menu.Root>
                  <Menu.Trigger
                    onClick={(e) => e.stopPropagation()}
                    className="px-1.5 py-0.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] rounded transition-colors"
                  >
                    ···
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner sideOffset={4}>
                      <Menu.Popup className="bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg py-1 min-w-[120px] font-mono text-sm">
                        <Menu.Item
                          onClick={() => onDelete(item.id)}
                          className="px-3 py-1.5 cursor-pointer hover:bg-[var(--color-text)]/5 text-red-600 dark:text-red-400 data-[highlighted]:bg-[var(--color-text)]/5 outline-none"
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
      </nav>
    </aside>
  );
}
