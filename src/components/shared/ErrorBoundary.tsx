/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends (React.Component as any) {
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

  public componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleGlobalError);
  }

  public componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleGlobalError);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.setState({ hasError: true, error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)) });
  };

  private handleGlobalError = (event: ErrorEvent) => {
    this.setState({ hasError: true, error: event.error });
  };

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorDetails = null;
      let errorMessage = "An unexpected error occurred.";
      
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
          if (errorDetails.error) {
            errorMessage = `Firestore Error: ${errorDetails.error} (${errorDetails.operationType} on ${errorDetails.path})`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-sm border border-gray-200 shadow-2xl p-10 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <h1 className="font-serif text-3xl font-bold text-primary mb-4">Something went wrong</h1>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
              {errorMessage.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
                part.match(/^https?:\/\//) ? (
                  <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">
                    {part}
                  </a>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
            
            {errorDetails && (
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 text-left mb-8 overflow-auto max-h-[200px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Technical Details</p>
                <pre className="text-[10px] font-mono text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg"
              >
                <RefreshCcw size={16} />
                Try Again
              </button>
              <a
                href="/"
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-primary py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
              >
                <Home size={16} />
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
