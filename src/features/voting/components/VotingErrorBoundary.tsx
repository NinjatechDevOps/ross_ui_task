'use client';

import React from 'react';
import { ErrorBoundary } from '@/src/shared/components/ErrorBoundary';

interface VotingErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function VotingErrorFallback({ error, resetError }: VotingErrorFallbackProps) {
  const isNetworkError = error.message.toLowerCase().includes('network') || 
                        error.message.toLowerCase().includes('fetch');
  const isVoteError = error.message.toLowerCase().includes('vote');
  const isAlreadyVoted = error.message.toLowerCase().includes('already voted');

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {isAlreadyVoted ? 'Vote Already Submitted' :
             isNetworkError ? 'Connection Problem' : 
             isVoteError ? 'Voting Error' : 
             'Something went wrong'}
          </h3>
          <p className="text-gray-600 text-sm">
            {isAlreadyVoted ? 'You have already voted in this contest. Thank you for participating!' :
             isNetworkError ? 'Please check your internet connection and try again.' :
             isVoteError ? 'Your vote could not be processed. Please try again.' :
             'We encountered an unexpected error.'}
          </p>
        </div>
        
        {!isAlreadyVoted && (
          <div className="space-y-2">
            <button
              onClick={resetError}
              className="w-full px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg font-semibold hover:from-fuchsia-700 hover:to-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function VotingErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <VotingErrorFallback 
          error={new Error('Voting system error')} 
          resetError={() => window.location.reload()} 
        />
      }
      onError={(error, errorInfo) => {
        console.error('Voting Error:', error);
        console.error('Error Info:', errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}