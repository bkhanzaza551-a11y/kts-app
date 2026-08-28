import { createSlice } from '@reduxjs/toolkit';

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: {
    hapticEnabled: true,
  },
  reducers: {
    toggleHaptic: (state) => {
      state.hapticEnabled = !state.hapticEnabled;
    },
    setHaptic: (state, action) => {
      state.hapticEnabled = action.payload;
    }
  },
});

export const { toggleHaptic, setHaptic } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
