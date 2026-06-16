import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import propertiesReducer from "./slices/propertiesSlice";
import contactsReducer from "./slices/contactsSlice";
import vacanciesReducer from "./slices/vacanciesSlice";
import dealsReducer from "./slices/dealsSlice";
import teamReducer from "./slices/teamSlice";
import activityReducer from "./slices/activitySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    contacts: contactsReducer,
    vacancies: vacanciesReducer,
    deals: dealsReducer,
    team: teamReducer,
    activity: activityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
