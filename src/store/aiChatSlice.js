import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiChatApi } from '../api/aiChat';

export const sendMessage = createAsyncThunk(
  'aiChat/sendMessage',
  async ({ message }, { getState, rejectWithValue }) => {
    try {
      const { messages } = getState().aiChat;
      const history = messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await aiChatApi.send(message, history);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send message');
    }
  }
);

export const fetchChatStatus = createAsyncThunk('aiChat/status', async (_, { rejectWithValue }) => {
  try {
    const res = await aiChatApi.status();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState: {
    messages: [],
    status: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearMessages: (state) => { state.messages = []; },
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: action.payload, timestamp: new Date().toISOString() });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          if (action.payload.user_message) {
            state.messages.push({ role: 'user', content: action.payload.user_message, timestamp: action.payload.timestamp });
          }
          if (action.payload.response) {
            state.messages.push({ role: 'assistant', content: action.payload.response, timestamp: action.payload.timestamp, model: action.payload.model });
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchChatStatus.fulfilled, (state, action) => { state.status = action.payload; });
  },
});

export const { clearMessages, addUserMessage } = aiChatSlice.actions;
export default aiChatSlice.reducer;
