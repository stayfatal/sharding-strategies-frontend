import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { parseIsModeratorFromToken } from "../utils/jwt";

export interface UserState {
  username: string;
  isAuthenticated: boolean;
  isModerator: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  username: "",
  isAuthenticated: false,
  isModerator: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    authStarted: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSucceeded: (state, action: PayloadAction<{ login: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.username = action.payload.login;
      const token = localStorage.getItem("token") ?? "";
      state.isModerator = parseIsModeratorFromToken(token);
    },
    authFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    clearSession: () => ({ ...initialState }),
  },
});

export const { authStarted, authSucceeded, authFailed, clearUserError, clearSession } =
  userSlice.actions;
export default userSlice.reducer;
