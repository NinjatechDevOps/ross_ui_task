"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  selectContestants,
  selectVotingStatus,
  selectVotingError,
  setContestants,
  fetchContestants,
} from "@/src/features/voting/store/votingSlice";
import { useContestantPolling } from "@/src/features/voting/hooks/useContestantPolling";
import { ContestantCard } from "@/src/shared/components/ContestantCard";
import { LogoutButton } from "@/src/shared/components/LogoutButton";
import { LoadingError } from "@/src/shared/components/LoadingError";
import type { Contestant } from "@/src/features/voting/store/votingSlice";

interface SimpleContestantCardProps {
  contestant: Contestant;
  isHighlighted: boolean;
}

function SimpleContestantCard({ contestant, isHighlighted }: SimpleContestantCardProps) {
  return (
    <div className={`transition-all duration-300 ${isHighlighted ? 'scale-105 ring-4 ring-green-400 ring-opacity-75 rounded-3xl' : ''}`}>
      <ContestantCard contestant={contestant}>
        <div className={`text-lg font-bold transition-colors duration-300 ${isHighlighted ? 'text-green-600' : 'text-fuchsia-700'}`}>
          Vote Count:{" "}
          <span className={`text-3xl transition-colors duration-300 ${isHighlighted ? 'text-green-600' : 'text-purple-900'}`}>
            {contestant.votes}
          </span>
        </div>
      </ContestantCard>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const contestants = useAppSelector(selectContestants);
  const status = useAppSelector(selectVotingStatus);
  const error = useAppSelector(selectVotingError);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());

  useContestantPolling(0);

  useEffect(() => {
    dispatch(fetchContestants());
  }, [dispatch]);


  useEffect(() => {
    if (!isSimulationActive || contestants.length === 0) return;
    
    const interval = setInterval(() => {
      const numVotes = Math.floor(Math.random() * 3) + 1;
      const updatedContestants = [...contestants];
      const newHighlightedIds = new Set<number>();
      
      for (let i = 0; i < numVotes; i++) {
        const randomIndex = Math.floor(Math.random() * updatedContestants.length);
        const contestant = updatedContestants[randomIndex];
        updatedContestants[randomIndex] = {
          ...contestant,
          votes: contestant.votes + 1
        };
        newHighlightedIds.add(contestant.id);
      }
      
      dispatch(setContestants(updatedContestants));
      
      setHighlightedIds(newHighlightedIds);
      
      setTimeout(() => {
        setHighlightedIds(new Set());
      }, 1000);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [contestants, dispatch, isSimulationActive]);

  useEffect(() => {
    if (contestants.length > 0) {
      setIsSimulationActive(true);
    }
  }, [contestants.length]);

  const loadingError = LoadingError({
    status,
    error,
    contestantsLength: contestants.length,
    loadingText: "Loading results...",
  });

  if (loadingError) return loadingError;

  const totalVotes = contestants.reduce((sum: number, c: Contestant) => sum + c.votes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-400 flex flex-col">
      <div className="bg-gradient-to-r from-purple-800 to-fuchsia-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
                Live Results Dashboard
                <span className="ml-3 text-lg bg-green-500 px-3 py-1 rounded-full animate-pulse">
                  LIVE
                </span>
              </h1>
              <p className="text-purple-100 text-lg">
                Monitor real-time voting activity
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white/90 rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 text-sm uppercase">
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-purple-700">
                    {contestants.length}
                  </p>
                  <p className="text-sm text-gray-600">Contestants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">
                    {totalVotes}
                  </p>
                  <p className="text-sm text-gray-600">Total Votes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contestants.map((c: Contestant) => (
                <SimpleContestantCard
                  key={c.id}
                  contestant={c}
                  isHighlighted={highlightedIds.has(c.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
