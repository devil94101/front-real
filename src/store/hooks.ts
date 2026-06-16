import { useCallback, useMemo } from "react";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./index";
import type {
  ActivityType,
  Contact,
  Deal,
  DealStage,
  Property,
  TeamMember,
  Vacancy,
} from "../types";

// ── Typed hooks ──────────────────────────────────────────
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Redux-backed thunk / action imports ──────────────────
import { logout, setActiveUserId } from "./slices/authSlice";
import {
  createProperty,
  updateProperty as updatePropertyThunk,
  deleteProperty as deletePropertyThunk,
  shareProperty as sharePropertyThunk,
  toggleStar,
  unlinkOwnerFromProperties,
  loadPropertiesSeed,
} from "./slices/propertiesSlice";
import {
  createContact,
  updateContact as updateContactThunk,
  deleteContact as deleteContactThunk,
  toggleContactStar,
  loadContactsSeed,
} from "./slices/contactsSlice";
import {
  createVacancy,
  updateVacancy as updateVacancyThunk,
  deleteVacancy as deleteVacancyThunk,
  removeVacanciesByProperty,
  loadVacanciesSeed,
} from "./slices/vacanciesSlice";
import {
  createDeal,
  updateDeal as updateDealThunk,
  deleteDeal as deleteDealThunk,
  moveDealStage,
  unlinkDealsFromProperty,
  loadDealsSeed,
} from "./slices/dealsSlice";
import { addMember, removeMember, loadTeamSeed } from "./slices/teamSlice";
import { addActivityEntry, loadActivitySeed } from "./slices/activitySlice";
import {
  fetchProperties,
} from "./slices/propertiesSlice";
import { fetchContacts } from "./slices/contactsSlice";
import { fetchVacancies } from "./slices/vacanciesSlice";
import { fetchDeals } from "./slices/dealsSlice";
import { fetchTeam } from "./slices/teamSlice";
import { fetchActivity } from "./slices/activitySlice";
import { fetchBillingStatus } from "./slices/billingSlice";

