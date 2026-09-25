import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { AUTH_API, HOST, SESSION_MESSAGES } from '@/constants';
import { setAxiosToken } from '@/lib/api/axios';
import type { UpdateUserPayload, User } from '@/types/user';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  status: 'idle',
};

// Refresh TokenThunk
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const baseURL = import.meta.env.MODE === 'development' ? `${HOST}` : '';

      const res = await fetch(`${baseURL}${AUTH_API.REFRESH_TOKEN}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(SESSION_MESSAGES.EXPIRED);
      }
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return rejectWithValue(SESSION_MESSAGES.EXPIRED);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // set user and token after login
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.status = 'succeeded';
      setAxiosToken(action.payload.accessToken);
    },
    // update access token after refresh
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      setAxiosToken(action.payload);
    },
    updateUser: (state, action: PayloadAction<UpdateUserPayload>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          worker: state.user.worker
            ? {
                ...state.user.worker,
                ...(action.payload.worker ?? {}),
              }
            : state.user.worker,
        };
      }
    },
    // Logout
    clearUser: state => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = 'failed';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(refreshAccessToken.pending, state => {
        state.status = 'loading';
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const { user, accessToken } = action.payload;
        state.user = user;
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        state.status = 'succeeded';
        setAxiosToken(accessToken);
      })
      .addCase(refreshAccessToken.rejected, state => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = 'failed';
      });
  },
});

export const { setCredentials, updateToken, updateUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
