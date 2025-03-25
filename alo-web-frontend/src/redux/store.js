import { configureStore } from '@reduxjs/toolkit';
import UserSlice from './slices/UserSlice';
import RegisterSlice from './slices/RegisterSlice';
import FriendSlice from './slices/FriendSlice';
import ConversationSlice from './slices/ConversationSlice';
import MessageSlice from './slices/MessageSlice';

const store = configureStore({
    reducer: {
        user: UserSlice,
        register: RegisterSlice,
        friend: FriendSlice,
        conversation: ConversationSlice,
        message: MessageSlice
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;