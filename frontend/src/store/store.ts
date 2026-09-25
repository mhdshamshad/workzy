import { configureStore } from '@reduxjs/toolkit';

import authReducer, { type AuthState } from './slices/authSlice';
import locationReducer, { type LocationState } from './slices/locationSlice';
import notificationReducer, { type NotificationState } from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    notification: notificationReducer,
  },
});

export default store;
export type RootState = {
  auth: AuthState;
  location: LocationState;
  notification: NotificationState;
};
export type AppDispatch = typeof store.dispatch;
export type { AuthState, LocationState, NotificationState };
