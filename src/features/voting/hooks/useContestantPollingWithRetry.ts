import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchContestants, selectVotingError, setContestants } from "@/src/features/voting/store/votingSlice";
import { isApiAvailable } from "@/src/config/api";
import { mockContestants } from "@/src/data/mockData";

interface PollingOptions {
  interval?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export const useContestantPollingWithRetry = ({
  interval = 5000,
  maxRetries = 3,
  retryDelay = 2000,
}: PollingOptions = {}) => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectVotingError);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchWithRetry = useCallback(async () => {
    try {
      const result = await dispatch(fetchContestants()).unwrap();
      setRetryCount(0);
      return result;
    } catch (err) {
      if (retryCount < maxRetries) {
        setIsRetrying(true);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setIsRetrying(false);
          fetchWithRetry();
        }, retryDelay * (retryCount + 1));
      }
      throw err;
    }
  }, [dispatch, retryCount, maxRetries, retryDelay]);

  const manualRetry = useCallback(() => {
    setRetryCount(0);
    fetchWithRetry();
  }, [fetchWithRetry]);

  useEffect(() => {
    if (interval === 0) return;
    
    if (!isApiAvailable()) {
      dispatch(setContestants(mockContestants));
      return;
    }
    
    fetchWithRetry();
    
    const intervalId = setInterval(() => {
      if (!isRetrying && !error) {
        fetchWithRetry();
      }
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [interval, isRetrying, error, fetchWithRetry, dispatch]);

  return { isRetrying, retryCount, manualRetry };
};