import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
  unreadCount: number;
}

const initialState: NotificationState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});

export const { setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
