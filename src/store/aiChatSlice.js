import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiChatApi } from '../api/aiChat';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MESSAGES_KEY = '@kts_ai_chat_messages';

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

export const loadChatHistory = createAsyncThunk('aiChat/loadHistory', async (_, { rejectWithValue }) => {
  try {
    const stored = await AsyncStorage.getItem(MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    return [];
  }
});

export const fetchChatStatus = createAsyncThunk('aiChat/status', async (_, { rejectWithValue }) => {
  try {
    const res = await aiChatApi.status();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const saveMessages = async (messages) => {
  try {
    const toSave = messages.slice(-50);
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(toSave));
  } catch (e) {}
};

export const clearChatMessages = createAsyncThunk('aiChat/clearMessages', async (_, { dispatch }) => {
  try {
    await AsyncStorage.removeItem(MESSAGES_KEY);
  } catch (e) {}
  dispatch({ type: 'aiChat/clearMessagesLocal' });
});

export const reportMessage = createAsyncThunk('aiChat/reportMessage', async ({ messageId, reason }, { rejectWithValue }) => {
  try {
    const res = await aiChatApi.report(messageId, reason);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to report message');
  }
});

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState: {
    messages: [],
    status: null,
    loading: false,
    error: null,
    needs_human_support: false,
  },
  reducers: {
    clearMessagesLocal: (state) => { state.messages = []; },
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: action.payload, timestamp: new Date().toISOString() });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadChatHistory.fulfilled, (state, action) => { state.messages = action.payload || []; })
      .addCase(sendMessage.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          if (action.payload.user_message) {
            state.messages.push({ role: 'user', content: action.payload.user_message, timestamp: action.payload.timestamp });
          }
          if (action.payload.response) {
            state.messages.push({
              role: 'assistant',
              content: action.payload.response,
              timestamp: action.payload.timestamp,
              model: action.payload.model,
              needs_human_support: action.payload.needs_human_support || false,
            });
          }
          state.needs_human_support = action.payload.needs_human_support || false;
          saveMessages(state.messages);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchChatStatus.fulfilled, (state, action) => { state.status = action.payload; })
      .addCase(reportMessage.fulfilled, (state) => { state.reportSuccess = true; })
      .addCase(reportMessage.rejected, (state) => { state.reportSuccess = false; });
  },
});

export const { clearMessagesLocal, addUserMessage } = aiChatSlice.actions;
export default aiChatSlice.reducer;
