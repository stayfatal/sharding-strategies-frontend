import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type StrategyFilterState = {
  titleQuery: string;
};

const initialState: StrategyFilterState = {
  titleQuery: "",
};

const strategyFilterSlice = createSlice({
  name: "strategyFilter",
  initialState,
  reducers: {
    setStrategyTitleQuery(state, action: PayloadAction<string>) {
      state.titleQuery = action.payload;
    },
  },
});

export const { setStrategyTitleQuery } = strategyFilterSlice.actions;
export default strategyFilterSlice.reducer;
