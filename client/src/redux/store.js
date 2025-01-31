import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import AppReducer from './slices/appSlice.js';
import AuthReducer from './slices/authSlice.js';

const rootReducer = combineReducers({
    app: AppReducer,
    auth: AuthReducer,
})

const rootPersistConfig = {
    key: 'root',
    storage,
    keyPrefix: 'redux-',
    whitelist: ['auth'],
}

export const store = configureStore({
    reducer: persistReducer(rootPersistConfig, rootReducer),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false,
        }),
})

export const persistor = persistStore(store);