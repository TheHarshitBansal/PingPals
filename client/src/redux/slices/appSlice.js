import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebar:{
        isOpen: false,
        type: 'PROFILE' // PROFILE, STARRED, SHARED
    }
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers:{
        toggleSidebar: (state) => {
            state.sidebar.isOpen = !state.sidebar.isOpen
        },
        setSidebarType: (state, action) => {
            state.sidebar.type = action.payload
        }
    }
})

export const { toggleSidebar, setSidebarType } = appSlice.actions;

export default appSlice.reducer;
