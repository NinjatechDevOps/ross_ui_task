"use client";

interface LoadingErrorProps {
  status: string;
  error: string | null;
  contestantsLength: number;
  loadingText?: string;
}

export const LoadingError = ({ 
  status, 
  error, 
  contestantsLength, 
  loadingText = "Loading..." 
}: LoadingErrorProps) => {
  if (status === "loading" && contestantsLength === 0) {
    return <div className="p-8 text-center">{loadingText}</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }
  return null;
};