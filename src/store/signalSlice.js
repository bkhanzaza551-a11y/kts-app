import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signalApi } from '../api/signals';

export const fetchSignals = createAsyncThunk('signals/fetch', async (params, { rejectWithValue }) => {
  try { const res = await signalApi.getSignals(params); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchLatest = createAsyncThunk('signals/latest', async (_, { rejectWithValue }) => {
  try { const res = await signalApi.getLatest(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchCategories = createAsyncThunk('signals/categories', async (_, { rejectWithValue }) => {
  try { const res = await signalApi.getCategories(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

const signalSlice = createSlice({
  name: 'signals',
  initialState: { items: [], latest: [], categories: [], isLoading: false, page: 1, lastPage: 1, error: null },
  reducers: { clearSignals: (s) => { s.items = []; s.page = 1; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSignals.pending, (s) => { s.isLoading = true; })
      .addCase(fetchSignals.fulfilled, (s, a) => {
        s.isLoading = false;
        const data = a.payload.data;
        if (s.page === 1) s.items = data.data;
        else s.items = [...s.items, ...data.data];
        s.lastPage = data.last_page;
        s.page = data.current_page + 1;
      })
      .addCase(fetchSignals.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchLatest.fulfilled, (s, a) => { s.latest = a.payload.data; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload.data; });
  },
});

export const { clearSignals } = signalSlice.actions;
export default signalSlice.reducer;
