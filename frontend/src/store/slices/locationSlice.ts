import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LocationState {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  radius: number;
}

const initialState: LocationState = {
  address: 'Mankavu, Kozhikode, Kerala 673007, India',
  city: 'calicut',
  latitude: 11.2588,
  longitude: 75.7804,
  radius: 30,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (
      state,
      action: PayloadAction<{
        city: string;
        address: string;
        latitude: number;
        longitude: number;
      }>
    ) => {
      state.city = action.payload.city;
      state.address = action.payload.address;
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
    setRadius: (state, action: PayloadAction<number>) => {
      state.radius = action.payload;
    },
  },
});

export const { setLocation, setRadius } = locationSlice.actions;
export default locationSlice.reducer;
