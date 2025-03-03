import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebar:{
        isOpen: false,
        type: 'PROFILE' // PROFILE, STARRED, SHARED
    },
    friends : [],
    requests: [],
    callLogs: []
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
        setFriends: (state, action) => {
            state.friends = action.payload
        },
        setRequests: (state, action) => {
            state.requests = action.payload
        },
        setCallLogs: (state, action) => {
            state.callLogs = action.payload
        }
    }
})

export const { toggleSidebar, setSidebarType, setFriends, setRequests, setCallLogs } = appSlice.actions;

export default appSlice.reducer;
