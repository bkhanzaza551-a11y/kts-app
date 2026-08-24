import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../api/payments';

export const fetchPlans = createAsyncThunk('payments/plans', async (_, { rejectWithValue }) => {
  try { const res = await paymentApi.getPlans(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchHistory = createAsyncThunk('payments/history', async (params, { rejectWithValue }) => {
  try { const res = await paymentApi.getHistory(params); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchSubscription = createAsyncThunk('payments/subscription', async (_, { rejectWithValue }) => {
  try { const res = await paymentApi.getSubscription(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { plans: [], transactions: [], subscription: null, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (s) => { s.isLoading = true; })
      .addCase(fetchPlans.fulfilled, (s, a) => { s.isLoading = false; s.plans = a.payload.data; })
      .addCase(fetchPlans.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchHistory.fulfilled, (s, a) => { s.transactions = a.payload.data; })
      .addCase(fetchSubscription.fulfilled, (s, a) => { s.subscription = a.payload.data; });
  },
});

export default paymentSlice.reducer;
