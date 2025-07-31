import { configureStore } from '@reduxjs/toolkit';
import votingReducer from '@/src/features/voting/store/votingSlice';

export const store = configureStore({
  reducer: {
    voting: votingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;