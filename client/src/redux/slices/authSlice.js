import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        user: null,
        token: null
    },
    reducers:{
        addUser: (state, action) => {
            state.isAuthenticated = true
            state.user = action.payload.user
            state.token = action.payload.token 
        },
        removeUser: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
        },
        updateUser: (state, action) => {
            state.user = action.payload
        }
    }
})

export const { addUser, removeUser, updateUser } = authSlice.actions;

export default authSlice.reducer;