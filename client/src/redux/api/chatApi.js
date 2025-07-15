import { toast } from "@/hooks/use-toast.js";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_URL}/api/v1/chat`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Chat", "Message"],
  endpoints: (builder) => ({
    deleteMessage: builder.mutation({
      query: ({ chatId, messageId }) => ({
        url: `/delete-message/${chatId}/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat", "Message"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          toast({ variant: "success", title: result.data.message });
        } catch (error) {
          toast({ variant: "error", title: error?.error?.data?.message });
        }
      },
    }),
    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `/delete/${chatId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          toast({ variant: "success", title: result.data.message });
        } catch (error) {
          toast({ variant: "error", title: error?.error?.data?.message });
        }
      },
    }),
    uploadMedia: builder.mutation({
      query: (formData) => {
        return {
          url: "/upload/file",
          method: "POST",
          body: formData,
        };
      },
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          toast({ variant: "success", title: result.data.message });
        } catch (error) {
          toast({
            variant: "error",
            title: error?.data?.message || "Upload failed",
          });
        }
      },
    }),
  }),
});

export const {
  useDeleteMessageMutation,
  useDeleteChatMutation,
  useUploadMediaMutation,
} = chatApi;
