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
            const list = action.payload.map((conversation) => {
                const this_user = conversation.participants.find((participant) => participant._id !== user_id);
                return{
                    id: this_user._id,
                    name: this_user.name,
                    avatar: this_user.avatar,
                    online: this_user.status,
                    message: "hii",
                    time: "12:00",
                    badge: 2,
                }
            })

            state.directConversations = list; 
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