// ── Bridge hook — same interface as the old useApp() ─────
export function useApp() {
  const dispatch = useAppDispatch();

  // ── Selectors ────────────────────────────────────────
  const properties = useAppSelector((s) => s.properties.items);
  const contacts = useAppSelector((s) => s.contacts.items);
  const vacancies = useAppSelector((s) => s.vacancies.items);
  const deals = useAppSelector((s) => s.deals.items);
  const team = useAppSelector((s) => s.team.members);
  const activity = useAppSelector((s) => s.activity.items);
  const billing = useAppSelector((s) => s.billing.status);
  const authUser = useAppSelector((s) => s.auth.user);
  const isDemoMode = useAppSelector((s) => s.auth.isDemoMode);
  const activeUserId = useAppSelector((s) => s.auth.activeUserId);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authLoading = useAppSelector((s) => s.auth.loading);

  // current user: in demo mode allow switching; otherwise use auth user
  const currentUser: TeamMember = useMemo(() => {
    if (isDemoMode && activeUserId) {
      const found = team.find((t) => t.id === activeUserId);
      if (found) return found;
    }
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.name,
        role: authUser.role,
        email: authUser.email,
        color: authUser.color,
      };
    }
    return team[0] ?? { id: "?", name: "Unknown", role: "", email: "", color: "#475569" };
  }, [isDemoMode, activeUserId, team, authUser]);

  // ── Lookup functions ─────────────────────────────────
  const getProperty = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties]
  );
  const getContact = useCallback(
    (id: string) => contacts.find((c) => c.id === id),
    [contacts]
  );
  const contactsForProperty = useCallback(
    (propertyId: string) =>
      contacts.filter(
        (c) =>
          c.propertyIds.includes(propertyId) ||
          c.id === properties.find((p) => p.id === propertyId)?.ownerId
      ),
    [contacts, properties]
  );
  const vacanciesForProperty = useCallback(
    (propertyId: string) => vacancies.filter((v) => v.propertyId === propertyId),
    [vacancies]
  );
  const dealsForProperty = useCallback(
    (propertyId: string) => deals.filter((d) => d.propertyId === propertyId),
    [deals]
  );

  // ── Action dispatchers ───────────────────────────────
  return useMemo(
    () => ({
      // data
      properties,
      contacts,
      vacancies,
      deals,
      team,
      activity,
      billing,
      currentUser,
      isAuthenticated,
      isDemoMode,
      authLoading,

      // auth
      setCurrentUserId: (id: string) => dispatch(setActiveUserId(id)),
      logout: () => dispatch(logout()),

      // properties
      addProperty: (p: Omit<Property, "id" | "dateAdded" | "lastUpdated">) => {
        dispatch(createProperty(p)).then(() => dispatch(fetchBillingStatus()));
      },
      updateProperty: (id: string, patch: Partial<Property>) => {
        dispatch(updatePropertyThunk({ id, patch }));
      },
      deleteProperty: (id: string) => {
        dispatch(removeVacanciesByProperty(id));
        dispatch(unlinkDealsFromProperty(id));
        dispatch(deletePropertyThunk(id));
      },
      toggleStar: (id: string) => dispatch(toggleStar(id)),
      shareProperty: (propertyId: string, memberIds: string[]) => {
        dispatch(sharePropertyThunk({ propertyId, memberIds }));
      },

      // contacts
      addContact: (c: Omit<Contact, "id" | "dateAdded">) => {
        dispatch(createContact(c));
      },
      updateContact: (id: string, patch: Partial<Contact>) => {
        dispatch(updateContactThunk({ id, patch }));
      },
      deleteContact: (id: string) => {
        dispatch(unlinkOwnerFromProperties(id));
        dispatch(deleteContactThunk(id));
      },
      toggleContactStar: (id: string) => dispatch(toggleContactStar(id)),

      // vacancies
      addVacancy: (v: Omit<Vacancy, "id">) => {
        dispatch(createVacancy(v));
      },
      updateVacancy: (id: string, patch: Partial<Vacancy>) => {
        dispatch(updateVacancyThunk({ id, patch }));
      },
      deleteVacancy: (id: string) => {
        dispatch(deleteVacancyThunk(id));
      },

      // deals
      addDeal: (d: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
        dispatch(createDeal(d));
      },
      updateDeal: (id: string, patch: Partial<Deal>) => {
        dispatch(updateDealThunk({ id, patch }));
      },
      deleteDeal: (id: string) => {
        dispatch(deleteDealThunk(id));
      },
      moveDeal: (id: string, stage: DealStage) => {
        dispatch(moveDealStage({ id, stage }));
      },

      // team
      addTeamMember: (m: Omit<TeamMember, "id">) => {
        dispatch(addMember(m));
      },
      removeTeamMember: (id: string) => {
        dispatch(removeMember(id));
      },

      // utility
      logActivity: (type: ActivityType, description: string) => {
        dispatch(
          addActivityEntry({
            type,
            description,
            user: currentUser.name,
          })
        );
      },
      resetData: () => {
        dispatch(loadPropertiesSeed());
        dispatch(loadContactsSeed());
        dispatch(loadVacanciesSeed());
        dispatch(loadDealsSeed());
        dispatch(loadTeamSeed());
        dispatch(loadActivitySeed());
      },
      loadAllData: () => {
        dispatch(fetchProperties());
        dispatch(fetchContacts());
        dispatch(fetchVacancies());
        dispatch(fetchDeals());
        dispatch(fetchTeam());
        dispatch(fetchActivity());
        dispatch(fetchBillingStatus());
      },

      // lookups
      getProperty,
      getContact,
      contactsForProperty,
      vacanciesForProperty,
      dealsForProperty,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatch,
      properties,
      contacts,
      vacancies,
      deals,
      team,
      activity,
      billing,
      currentUser,
      isAuthenticated,
      isDemoMode,
      authLoading,
      getProperty,
      getContact,
      contactsForProperty,
      vacanciesForProperty,
      dealsForProperty,
    ]
  );
}
