import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { addUser } from "../slices/authSlice.js";
import { toast } from "@/hooks/use-toast.js";

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BASE_URL}/api/v1/user`,
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
        registerUser: builder.mutation({
            query: (body) => ({
                url: '/register',
                method: 'POST',
                body,
            }),
            onQueryStarted: async(_, {  queryFulfilled }) => {
                try {
                    const result = await queryFulfilled;
                    toast({variant: 'success', title: result.data.message})
                } catch (error) {
                    toast({variant: 'error', title: error?.error?.data?.message})
                }
            }
        }),
        loginUser: builder.mutation({
            query: (body) => ({
                url: '/login',
                method: 'POST',
                body,
            }),
            onQueryStarted: async(_, { dispatch, queryFulfilled }) => {
                try {
                    const result = await queryFulfilled;
                    dispatch(addUser(result?.data));
                    toast({variant: 'success', title: result.data.message})
                } catch (error) {
                    toast({variant: 'error', title: error?.error?.data?.message})
                }
            },
        }),
        verifyUser: builder.mutation({
            query: (body) => ({
                url: '/verify-otp',
                method: 'POST',
                body,
            }),
            onQueryStarted: async(_, { dispatch, queryFulfilled }) => {
                try {
                    const result = await queryFulfilled;
                    dispatch(addUser(result?.data));
                    toast({variant: 'success', title: result.data.message})
                } catch (error) {
                    toast({variant: 'error', title: error?.error?.data?.message})
                }
            }
        }),
        resendOTP: builder.mutation({
            query: (body) => ({
                url: `/send-otp`,
                method: 'POST',
                body,
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

export const { useLoginUserMutation, useRegisterUserMutation, useVerifyUserMutation, useResendOTPMutation } = authApi;