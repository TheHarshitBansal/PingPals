import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenicated: false,
        user: null,
        token: null
    },
    reducers:{
        addUser: (state, action) => {
            state.isAuthenicated = true
            state.user = action.payload.user
            state.token = action.payload.token 
        },
        removeUser: (state) => {
            state.user = null
            state.token = null
            state.isAuthenicated = false
        }
    }
})

export const { addUser, removeUser } = authSlice.actions;

export default authSlice.reducer;