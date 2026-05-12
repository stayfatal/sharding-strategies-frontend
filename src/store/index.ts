import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import systemLoadApplicationReducer from "./slices/systemLoadApplicationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    systemLoadApplication: systemLoadApplicationReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
