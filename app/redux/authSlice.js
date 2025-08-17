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
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
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
      state.onlineUsers = []
    }
  }
})

// Action creators are generated for each case reducer function
export const {setActiveUsers, setAuth, setToken, setLoading, logout } = authSlice.actions

export default authSlice.reducer
