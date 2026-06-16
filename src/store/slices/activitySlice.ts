import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../config/api";
import type { ActivityLog, ActivityType } from "../../types";
import type { RootState } from "../index";
import { seedData } from "../../data/seed";
import { uid } from "../../lib/format";

export interface ActivityState { items: ActivityLog[]; loading: boolean; }
const initialState: ActivityState = { items: [], loading: false };

export const fetchActivity = createAsyncThunk("activity/fetchAll", async (_, { getState, rejectWithValue }) => {
  if ((getState() as RootState).auth.isDemoMode) return seedData.activity;
  try { const { data } = await api.get<ActivityLog[]>("/activity"); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); }
});

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    addActivityEntry(state, action: PayloadAction<{ type: ActivityType; description: string; user: string }>) {
      state.items.unshift({
        id: uid("a"),
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
      if (state.items.length > 100) state.items = state.items.slice(0, 100);
    },
    loadSeed(state) { state.items = seedData.activity; state.loading = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivity.pending, (s) => { s.loading = true; })
      .addCase(fetchActivity.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchActivity.rejected, (s) => { s.loading = false; });
  },
});

export const { addActivityEntry, loadSeed: loadActivitySeed } = activitySlice.actions;
export default activitySlice.reducer;
