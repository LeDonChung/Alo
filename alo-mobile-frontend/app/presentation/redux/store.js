import { configureStore } from '@reduxjs/toolkit';
import UserSlice from './slices/UserSlice';
import registerReducer from "./slices/RegisterSlice";
import friend from './slices/FriendSlice';

export const store = configureStore({
    reducer: {
        user: UserSlice,
        register: registerReducer,
        friend: friend,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }), 
});
