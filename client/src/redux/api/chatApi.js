import { toast } from "@/hooks/use-toast.js";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BASE_URL}/api/v1/chat`,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if(token){
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
        credentials: 'include'
    }),
    endpoints: (builder)=>({
        deleteMessage: builder.mutation({
            query: ({chatId, messageId}) => ({
                url: `/delete-message/${chatId}/${messageId}`,
                method: 'DELETE',
            }),
            onQueryStarted: async(_, { queryFulfilled }) => {
                try {
                    const result = await queryFulfilled;
                    toast({variant: 'success', title: result.data.message})
                } catch (error) {
                    toast({variant: 'error', title: error?.error?.data?.message})
                }
            }
        }),
        deleteChat: builder.mutation({
            query: (chatId) => ({
                url: `/delete/${chatId}`,
                method: 'DELETE',
            }),
            onQueryStarted: async(_, { queryFulfilled }) => {
                try {
                    const result = await queryFulfilled;
                    toast({variant: 'success', title: result.data.message})
                } catch (error) {
                    toast({variant: 'error', title: error?.error?.data?.message})
                }
            }
        })
    })
})

export const { useDeleteMessageMutation, useDeleteChatMutation } = chatApi;
