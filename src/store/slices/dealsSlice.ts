import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../config/api";
import type { Deal, DealStage } from "../../types";
import type { RootState } from "../index";
import { addActivityEntry } from "./activitySlice";
import { seedData } from "../../data/seed";
import { uid } from "../../lib/format";

export interface DealsState { items: Deal[]; loading: boolean; error: string | null; }
const initialState: DealsState = { items: [], loading: false, error: null };
const now = () => new Date().toISOString();
const userName = (s: RootState) => s.auth.user?.name ?? "System";

export const fetchDeals = createAsyncThunk("deals/fetchAll", async (_, { getState, rejectWithValue }) => {
  if ((getState() as RootState).auth.isDemoMode) return seedData.deals;
  try { const { data } = await api.get<Deal[]>("/deals"); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); }
});

export const createDeal = createAsyncThunk("deals/create", async (d: Omit<Deal, "id" | "createdAt" | "updatedAt">, { getState, dispatch, rejectWithValue }) => {
  const s = getState() as RootState;
  let result: Deal;
  if (s.auth.isDemoMode) { result = { ...d, id: uid("d"), createdAt: now(), updatedAt: now() } as Deal; }
  else { try { const { data } = await api.post<Deal>("/deals", d); result = data; } catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); } }
  dispatch(addActivityEntry({ type: "deal", description: `Created deal <b>${result.title}</b>.`, user: userName(s) }));
  return result;
});

export const updateDeal = createAsyncThunk("deals/update", async ({ id, patch }: { id: string; patch: Partial<Deal> }, { getState, rejectWithValue }) => {
  const s = getState() as RootState;
  if (s.auth.isDemoMode) { const ex = s.deals.items.find((x) => x.id === id); if (!ex) return rejectWithValue("Not found"); return { ...ex, ...patch, updatedAt: now() }; }
  try { const { data } = await api.put<Deal>(`/deals/${id}`, patch); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); }
});

export const deleteDeal = createAsyncThunk("deals/delete", async (id: string, { getState, rejectWithValue }) => {
  if (!(getState() as RootState).auth.isDemoMode) { try { await api.delete(`/deals/${id}`); } catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); } }
  return id;
});

export const moveDealStage = createAsyncThunk("deals/moveStage", async ({ id, stage }: { id: string; stage: DealStage }, { getState, dispatch, rejectWithValue }) => {
  const s = getState() as RootState;
  if (!s.auth.isDemoMode) { try { await api.patch(`/deals/${id}/stage`, { stage }); } catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); } }
  dispatch(addActivityEntry({ type: "deal", description: `Moved a deal to <b>${stage}</b>.`, user: userName(s) }));
  return { id, stage };
});

const dealsSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {
    unlinkDealsFromProperty(state, action: PayloadAction<string>) { state.items.forEach((d) => { if (d.propertyId === action.payload) d.propertyId = null; }); },
    loadSeed(state) { state.items = seedData.deals; state.loading = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchDeals.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchDeals.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(createDeal.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateDeal.fulfilled, (s, a) => { const i = s.items.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.items[i] = a.payload; })
      .addCase(deleteDeal.fulfilled, (s, a) => { s.items = s.items.filter((x) => x.id !== a.payload); })
      .addCase(moveDealStage.fulfilled, (s, a) => {
        const d = s.items.find((x) => x.id === a.payload.id);
        if (d) { d.stage = a.payload.stage; d.updatedAt = new Date().toISOString(); }
      });
  },
});

export const { unlinkDealsFromProperty, loadSeed: loadDealsSeed } = dealsSlice.actions;
export default dealsSlice.reducer;
