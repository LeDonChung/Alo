import { configureStore } from '@reduxjs/toolkit';
import UserSlice from './slices/UserSlice';
import RegisterSlice from './slices/RegisterSlice';

const store = configureStore({
    reducer: {
        user: UserSlice,
        register: RegisterSlice
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;