import { useEffect } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { fetchContestants } from "@/src/features/voting/store/votingSlice";

export const useContestantPolling = (interval: number = 5000) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (interval === 0) return;
    
    dispatch(fetchContestants());
    
    const intervalId = setInterval(() => {
      dispatch(fetchContestants());
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [dispatch, interval]);
};