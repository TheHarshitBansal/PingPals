import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebar:{
        isOpen: false,
        type: 'PROFILE' // PROFILE, STARRED, SHARED
    },
    chat_id: null,
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
        },
        openChat: (state, action) => {
            state.chat_id = action.payload
        },
    }
})

export const { toggleSidebar, setSidebarType, openChat } = appSlice.actions;

export default appSlice.reducer;
