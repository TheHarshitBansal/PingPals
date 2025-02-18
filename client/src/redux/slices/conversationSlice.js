import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    directConversations: [],
    groupConversations: [],
    currentConversation: null,
    currentMessages: [],
}

const conversationSlice = createSlice({
    name: "conversation",
    initialState,
    reducers:{
        fetchDirectConversations: (state, action) => {
            state.directConversations = action.payload;
        },
        fetchGroupConversations: (state, action) => {
            state.groupConversations = action.payload;
        },
        setCurrentConversation: (state, action) => {
            state.currentConversation = action.payload;
        },
        fetchMessages: (state, action) => {
            state.currentMessages = action.payload;
        },
    }
})

export const { fetchDirectConversations, fetchGroupConversations, setCurrentConversation, fetchMessages } = conversationSlice.actions;

export default conversationSlice.reducer;