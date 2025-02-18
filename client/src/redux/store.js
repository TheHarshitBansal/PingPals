import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import AppReducer from './slices/appSlice.js';
import AuthReducer from './slices/authSlice.js';
import conversationReducer from './slices/conversationSlice.js';
import { authApi } from './api/authApi.js';

const rootReducer = combineReducers({
    app: AppReducer,
    auth: AuthReducer,
    conversation: conversationReducer,
    [authApi.reducerPath]: authApi.reducer,
})

const rootPersistConfig = {
    key: 'root',
    storage,
    keyPrefix: 'redux-',
    whitelist: ['auth', 'conversation'],
}

export const store = configureStore({
    reducer: persistReducer(rootPersistConfig, rootReducer),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware(
            { serializableCheck: false,
            immutableCheck: false 
             }
        ).concat(authApi.middleware),
    devTools: import.meta.VITE_NODE_ENV !== 'production',
})

export const persistor = persistStore(store);