import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.login(data);
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (googleData, { rejectWithValue }) => {
  try {
    const res = await authApi.googleAuth(googleData);
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.register(data);
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.verifyOtp(data);
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const verifyEmailOtp = createAsyncThunk('auth/verifyEmailOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.verifyEmailOtp(data);
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const resendEmailOtp = createAsyncThunk('auth/resendEmailOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.resendEmailOtp(data);
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const verifySecurityCode = createAsyncThunk('auth/verifySecurityCode', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.verifySecurityCode(data);
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const loadProfile = createAsyncThunk('auth/loadProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getProfile();
    return res.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authApi.logout(); } catch (e) { /* ignore */ }
  await storage.clearAll();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoggedIn: false,
    isOnboarded: false,
    isLoading: false,
    isOtpPending: false,
    isEmailVerificationPending: false,
    isSecurityCodePending: false,
    pendingEmail: null,
    error: null,
  },
  reducers: {
    setOnboarded: (state) => { state.isOnboarded = true; },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isLoggedIn = true;
    },
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; },
    clearEmailVerification: (state) => { state.isEmailVerificationPending = false; state.pendingEmail = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.isLoading = false;
        const d = a.payload.data || a.payload;
        const { token, user, requires_otp, requires_security_code } = d;
        if (requires_otp) { s.isOtpPending = true; s.user = d.user; }
        else if (requires_security_code) { s.isSecurityCodePending = true; s.user = d.user; }
        else if (token) { s.token = token; s.user = user; s.isLoggedIn = true; storage.setToken(token); storage.setUser(user); }
      })
      .addCase(login.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(googleLogin.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(googleLogin.fulfilled, (s, a) => {
        s.isLoading = false;
        const d = a.payload.data || a.payload;
        if (d.token) {
          s.token = d.token; s.user = d.user; s.isLoggedIn = true;
          storage.setToken(d.token); storage.setUser(d.user);
        }
      })
      .addCase(googleLogin.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(register.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => {
        s.isLoading = false;
        const d = a.payload.data || a.payload;
        if (d.requires_email_verification) {
          s.isEmailVerificationPending = true;
          s.pendingEmail = d.email;
          s.user = d.user;
        } else if (d.token) {
          s.token = d.token; s.user = d.user; s.isLoggedIn = true;
          storage.setToken(d.token); storage.setUser(d.user);
        }
      })
      .addCase(register.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(verifyOtp.pending, (s) => { s.isLoading = true; })
      .addCase(verifyOtp.fulfilled, (s, a) => {
        s.isLoading = false;
        const d = a.payload.data || a.payload;
        if (d.requires_security_code) { s.isSecurityCodePending = true; s.isOtpPending = false; }
        else if (d.token) { s.token = d.token; s.user = d.user; s.isLoggedIn = true; s.isOtpPending = false; storage.setToken(d.token); storage.setUser(d.user); }
      })
      .addCase(verifyOtp.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(verifyEmailOtp.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(verifyEmailOtp.fulfilled, (s, a) => {
        s.isLoading = false;
        const d = a.payload.data || a.payload;
        if (d.token) {
          s.token = d.token; s.user = d.user; s.isLoggedIn = true;
          s.isEmailVerificationPending = false; s.pendingEmail = null;
          storage.setToken(d.token); storage.setUser(d.user);
        }
      })
      .addCase(verifyEmailOtp.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(resendEmailOtp.pending, (s) => { s.isLoading = true; })
      .addCase(resendEmailOtp.fulfilled, (s) => { s.isLoading = false; })
      .addCase(resendEmailOtp.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(verifySecurityCode.pending, (s) => { s.isLoading = true; })
      .addCase(verifySecurityCode.fulfilled, (s, a) => {
        s.isLoading = false;
        const d = a.payload.data || a.payload;
        s.token = d.token; s.user = d.user; s.isLoggedIn = true;
        s.isSecurityCodePending = false; s.isOtpPending = false;
        storage.setToken(d.token); storage.setUser(d.user);
      })
      .addCase(verifySecurityCode.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })

      .addCase(loadProfile.fulfilled, (s, a) => { const u = a.payload.data?.user || a.payload.user; s.user = u; storage.setUser(u); })
      .addCase(logout.fulfilled, (s) => {
        s.user = null; s.token = null; s.isLoggedIn = false;
        s.isOtpPending = false; s.isEmailVerificationPending = false;
        s.isSecurityCodePending = false; s.pendingEmail = null;
      });
  },
});

export const { setOnboarded, setToken, clearError, setUser, clearEmailVerification } = authSlice.actions;
export default authSlice.reducer;
