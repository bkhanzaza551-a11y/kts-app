import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { botApi } from '../api/bots';

export const fetchBot = createAsyncThunk('bots/fetch', async (_, { rejectWithValue }) => {
  try { const res = await botApi.getBot(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchBotTrades = createAsyncThunk('bots/trades', async (params, { rejectWithValue }) => {
  try { const res = await botApi.getBotTrades(params); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const toggleAutoTrade = createAsyncThunk('bots/toggleAuto', async (_, { rejectWithValue }) => {
  try { const res = await botApi.toggleAutoTrade(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const updateBot = createAsyncThunk('bots/update', async (data, { rejectWithValue }) => {
  try { const res = await botApi.updateBot(data); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

const botSlice = createSlice({
  name: 'bots',
  initialState: { bot: null, trades: [], isLoading: false, error: null },
  reducers: {
    clearBot: (s) => { s.bot = null; s.trades = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBot.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchBot.fulfilled, (s, a) => { s.isLoading = false; s.bot = a.payload.data; })
      .addCase(fetchBot.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchBotTrades.fulfilled, (s, a) => { s.trades = a.payload.data?.data || a.payload.data || []; })
      .addCase(toggleAutoTrade.fulfilled, (s, a) => {
        if (s.bot) s.bot.auto_trade = a.payload.data.auto_trade;
      })
      .addCase(updateBot.fulfilled, (s, a) => {
        if (a.payload.data) s.bot = a.payload.data;
      });
  },
});

export const { clearBot } = botSlice.actions;
export default botSlice.reducer;
