import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/src/store/store';
import { getApiUrl, isApiAvailable } from '@/src/config/api';
import { mockContestants } from '@/src/data/mockData';

export interface Contestant {
  id: number;
  name: string;
  image?: string;
  votes: number;
  type: string;
}

interface VotingState {
  contestants: Contestant[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  votedId: number | null;
  voteTimestamp: number | null;
}

const initialState: VotingState = {
  contestants: [],
  status: 'idle',
  error: null,
  votedId: null,
  voteTimestamp: null,
};

export const fetchContestants = createAsyncThunk(
  'voting/fetchContestants',
  async () => {
    if (!isApiAvailable()) {
      return mockContestants as Contestant[];
    }
    
    const res = await fetch(getApiUrl('VOTING_CONTESTANTS'));
    if (!res.ok) throw new Error('Failed to fetch contestants');
    return (await res.json()) as Contestant[];
  }
);

export const submitVote = createAsyncThunk(
  'voting/submitVote',
  async (id: number) => {
    const res = await fetch(getApiUrl('VOTING_CONTESTANTS'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to submit vote');
    return (await res.json()) as Contestant[];
  }
);

const contestantSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    setVotedId(state, action: PayloadAction<number | null>) {
      state.votedId = action.payload;
    },
    setVoteData(state, action: PayloadAction<{ id: number | null; timestamp: number | null }>) {
      state.votedId = action.payload.id;
      state.voteTimestamp = action.payload.timestamp;
    },
    setContestants(state, action: PayloadAction<Contestant[]>) {
      state.contestants = action.payload;
    },
    resetVotingState(state) {
      state.votedId = null;
      state.voteTimestamp = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContestants.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchContestants.fulfilled, (state, action) => {
        state.status = 'idle';
        state.contestants = action.payload;
      })
      .addCase(fetchContestants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch contestants';
      })
      .addCase(submitVote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitVote.fulfilled, (state, action) => {
        state.status = 'idle';
        state.contestants = action.payload;
      })
      .addCase(submitVote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to submit vote';
      });
  },
});

export const { setVotedId, setContestants, resetVotingState, setVoteData } = contestantSlice.actions;

export const selectContestants = (state: RootState) => state.voting.contestants;
export const selectVotingStatus = (state: RootState) => state.voting.status;
export const selectVotingError = (state: RootState) => state.voting.error;
export const selectVotedId = (state: RootState) => state.voting.votedId;
export const selectVoteTimestamp = (state: RootState) => state.voting.voteTimestamp;

export default contestantSlice.reducer;