import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { pushToCallQueue, resetCallQueue } from "../slices/callSlice.js";
import { toast } from "@/hooks/use-toast.js";
import { setCallLogs } from "../slices/appSlice.js";

export const callApi = createApi({
    reducerPath: 'callApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BASE_URL}/api/v1/call`,
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
        startCall: builder.mutation({
            query: (body) => ({
                url: '/new-call',
                method: 'POST',
                body,
            }),
            onQueryStarted: async(_, { dispatch, queryFulfilled }) => {
                try {
                    dispatch(resetCallQueue());
                    const result = await queryFulfilled;
                    dispatch(pushToCallQueue({
                        call: result?.data?.data,
                        type: result?.data?.type,
                        incoming: false,
                    }));
                } catch (error) {
                    toast({variant: 'error', title: error?.error?.data?.message})
                }
            }
        }),
        fetchCallLogs: builder.query({
            query: () => ({
                url: '/logs',
                method: 'GET',
            })
        })
    }),
})

export const { useStartCallMutation, useFetchCallLogsQuery } = callApi;