import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../api/chat';

export const fetchRooms = createAsyncThunk('chat/rooms', async (_, { rejectWithValue }) => {
  try { const res = await chatApi.getRooms(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchMessages = createAsyncThunk('chat/messages', async ({ roomSlug, page }, { rejectWithValue }) => {
  try { const res = await chatApi.getMessages(roomSlug, { page }); return { roomSlug, data: res.data }; }
  catch (e) { return rejectWithValue(e.message); }
});

export const sendMessage = createAsyncThunk('chat/send', async ({ roomSlug, data }, { rejectWithValue }) => {
  try { const res = await chatApi.sendMessage(roomSlug, data); return { roomSlug, message: res.data }; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchStickers = createAsyncThunk('chat/stickers', async (_, { rejectWithValue }) => {
  try { const res = await chatApi.getAllStickers(); return res.data; }
  catch (e) { return rejectWithValue(e.message); }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    messages: {},
    stickers: [],
    isLoadingRooms: false,
    isLoadingMessages: false,
    error: null,
  },
  reducers: {
    addMessage: (s, a) => {
      const { roomSlug, message } = a.payload;
      if (s.messages[roomSlug]) s.messages[roomSlug].push(message);
    },
    clearMessages: (s, a) => { s.messages[a.payload] = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (s) => { s.isLoadingRooms = true; })
      .addCase(fetchRooms.fulfilled, (s, a) => { s.isLoadingRooms = false; s.rooms = a.payload.data; })
      .addCase(fetchRooms.rejected, (s, a) => { s.isLoadingRooms = false; s.error = a.payload; })
      .addCase(fetchMessages.pending, (s) => { s.isLoadingMessages = true; })
      .addCase(fetchMessages.fulfilled, (s, a) => {
        s.isLoadingMessages = false;
        const { roomSlug, data } = a.payload;
        s.messages[roomSlug] = data.data?.data || data.data || [];
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        const { roomSlug, message } = a.payload;
        if (s.messages[roomSlug]) s.messages[roomSlug].push(message.data);
      })
      .addCase(fetchStickers.fulfilled, (s, a) => { s.stickers = a.payload.data; });
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
