import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../config/api";
import type { Property } from "../../types";
import type { RootState } from "../index";
import { addActivityEntry } from "./activitySlice";
import { seedData } from "../../data/seed";
import { uid } from "../../lib/format";

// ── State ────────────────────────────────────────────────
export interface PropertiesState {
  items: Property[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertiesState = { items: [], loading: false, error: null };

// ── helpers ──────────────────────────────────────────────
const now = () => new Date().toISOString();
const userName = (state: RootState) => state.auth.user?.name ?? "System";

// ── Thunks ───────────────────────────────────────────────
export const fetchProperties = createAsyncThunk(
  "properties/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as RootState;
    if (auth.isDemoMode) return seedData.properties;
    try {
      const { data } = await api.get<Property[]>("/properties");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to fetch properties");
    }
  }
);

export const createProperty = createAsyncThunk(
  "properties/create",
  async (p: Omit<Property, "id" | "dateAdded" | "lastUpdated">, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    let result: Property;
    if (state.auth.isDemoMode) {
      result = { ...p, id: uid("p"), dateAdded: now(), lastUpdated: now() } as Property;
    } else {
      try {
        const { data } = await api.post<Property>("/properties", p);
        result = data;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message ?? "Failed to create property");
      }
    }
    dispatch(addActivityEntry({ type: "property", description: `Added <b>${result.name}</b> to the database.`, user: userName(state) }));
    return result;
  }
);

export const updateProperty = createAsyncThunk(
  "properties/update",
  async ({ id, patch }: { id: string; patch: Partial<Property> }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    if (state.auth.isDemoMode) {
      const existing = state.properties.items.find((p) => p.id === id);
      if (!existing) return rejectWithValue("Property not found");
      dispatch(addActivityEntry({ type: "property", description: "Updated property details.", user: userName(state) }));
      return { ...existing, ...patch, lastUpdated: now() };
    }
    try {
      const { data } = await api.put<Property>(`/properties/${id}`, patch);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to update");
    }
  }
);

export const deleteProperty = createAsyncThunk(
  "properties/delete",
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.auth.isDemoMode) {
      try {
        await api.delete(`/properties/${id}`);
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message ?? "Failed to delete");
      }
    }
    dispatch(addActivityEntry({ type: "property", description: "Removed a property from the database.", user: userName(state) }));
    return id;
  }
);

export const shareProperty = createAsyncThunk(
  "properties/share",
  async ({ propertyId, memberIds }: { propertyId: string; memberIds: string[] }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.auth.isDemoMode) {
      try {
        await api.post(`/properties/${propertyId}/share`, { memberIds });
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message ?? "Failed to share");
      }
    }
    const name = state.properties.items.find((p) => p.id === propertyId)?.name ?? "a property";
    dispatch(addActivityEntry({ type: "share", description: `Shared <b>${name}</b> with ${memberIds.length} team member${memberIds.length === 1 ? "" : "s"}.`, user: userName(state) }));
    return { propertyId, memberIds };
  }
);

// ── Slice ────────────────────────────────────────────────
const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    toggleStar(state, action: PayloadAction<string>) {
      const p = state.items.find((x) => x.id === action.payload);
      if (p) p.isStarred = !p.isStarred;
    },
    unlinkOwnerFromProperties(state, action: PayloadAction<string>) {
      state.items.forEach((p) => {
        if (p.ownerId === action.payload) p.ownerId = null;
      });
    },
    loadSeed(state) {
      state.items = seedData.properties;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchProperties.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(createProperty.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(shareProperty.fulfilled, (state, action) => {
        const p = state.items.find((x) => x.id === action.payload.propertyId);
        if (p) p.sharedWith = action.payload.memberIds;
      });
  },
});

export const { toggleStar, unlinkOwnerFromProperties, loadSeed: loadPropertiesSeed } = propertiesSlice.actions;
export default propertiesSlice.reducer;
