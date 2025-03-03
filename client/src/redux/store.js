import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import AppReducer from "./slices/appSlice.js";
import AuthReducer from "./slices/authSlice.js";
import conversationReducer from "./slices/conversationSlice.js";
import callReducer from "./slices/callSlice.js";
import { authApi } from "./api/authApi.js";
import { chatApi } from "./api/chatApi.js";
import { callApi } from "./api/callApi.js";

// Transform to exclude currentConversation & currentMessages from persistence
const conversationTransform = createTransform(
  (inboundState) => {
    const { currentConversation, currentMessages, ...persistedState } = inboundState;
    return persistedState;
  },
  (outboundState) => ({
    ...outboundState,
    currentConversation: null,
    currentMessages: [],
  }),
  { whitelist: ["conversation"] }
);

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: "redux-",
  whitelist: ["auth", "conversation"],
  transforms: [conversationTransform],
};

const rootReducer = combineReducers({
  app: AppReducer,
  auth: AuthReducer,
  conversation: conversationReducer,
  call: callReducer,
  [authApi.reducerPath]: authApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [callApi.reducerPath]: callApi.reducer,
});

export const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(authApi.middleware, chatApi.middleware, callApi.middleware),
  devTools: import.meta.env.VITE_NODE_ENV !== "production",
});

export const persistor = persistStore(store);