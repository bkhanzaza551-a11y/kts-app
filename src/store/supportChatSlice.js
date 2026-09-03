import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supportChatApi } from '../api/supportChat';

export const createSupportTicket = createAsyncThunk(
  'supportChat/createTicket',
  async (_, { rejectWithValue }) => {
    try {
      const res = await supportChatApi.createTicket(
        'AI Chatbot Support Request',
        'User was redirected from AI chatbot. Needs human support.',
        'ai_chatbot'
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create support ticket');
    }
  }
);

export const loadSupportTickets = createAsyncThunk(
  'supportChat/loadTickets',
  async (_, { rejectWithValue }) => {
    try {
      const res = await supportChatApi.getTickets();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load tickets');
    }
  }
);

export const loadSupportMessages = createAsyncThunk(
  'supportChat/loadMessages',
  async (ticketId, { rejectWithValue }) => {
    try {
      const res = await supportChatApi.getTicket(ticketId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load messages');
    }
  }
);

export const sendSupportMessage = createAsyncThunk(
  'supportChat/sendMessage',
  async ({ ticketId, message, attachment }, { rejectWithValue }) => {
    try {
      const res = await supportChatApi.sendReply(ticketId, message, attachment);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send message');
    }
  }
);

const supportChatSlice = createSlice({
  name: 'supportChat',
  initialState: {
    tickets: [],
    currentTicket: null,
    messages: [],
    loading: false,
    sending: false,
    error: null,
    ticketId: null,
  },
  reducers: {
    clearSupportChat: (state) => {
      state.currentTicket = null;
      state.messages = [];
      state.ticketId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSupportTicket.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createSupportTicket.fulfilled, (s, a) => {
        s.loading = false;
        s.currentTicket = a.payload;
        s.ticketId = a.payload.id;
        s.messages = [
          {
            id: 'auto-msg',
            message: 'Our team will contact you as soon as possible. Please describe your issue below.',
            sender: 'support',
            created_at: new Date().toISOString(),
          },
        ];
      })
      .addCase(createSupportTicket.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(loadSupportTickets.pending, (s) => { s.loading = true; })
      .addCase(loadSupportTickets.fulfilled, (s, a) => { s.loading = false; s.tickets = a.payload; })
      .addCase(loadSupportTickets.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(loadSupportMessages.pending, (s) => { s.loading = true; })
      .addCase(loadSupportMessages.fulfilled, (s, a) => {
        s.loading = false;
        s.currentTicket = a.payload.ticket;
        s.messages = a.payload.replies || [];
      })
      .addCase(loadSupportMessages.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(sendSupportMessage.pending, (s) => { s.sending = true; })
      .addCase(sendSupportMessage.fulfilled, (s, a) => {
        s.sending = false;
        if (a.payload) {
          s.messages.push(a.payload);
        }
      })
      .addCase(sendSupportMessage.rejected, (s, a) => { s.sending = false; s.error = a.payload; });
  },
});

export const { clearSupportChat } = supportChatSlice.actions;
export default supportChatSlice.reducer;
