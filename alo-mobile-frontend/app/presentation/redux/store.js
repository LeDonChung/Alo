import { configureStore } from '@reduxjs/toolkit';
import UserSlice from './slices/UserSlice';
import registerReducer from "./slices/RegisterSlice";

export const store = configureStore({
    reducer: {
        user: UserSlice,
        register: registerReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }), 
});
