import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { addUser } from "../slices/authSlice.js";
import { toast } from "@/hooks/use-toast.js";

export const oauthApi = createApi({
  reducerPath: "oauthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_URL}/auth`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    handleGoogleAuth: builder.mutation({
      query: (body) => ({
        url: "/google",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(data);

          dispatch(
            addUser({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
            })
          );
          toast({ variant: "success", title: data.message });
        } catch (error) {
          const msg = error?.error?.data?.message || "Google Auth failed";
          toast({ variant: "error", title: msg });
        }
      },
    }),
  }),
});

export const { useHandleGoogleAuthMutation } = oauthApi;
