import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Tour Viewer:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('theasys_custom_360_tour_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-neutral-950 px-4 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2 text-neutral-100">
            Unable to Load 360° Virtual Tour
          </h1>
          <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering error occurred. Please check your WebGL support or reset the tour state.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition-colors cursor-pointer"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-indigo-600/25"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Tour Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
