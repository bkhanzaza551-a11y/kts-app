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

export const markNotificationAsRead = createAsyncThunk('notifications/markRead', async (id, { dispatch, rejectWithValue }) => {
  try {
    dispatch(markItemReadLocally(id));
    const res = await notificationApi.markAsRead(id);
    dispatch(fetchUnreadCount());
    return res.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const markAllNotificationsAsRead = createAsyncThunk('notifications/markAllRead', async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(markAllReadLocally());
    const res = await notificationApi.markAllAsRead();
    dispatch(fetchUnreadCount());
    return res.data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, isLoading: false, error: null },
  reducers: {
    markItemReadLocally: (state, action) => {
      const id = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item && !item.is_read) {
        item.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadLocally: (state) => {
      state.items.forEach(i => { i.is_read = true; });
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.isLoading = false;
        const newItems = a.payload.data?.data || a.payload.data || [];
        s.items = newItems;
        s.unreadCount = newItems.filter(i => !i.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(fetchUnreadCount.fulfilled, (s, a) => { s.unreadCount = a.payload.data?.count ?? 0; })
      .addCase(fetchUnreadCount.rejected, (s, a) => { s.error = a.payload; });
  },
});

export const { markItemReadLocally, markAllReadLocally } = notificationSlice.actions;

export default notificationSlice.reducer;
