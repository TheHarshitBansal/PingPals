import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebar:{
        isOpen: false,
        type: 'PROFILE' // PROFILE, STARRED, SHARED
    },
    friends : [],
    requests: [],
    incomingCallData: null,
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
        setIncomingCallData(state, action) {
            state.incomingCallData = action.payload;
          },
          clearIncomingCallData(state) {
            state.incomingCallData = null;
          }
    }
})

export const { toggleSidebar, setSidebarType, setFriends, setRequests, setIncomingCallData, clearIncomingCallData } = appSlice.actions;

export default appSlice.reducer;
