import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../config/api";
import type { Contact } from "../../types";
import type { RootState } from "../index";
import { addActivityEntry } from "./activitySlice";
import { seedData } from "../../data/seed";
import { uid } from "../../lib/format";

export interface ContactsState {
  items: Contact[];
  loading: boolean;
  error: string | null;
}
const initialState: ContactsState = { items: [], loading: false, error: null };

const now = () => new Date().toISOString();
const userName = (s: RootState) => s.auth.user?.name ?? "System";

export const fetchContacts = createAsyncThunk("contacts/fetchAll", async (_, { getState, rejectWithValue }) => {
  const { auth } = getState() as RootState;
  if (auth.isDemoMode) return seedData.contacts;
  try { const { data } = await api.get<Contact[]>("/contacts"); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed to fetch contacts"); }
});

export const createContact = createAsyncThunk("contacts/create", async (c: Omit<Contact, "id" | "dateAdded">, { getState, dispatch, rejectWithValue }) => {
  const state = getState() as RootState;
  let result: Contact;
  if (state.auth.isDemoMode) {
    result = { ...c, id: uid("c"), dateAdded: now() } as Contact;
  } else {
    try { const { data } = await api.post<Contact>("/contacts", c); result = data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed to create contact"); }
  }
  dispatch(addActivityEntry({ type: "contact", description: `New contact <b>${result.name}</b> added.`, user: userName(state) }));
  return result;
});

export const updateContact = createAsyncThunk("contacts/update", async ({ id, patch }: { id: string; patch: Partial<Contact> }, { getState, rejectWithValue }) => {
  const { auth, contacts } = getState() as RootState;
  if (auth.isDemoMode) {
    const existing = contacts.items.find((c) => c.id === id);
    if (!existing) return rejectWithValue("Not found");
    return { ...existing, ...patch };
  }
  try { const { data } = await api.put<Contact>(`/contacts/${id}`, patch); return data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed to update"); }
});

export const deleteContact = createAsyncThunk("contacts/delete", async (id: string, { getState, rejectWithValue }) => {
  const { auth } = getState() as RootState;
  if (!auth.isDemoMode) {
    try { await api.delete(`/contacts/${id}`); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? "Failed to delete"); }
  }
  return id;
});

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    toggleContactStar(state, action: PayloadAction<string>) {
      const c = state.items.find((x) => x.id === action.payload);
      if (c) c.isStarred = !c.isStarred;
    },
    loadSeed(state) { state.items = seedData.contacts; state.loading = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchContacts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchContacts.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(createContact.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateContact.fulfilled, (s, a) => { const i = s.items.findIndex((c) => c.id === a.payload.id); if (i >= 0) s.items[i] = a.payload; })
      .addCase(deleteContact.fulfilled, (s, a) => { s.items = s.items.filter((c) => c.id !== a.payload); });
  },
});

export const { toggleContactStar, loadSeed: loadContactsSeed } = contactsSlice.actions;
export default contactsSlice.reducer;
