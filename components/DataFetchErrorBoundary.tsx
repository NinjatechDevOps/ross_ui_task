'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '../src/shared/components/ErrorBoundary';

interface DataErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retryFetch?: () => void;
}

function DataErrorFallback({ error, resetError, retryFetch }: DataErrorFallbackProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      if (retryFetch) {
        await retryFetch();
      }
      resetError();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetrying(false);
    }
  }, [retryFetch, resetError]);

  useEffect(() => {
    // Auto-retry once on mount
    if (retryCount === 0 && retryFetch) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCount, retryFetch, handleRetry]);

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Failed to Load Data
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            We could not fetch the latest information. This might be a temporary issue.
          </p>
          {retryCount > 0 && retryCount < maxRetries && (
            <p className="text-gray-500 text-xs">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          {retryCount < maxRetries ? (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retrying ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Retrying...
                </span>
              ) : (
                'Retry Loading'
              )}
            </button>
          ) : (
            <div className="text-center text-sm text-red-600 font-semibold">
              Maximum retry attempts reached
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Refresh Page
          </button>
        </div>
        
        {error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export function DataFetchErrorBoundary({ 
  children, 
  onRetry 
}: { 
  children: React.ReactNode;
  onRetry?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <DataErrorFallback 
          error={new Error('Data fetch error')} 
          resetError={() => window.location.reload()}
          retryFetch={onRetry}
        />
      }
      onError={(error, errorInfo) => {
        console.error('Data Fetch Error:', error);
        console.error('Error Info:', errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}