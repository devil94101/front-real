import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../config/api";
import type { Vacancy } from "../../types";
import type { RootState } from "../index";
import { addActivityEntry } from "./activitySlice";
import { seedData } from "../../data/seed";
import { uid } from "../../lib/format";

export interface VacanciesState { items: Vacancy[]; loading: boolean; error: string | null; }
const initialState: VacanciesState = { items: [], loading: false, error: null };
const userName = (s: RootState) => s.auth.user?.name ?? "System";

export const fetchVacancies = createAsyncThunk("vacancies/fetchAll", async (_, { getState, rejectWithValue }) => {
  if ((getState() as RootState).auth.isDemoMode) return seedData.vacancies;
  try { const { data } = await api.get<Vacancy[]>("/vacancies"); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed to fetch"); }
});

export const createVacancy = createAsyncThunk("vacancies/create", async (v: Omit<Vacancy, "id">, { getState, dispatch, rejectWithValue }) => {
  const s = getState() as RootState;
  let result: Vacancy;
  if (s.auth.isDemoMode) { result = { ...v, id: uid("v") } as Vacancy; }
  else { try { const { data } = await api.post<Vacancy>("/vacancies", v); result = data; } catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); } }
  dispatch(addActivityEntry({ type: "vacancy", description: `New vacancy listed: <b>${result.suite}</b>.`, user: userName(s) }));
  return result;
});

export const updateVacancy = createAsyncThunk("vacancies/update", async ({ id, patch }: { id: string; patch: Partial<Vacancy> }, { getState, rejectWithValue }) => {
  const s = getState() as RootState;
  if (s.auth.isDemoMode) { const ex = s.vacancies.items.find((x) => x.id === id); if (!ex) return rejectWithValue("Not found"); return { ...ex, ...patch }; }
  try { const { data } = await api.put<Vacancy>(`/vacancies/${id}`, patch); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); }
});

export const deleteVacancy = createAsyncThunk("vacancies/delete", async (id: string, { getState, rejectWithValue }) => {
  if (!(getState() as RootState).auth.isDemoMode) { try { await api.delete(`/vacancies/${id}`); } catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed"); } }
  return id;
});

const vacanciesSlice = createSlice({
  name: "vacancies",
  initialState,
  reducers: {
    removeVacanciesByProperty(state, action: PayloadAction<string>) { state.items = state.items.filter((v) => v.propertyId !== action.payload); },
    loadSeed(state) { state.items = seedData.vacancies; state.loading = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVacancies.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchVacancies.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchVacancies.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(createVacancy.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateVacancy.fulfilled, (s, a) => { const i = s.items.findIndex((x) => x.id === a.payload.id); if (i >= 0) s.items[i] = a.payload; })
      .addCase(deleteVacancy.fulfilled, (s, a) => { s.items = s.items.filter((x) => x.id !== a.payload); });
  },
});

export const { removeVacanciesByProperty, loadSeed: loadVacanciesSeed } = vacanciesSlice.actions;
export default vacanciesSlice.reducer;
