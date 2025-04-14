import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPetugas: [],
};

const petugasSlice = createSlice({
  name: "petugas",
  initialState,
  reducers: {
    setPetugas: (state, action) => {
      state.selectedPetugas = action.payload;
    },
    clearPetugas: (state) => {
      state.selectedPetugas = [];
    },
  },
});

export const { setPetugas, clearPetugas } = petugasSlice.actions;
export default petugasSlice.reducer;
