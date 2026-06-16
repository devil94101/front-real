import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../config/api";
import type { BillingStatus, SubscriptionInit, AuthUser } from "../../types";
import type { RootState } from "../index";
import type { CheckoutResult } from "../../lib/razorpay";

export interface BillingState {
  status: BillingStatus | null;
  loading: boolean;
  upgrading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  status: null,
  loading: false,
  upgrading: false,
  error: null,
};

// Demo mode has no backend — treat the demo workspace as Premium so it is never gated.
const DEMO_STATUS: BillingStatus = {
  plan: "premium",
  limit: 9999,
  used: 0,
  remaining: 9999,
  canList: true,
  subscriptionStatus: "active",
  price: { amount: 499900, currency: "INR", period: "yearly" },
  live: false,
};

export const fetchBillingStatus = createAsyncThunk(
  "billing/status",
  async (_, { getState, rejectWithValue }) => {
    if ((getState() as RootState).auth.isDemoMode) return DEMO_STATUS;
    try {
      const { data } = await api.get<BillingStatus>("/billing/status");
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Failed to load billing status");
    }
  }
);

// Creates the subscription (or a mock one) and returns the checkout init payload.
export const createSubscription = createAsyncThunk(
  "billing/createSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post<SubscriptionInit>("/billing/subscription");
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Could not start checkout");
    }
  }
);

// Verifies the payment and activates Premium. Returns the updated user + status.
export const verifyPayment = createAsyncThunk(
  "billing/verify",
  async (
    payload: Partial<CheckoutResult> & { razorpay_subscription_id: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<{ user: AuthUser; status: BillingStatus }>(
        "/billing/verify",
        payload
      );
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Payment verification failed");
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "billing/cancel",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ user: AuthUser; status: BillingStatus }>("/billing/cancel");
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message ?? "Could not cancel subscription");
    }
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    clearBillingError(state) {
      state.error = null;
    },
    resetBilling(state) {
      state.status = null;
      state.error = null;
      state.upgrading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingStatus.pending, (s) => { s.loading = true; })
      .addCase(fetchBillingStatus.fulfilled, (s, a) => { s.loading = false; s.status = a.payload; })
      .addCase(fetchBillingStatus.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(createSubscription.pending, (s) => { s.upgrading = true; s.error = null; })
      .addCase(createSubscription.rejected, (s, a) => { s.upgrading = false; s.error = a.payload as string; })

      .addCase(verifyPayment.fulfilled, (s, a) => { s.upgrading = false; s.status = a.payload.status; })
      .addCase(verifyPayment.rejected, (s, a) => { s.upgrading = false; s.error = a.payload as string; })

      .addCase(cancelSubscription.fulfilled, (s, a) => { s.status = a.payload.status; });
  },
});

export const { clearBillingError, resetBilling } = billingSlice.actions;
export default billingSlice.reducer;
