import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { botApi } from '../api/bots';

export const fetchBots = createAsyncThunk('bots/fetch', async (_, { rejectWithValue }) => {
  try { const res = await botApi.getBots(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchBotDetail = createAsyncThunk('bots/detail', async (id, { rejectWithValue }) => {
  try { const res = await botApi.getBotDetail(id); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchBotTrades = createAsyncThunk('bots/trades', async ({ id, params }, { rejectWithValue }) => {
  try { const res = await botApi.getBotTrades(id, params); return { id, data: res.data }; }
  catch (e) { return rejectWithValue(e.message); }
});

export const toggleAutoTrade = createAsyncThunk('bots/toggleAuto', async (id, { rejectWithValue }) => {
  try { const res = await botApi.toggleAutoTrade(id); return { id, data: res.data }; }
  catch (e) { return rejectWithValue(e.message); }
});

const botSlice = createSlice({
  name: 'bots',
  initialState: { bots: [], currentBot: null, trades: {}, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBots.pending, (s) => { s.isLoading = true; })
      .addCase(fetchBots.fulfilled, (s, a) => { s.isLoading = false; s.bots = a.payload.data; })
      .addCase(fetchBots.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchBotDetail.fulfilled, (s, a) => { s.currentBot = a.payload.data; })
      .addCase(fetchBotTrades.fulfilled, (s, a) => { s.trades[a.payload.id] = a.payload.data; })
      .addCase(toggleAutoTrade.fulfilled, (s, a) => {
        const idx = s.bots.findIndex(b => b.id === a.payload.id);
        if (idx >= 0) s.bots[idx].auto_trade = a.payload.data.auto_trade;
      });
  },
});

export default botSlice.reducer;
