"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { CheckIcon } from "@/src/shared/components/icons";
import {
  setVoteData,
  setContestants,
  selectContestants,
  selectVotingStatus,
  selectVotingError,
  selectVotedId,
} from "@/src/features/voting/store/votingSlice";
import type { Contestant } from "@/src/features/voting/store/votingSlice";
import { useContestantPollingWithRetry } from "@/src/features/voting/hooks/useContestantPollingWithRetry";
import { useVoteTimer } from "@/src/features/voting/hooks/useVoteTimer";
import { ContestantCard } from "@/src/shared/components/ContestantCard";
import { LogoutButton } from "@/src/shared/components/LogoutButton";
import { FallbackUI, LoadingSkeleton } from "@/src/shared/components/FallbackUI";
import { getApiUrl, isApiAvailable } from "@/src/config/api";
import { mockContestants } from "@/src/data/mockData";

const VOTE_KEY = "votedContestantId";
const VOTE_TIMESTAMP_KEY = "voteTimestamp";

export default function VotingDashboard() {
  const dispatch = useAppDispatch();
  const contestants = useAppSelector(selectContestants);
  const status = useAppSelector(selectVotingStatus);
  const error = useAppSelector(selectVotingError);
  const votedId = useAppSelector(selectVotedId);
  const { canVoteAgain, hasVoted, formattedTime } = useVoteTimer();
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { manualRetry } = useContestantPollingWithRetry({ 
    interval: 5000,
    maxRetries: 3,
    retryDelay: 2000 
  });

  useEffect(() => {
    const loadUserVote = async () => {
      const currentEmail = localStorage.getItem("email");
      setUserEmail(currentEmail);

      if (!currentEmail) return;

      const storedVote = localStorage.getItem(`vote_${currentEmail}`);
      if (storedVote) {
        try {
          const voteData = JSON.parse(storedVote);
          if (voteData.id && voteData.timestamp) {
            dispatch(setVoteData({ id: voteData.id, timestamp: voteData.timestamp }));
            localStorage.setItem(VOTE_KEY, String(voteData.id));
            localStorage.setItem(VOTE_TIMESTAMP_KEY, String(voteData.timestamp));
            return;
          }
        } catch (error) {
          console.error("Failed to parse stored vote data:", error);
        }
      }

      if (!isApiAvailable()) {
        console.log("Running in static mode - API calls disabled");
        dispatch(setContestants(mockContestants));
        return;
      }

      try {
        const res = await fetch(
          `${getApiUrl('VOTING_USERVOTE')}?email=${encodeURIComponent(currentEmail)}`
        );
        const data = await res.json();

        if (data.hasVoted && data.contestantId && data.timestamp) {
          dispatch(
            setVoteData({ id: data.contestantId, timestamp: data.timestamp })
          );
          localStorage.setItem(VOTE_KEY, String(data.contestantId));
          localStorage.setItem(VOTE_TIMESTAMP_KEY, String(data.timestamp));
          localStorage.setItem(
            `vote_${currentEmail}`,
            JSON.stringify({
              id: data.contestantId,
              timestamp: data.timestamp,
            })
          );
        } else {
          dispatch(setVoteData({ id: null, timestamp: null }));
          localStorage.removeItem(VOTE_KEY);
          localStorage.removeItem(VOTE_TIMESTAMP_KEY);
        }
      } catch (error) {
        console.error("Failed to load vote data:", error);
      }
    };

    loadUserVote();
  }, [dispatch]);

  const handleVote = async (id: number) => {
    const currentEmail = localStorage.getItem("email");
    if (!currentEmail) {
      setVoteError("Please login to vote");
      return;
    }

    if (!isApiAvailable()) {
      const timestamp = Date.now();
      dispatch(setVoteData({ id, timestamp }));
      
      const updatedContestants = contestants.map(c => 
        c.id === id ? { ...c, votes: c.votes + 1 } : c
      );
      dispatch(setContestants(updatedContestants));
      
      localStorage.setItem(
        `vote_${currentEmail}`,
        JSON.stringify({ id, timestamp })
      );
      localStorage.setItem(VOTE_KEY, String(id));
      localStorage.setItem(VOTE_TIMESTAMP_KEY, String(timestamp));
      
      setIsVoting(false);
      return;
    }

    if (!navigator.onLine) {
      setVoteError("No internet connection. Please check your connection and try again.");
      return;
    }

    setIsVoting(true);
    setVoteError(null);

    try {
      const res = await fetch(getApiUrl('VOTING_CONTESTANTS'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email: currentEmail }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to submit vote";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          if (res.status === 429) {
            errorMessage = "Too many requests. Please wait a moment and try again.";
          } else if (res.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }
        setVoteError(errorMessage);
        setIsVoting(false);
        return;
      }

      const contestants = await res.json();
      const timestamp = Date.now();

      dispatch(setVoteData({ id, timestamp }));
      dispatch(setContestants(contestants));

      localStorage.setItem(
        `vote_${currentEmail}`,
        JSON.stringify({ id, timestamp })
      );
      localStorage.setItem(VOTE_KEY, String(id));
      localStorage.setItem(VOTE_TIMESTAMP_KEY, String(timestamp));
      setVoteError(null);
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setVoteError("Network error. Please check your connection and try again.");
      } else {
        setVoteError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsVoting(false);
    }
  };

  if (status === "loading" && contestants.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-400">
        <div className="bg-gradient-to-r from-purple-800 to-fuchsia-700 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">
              Talent Show Live Voting
            </h1>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-400">
        <div className="bg-gradient-to-r from-purple-800 to-fuchsia-700 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">
              Talent Show Live Voting
            </h1>
          </div>
        </div>
        <FallbackUI 
          error={error} 
          onRetry={manualRetry}
        />
      </div>
    );
  }

  const votesRemaining = canVoteAgain ? 1 : 0;
  const totalVotes = 1;

  const votedContestant = contestants.find((c: Contestant) => c.id === votedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-400 flex flex-col">
      <div className="bg-gradient-to-r from-purple-800 to-fuchsia-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">
                Talent Show Live Voting
              </h1>
              <p className="text-purple-100 text-base sm:text-lg font-medium">
                {userEmail
                  ? `Welcome: ${userEmail}`
                  : "Vote for your favorite contestants!"}
              </p>
            </div>

            {hasVoted && votedContestant ? (
              <div className="flex-1 lg:text-center">
                <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 inline-block">
                  <div className="flex flex-col items-start lg:items-center space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-white text-sm font-medium">
                        You cannot vote again for this contest!
                      </span>
                    </div>
                    <span className="font-bold text-xl text-amber-300">
                      You voted for: {votedContestant.name}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              canVoteAgain && (
                <div className="flex-1 lg:text-center">
                  <div className="bg-green-500/20 backdrop-blur rounded-2xl px-6 py-4 inline-block">
                    <div className="flex flex-col items-start lg:items-center space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-lg font-bold">
                          Voting will be closed in
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mt-1">
                          {formattedTime
                            ? formattedTime.formatted
                            : "Calculating..."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            <div className="flex-shrink-0 self-start lg:self-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 uppercase tracking-wide">
                Votes Available
              </p>
              <p className="text-3xl font-bold text-purple-700">
                {votesRemaining}
                <span className="text-lg text-gray-500 font-normal">
                  /{totalVotes}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 uppercase tracking-wide">
                Total Contestants
              </p>
              <p className="text-3xl font-bold text-purple-700">
                {contestants.length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 uppercase tracking-wide">
                Status
              </p>
              <p className="text-lg font-semibold">
                {votesRemaining > 0 ? (
                  <span className="text-green-600 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Ready to Vote
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Vote Submitted
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      {voteError && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-slide-down">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Vote Failed</h3>
                <div className="mt-1 text-sm text-red-700">{voteError}</div>
                <button
                  onClick={() => setVoteError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contestants.map((c: Contestant) => (
            <ContestantCard key={c.id} contestant={c}>
              {hasVoted ? (
                <>
                  {votedId === c.id && (
                    <div className="flex items-center text-green-600 font-bold mb-2">
                      <CheckIcon />
                      <span className="ml-1">Your Vote</span>
                    </div>
                  )}
                  <button
                    className="w-full bg-gray-300 text-gray-600 font-bold py-2 rounded-xl cursor-not-allowed shadow-inner"
                    disabled
                  >
                    Vote
                  </button>
                </>
              ) : (
                <button
                  className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-extrabold py-2 rounded-xl shadow-lg transition-all duration-200 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleVote(c.id)}
                  disabled={isVoting}
                >
                  {isVoting ? "Voting..." : "Vote"}
                </button>
              )}
            </ContestantCard>
          ))}
        </div>
      </div>
    </div>
  );
}