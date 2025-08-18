import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    ActiveUsers: []
  },

  reducers: {
    setActiveUsers: (state, action) => {
      state.ActiveUsers = action.payload || []
    },
    setAuth: (state, action) => {
      // Support both shapes:
      // 1) { user, token }
      // 2) raw user object
      const incomingUser = action.payload && action.payload.user
        ? action.payload.user
        : action.payload;

      if (incomingUser) {
        state.isAuthenticated = true;
        state.user = incomingUser;
      }
      if (action.payload && action.payload.token) {
        state.token = action.payload.token;
      }
      state.loading = false;
    },
    setUserInfo: (state, action) => {
      // Accept either { user } or a raw user object
      state.user = action.payload && action.payload.user
        ? action.payload.user
        : action.payload;
      state.loading = false;
    },
    
    setToken: (state, action) => {
      state.token = action.payload;
      state.loading = false;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.ActiveUsers = []
    }
  }
})

// Action creators are generated for each case reducer function
export const {setActiveUsers, setAuth, setUserInfo, setToken, setLoading, logout } = authSlice.actions

export default authSlice.reducer
