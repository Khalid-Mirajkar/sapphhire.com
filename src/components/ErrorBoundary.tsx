import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught:", error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-gray-400">
              An unexpected error occurred. Please try reloading the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-xs text-left bg-black/40 p-3 rounded overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset}>Back to home</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
