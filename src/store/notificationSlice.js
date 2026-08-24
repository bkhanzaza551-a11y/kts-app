import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../api/others';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params, { rejectWithValue }) => {
  try { const res = await notificationApi.getNotifications(params); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchUnreadCount = createAsyncThunk('notifications/unread', async (_, { rejectWithValue }) => {
  try { const res = await notificationApi.getUnreadCount(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.data?.data || a.payload.data || []; })
      .addCase(fetchNotifications.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchUnreadCount.fulfilled, (s, a) => { s.unreadCount = a.payload.data?.count || 0; });
  },
});

export default notificationSlice.reducer;
