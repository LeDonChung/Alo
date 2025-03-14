import { configureStore } from '@reduxjs/toolkit';
import UserSlice from './slices/UserSlice';

const store = configureStore({
    reducer: {
        user: UserSlice,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;