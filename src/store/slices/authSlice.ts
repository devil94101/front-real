import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api, {
  clearAuth,
  persistAuth,
  persistDemoMode,
  TOKEN_KEY,
  DEMO_KEY,
  USER_KEY,
} from "../../config/api";
import type { AuthUser, LoginCredentials, RegisterPayload } from "../../types";

// ── State ────────────────────────────────────────────────
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isDemoMode: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  activeUserId: string | null; // for demo-mode user switching
}

function loadInitial(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);
  const isDemoMode = localStorage.getItem(DEMO_KEY) === "true";
  let user: AuthUser | null = null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) user = JSON.parse(raw);
  } catch { /* ignore */ }

  return {
    user,
    token,
    isDemoMode,
    isAuthenticated: isDemoMode || !!token,
    loading: !isDemoMode && !!token, // need to validate the token
    error: null,
    activeUserId: null,
  };
}

// ── Thunks ───────────────────────────────────────────────
export const login = createAsyncThunk(
  "auth/login",
  async (creds: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ token: string; refreshToken: string; user: AuthUser }>(
        "/auth/login",
        creds
      );
      persistAuth(data.token, data.refreshToken, data.user);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Login failed"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ token: string; refreshToken: string; user: AuthUser }>(
        "/auth/register",
        payload
      );
      persistAuth(data.token, data.refreshToken, data.user);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Registration failed"
      );
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<AuthUser>("/auth/me");
      return data;
    } catch (err: any) {
      clearAuth();
      return rejectWithValue("Session expired");
    }
  }
);

// ── Slice ────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: loadInitial(),
  reducers: {
    logout(state) {
      clearAuth();
      state.user = null;
      state.token = null;
      state.isDemoMode = false;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.activeUserId = null;
    },
    loginDemo(state) {
      persistDemoMode();
      state.isDemoMode = true;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.user = {
        id: "t1",
        name: "Jordan Avery",
        email: "jordan@stackline.co",
        role: "Principal Broker",
        color: "#2563eb",
      };
    },
    setActiveUserId(state, action: PayloadAction<string>) {
      state.activeUserId = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isDemoMode = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isDemoMode = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // loadUser (validate session)
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, loginDemo, setActiveUserId, clearError } = authSlice.actions;
export default authSlice.reducer;
