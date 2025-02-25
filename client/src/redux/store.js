import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import AppReducer from "./slices/appSlice.js";
import AuthReducer from "./slices/authSlice.js";
import conversationReducer from "./slices/conversationSlice.js";
import { authApi } from "./api/authApi.js";
import { chatApi } from "./api/chatApi.js";

// Transform to exclude currentConversation & currentMessages from persistence
const conversationTransform = createTransform(
  (inboundState) => {
    const { currentConversation, currentMessages, ...persistedState } = inboundState;
    return persistedState;
  },
  (outboundState) => ({
    ...outboundState,
    currentConversation: null, // Ensure default values on reload
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
  [authApi.reducerPath]: authApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
});

export const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(authApi.middleware, chatApi.middleware),
  devTools: import.meta.env.VITE_NODE_ENV !== "production",
});

export const persistor = persistStore(store);