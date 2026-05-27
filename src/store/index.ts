import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import systemLoadApplicationReducer from "./slices/systemLoadApplicationSlice";
import strategyFilterReducer from "./slices/strategyFilterSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    systemLoadApplication: systemLoadApplicationReducer,
    strategyFilter: strategyFilterReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
