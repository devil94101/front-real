import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../config/api";
import type { TeamMember } from "../../types";
import type { RootState } from "../index";
import { seedData } from "../../data/seed";
import { uid } from "../../lib/format";

export interface TeamState { members: TeamMember[]; loading: boolean; error: string | null; }
const initialState: TeamState = { members: [], loading: false, error: null };

export const fetchTeam = createAsyncThunk("team/fetchAll", async (_, { getState, rejectWithValue }) => {
  if ((getState() as RootState).auth.isDemoMode) return seedData.team;
  try { const { data } = await api.get<TeamMember[]>("/team"); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); }
});

export const addMember = createAsyncThunk("team/add", async (m: Omit<TeamMember, "id">, { getState, rejectWithValue }) => {
  const s = getState() as RootState;
  if (s.auth.isDemoMode) return { ...m, id: uid("t") };
  try { const { data } = await api.post<TeamMember>("/team", m); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); }
});

export const removeMember = createAsyncThunk("team/remove", async (id: string, { getState, rejectWithValue }) => {
  if (!(getState() as RootState).auth.isDemoMode) { try { await api.delete(`/team/${id}`); } catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); } }
  return id;
});

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    loadSeed(state) { state.members = seedData.team; state.loading = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeam.fulfilled, (s, a) => { s.loading = false; s.members = a.payload; })
      .addCase(fetchTeam.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(addMember.fulfilled, (s, a) => { s.members.push(a.payload); })
      .addCase(removeMember.fulfilled, (s, a) => { s.members = s.members.filter((m) => m.id !== a.payload); });
  },
});

export const { loadSeed: loadTeamSeed } = teamSlice.actions;
export default teamSlice.reducer;
