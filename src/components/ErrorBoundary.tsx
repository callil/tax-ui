import { Component, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "./Button";

const GITHUB_ISSUES_URL = "https://github.com/brianlovin/tax-ui/issues/new";

interface ErrorInfo {
  componentStack?: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

function createIssueUrl(error: Error | null, errorInfo: ErrorInfo | null, name?: string): string {
  const title = encodeURIComponent(
    `[Bug] ${error?.name || "Error"}: ${error?.message?.slice(0, 80) || "Unknown error"}`
  );

  const body = encodeURIComponent(
    `## Description
Encountered an unexpected error${name ? ` in ${name}` : ""}.

## Error Details
\`\`\`
${error?.name}: ${error?.message}
\`\`\`

## Stack Trace
\`\`\`
${error?.stack || "No stack trace available"}
\`\`\`

## Component Stack
\`\`\`
${errorInfo?.componentStack || "No component stack available"}
\`\`\`

## Environment
- URL: ${typeof window !== "undefined" ? window.location.href : "N/A"}
- User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}
- Timestamp: ${new Date().toISOString()}

## Steps to Reproduce
1. [Please describe what you were doing when the error occurred]
`
  );

  return `${GITHUB_ISSUES_URL}?title=${title}&body=${body}`;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(`ErrorBoundary${this.props.name ? ` (${this.props.name})` : ""} caught:`, error, errorInfo);
  }

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, name } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const issueUrl = createIssueUrl(error, errorInfo, name);

      return (
        <Dialog.Root open={true} onOpenChange={(open) => !open && this.handleDismiss()}>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-[var(--color-overlay)] backdrop-blur-[2px] z-50" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl p-6">
              <Dialog.Title className="text-lg font-semibold text-[var(--color-text)] mb-2">
                Something went wrong
              </Dialog.Title>
              <Dialog.Description className="text-sm text-[var(--color-text-muted)] mb-4 text-pretty">
                An unexpected error occurred{name ? ` in ${name}` : ""}. If this keeps happening, please open an issue on GitHub so we can fix it.
              </Dialog.Description>

              <div className="bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg p-3 mb-4 max-h-32 overflow-auto">
                <code className="text-xs text-red-500 font-mono whitespace-pre-wrap break-all">
                  {error?.name}: {error?.message}
                </code>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={this.handleReload}>
                  Reload page
                </Button>
                <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary">
                    Open issue
                  </Button>
                </a>
              </div>

              <Dialog.Close className="absolute top-5 right-5 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg-muted)]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      );
    }

    return children;
  }
}
