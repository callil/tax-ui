import { useState, useRef, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], apiKey: string) => Promise<void>;
  onSaveApiKey?: (apiKey: string) => Promise<void>;
  hasStoredKey: boolean;
  pendingFiles: File[];
  configureKeyOnly?: boolean;
}

export function UploadModal({ isOpen, onClose, onUpload, onSaveApiKey, hasStoredKey, pendingFiles, configureKeyOnly }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFiles = pendingFiles.length > 0 ? pendingFiles : files;
  const needsApiKey = !hasStoredKey && !apiKey.trim();
  const showFileUpload = pendingFiles.length === 0 && !configureKeyOnly;

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setApiKey("");
      setError(null);
    }
  }, [isOpen]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    } else {
      setError("Please upload PDF files");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selectedFiles = Array.from(e.target.files || []).filter(f => f.type === "application/pdf");
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
    } else if (e.target.files?.length) {
      setError("Please upload PDF files");
    }
  }

  async function handleSubmit() {
    // API key only mode
    if (configureKeyOnly) {
      if (!apiKey.trim()) {
        setError("Please enter your API key");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        await onSaveApiKey?.(apiKey.trim());
        setApiKey("");
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save API key");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (needsApiKey) {
      setError("Please enter your API key");
      return;
    }
    if (activeFiles.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onUpload(activeFiles, apiKey.trim());
      setFiles([]);
      setApiKey("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process PDF");
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-bg-elevated)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--color-border-subtle)] max-w-md w-full p-6 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {configureKeyOnly ? "API Key" : pendingFiles.length > 0 ? "Enter API Key" : "Upload Tax Return"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded-lg transition-all disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Pending files indicator */}
        {pendingFiles.length > 0 && (
          <div className="mb-6 p-4 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border-subtle)]">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} selected
            </p>
            <div className="text-xs text-[var(--color-text-muted)] mt-2 max-h-20 overflow-y-auto space-y-1">
              {pendingFiles.map((f, i) => (
                <div key={i} className="truncate">{f.name}</div>
              ))}
            </div>
          </div>
        )}

        {/* API Key input */}
        {(!hasStoredKey || configureKeyOnly) && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50 transition-all"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              {configureKeyOnly && hasStoredKey ? "Update your API key. " : ""}Saved locally to .env file.
            </p>
          </div>
        )}

        {/* File upload area */}
        {showFileUpload && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={[
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]",
              isLoading ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              disabled={isLoading}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted)]">
                  <path d="M12 4v12M4 12h16" strokeLinecap="round" transform="rotate(0 12 12)" />
                  <path d="M4 18h16" strokeLinecap="round" />
                </svg>
              </div>
              {files.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {files.length} file{files.length > 1 ? "s" : ""} selected
                  </p>
                  <div className="text-xs text-[var(--color-text-muted)] max-h-16 overflow-y-auto space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className="truncate">{f.name}</div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    Drop PDF files here
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    or click to browse
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--color-error-soft)] border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm">
            {error}
          </div>
        )}

        {/* Privacy note */}
        {!configureKeyOnly && (
          <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text-secondary)]">Privacy:</strong> Your tax return is sent directly to Anthropic's API.
            Data is stored locally in .tax-returns.json.{" "}
            <a
              href="https://www.anthropic.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              Privacy policy
            </a>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || (configureKeyOnly ? !apiKey.trim() : (needsApiKey || activeFiles.length === 0))}
          className="mt-6 w-full py-3.5 bg-[var(--color-accent)] text-white font-medium text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-sm hover:shadow-md"
        >
          {isLoading
            ? (configureKeyOnly ? "Saving..." : "Processing...")
            : (configureKeyOnly ? "Save API Key" : `Parse ${activeFiles.length > 1 ? `${activeFiles.length} Returns` : "Tax Return"}`)}
        </button>
      </div>
    </div>
  );
}
