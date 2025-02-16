import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    directChat: {
        conversations: [],
        currentConversation: null,
        currentMessages: [],
    },
    groupChat: {
        conversations: [],
        currentConversation: null,
        currentMessages: [],
    },
}

const conversationSlice = createSlice({
    name: conversation,
    initialState,
    reducers:{
        fetchDirectChats(state, action){
            state.directChat.conversations = action.payload;
        },
        fetchGroupChats(state, action){
            state.groupChat.conversations = action.payload;
        },
        setCurrentDirectChat(state, action){
            state.directChat.currentConversation = action.payload;
        },
        setCurrentGroupChat(state, action){
            state.groupChat.currentConversation = action.payload;
        },
    }
})

export const { fetchDirectChats, fetchGroupChats, setCurrentDirectChat, setCurrentGroupChat } = conversationSlice.actions;

export default conversationSlice.reducer;