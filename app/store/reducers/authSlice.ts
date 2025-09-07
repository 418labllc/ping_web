import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Define a type for the slice state
interface AuthState {
  loaded: Boolean;
  currentUser: any | null | any;
}

// Define the initial state using that type
const initialState: AuthState = {
  loaded: false,
  currentUser: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userStateChange: (state, action: PayloadAction<AuthState>) => {
      state.loaded = action.payload.loaded;
      state.currentUser = action.payload.currentUser;
    },
  },
});

export const { userStateChange } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;

export default authSlice.reducer;
