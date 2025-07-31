import { useState, useEffect } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { selectVoteTimestamp } from "@/src/features/voting/store/votingSlice";

export const useVoteTimer = () => {
  const voteTimestamp = useAppSelector(selectVoteTimestamp);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<number | null>(null);
  const [canVoteAgain, setCanVoteAgain] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!voteTimestamp) {
      setCanVoteAgain(true);
      setHasVoted(false);
    } else {
      setCanVoteAgain(false);
      setHasVoted(true);
    }

    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const timeDiff = midnight.getTime() - now.getTime();
      setTimeUntilMidnight(timeDiff);
    };

    calculateTimeUntilMidnight();
    const interval = setInterval(calculateTimeUntilMidnight, 1000);

    return () => clearInterval(interval);
  }, [voteTimestamp]);

  const formatTimeRemaining = () => {
    if (!timeUntilMidnight || timeUntilMidnight < 0) return null;

    const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilMidnight % (1000 * 60)) / 1000);

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      formatted: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    };
  };

  return {
    canVoteAgain,
    hasVoted,
    timeUntilMidnight,
    formattedTime: formatTimeRemaining()
  };
};