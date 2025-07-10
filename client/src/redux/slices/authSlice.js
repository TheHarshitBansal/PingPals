import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
    expiry: null,
  },
  reducers: {
    addUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    },
    removeUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.expiry = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { addUser, removeUser, updateUser } = authSlice.actions;

export default authSlice.reducer;
