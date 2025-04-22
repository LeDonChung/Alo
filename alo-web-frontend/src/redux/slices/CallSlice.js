import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    incomingCall: null,
    isAwaitAccepting: true,
    isVideoCallOpen: false,
    receives: [],
    isCalling: false,
};


const CallSlice = createSlice({
    name: 'CallSlice',
    initialState: initialState,
    reducers: {
        setIncomingCall: (state, action) => {
            state.incomingCall = action.payload;
        },
        setIsAwaitAccepting: (state, action) => {
            state.isAwaitAccepting = action.payload;
        },
        setIsVideoCallOpen: (state, action) => {
            state.isVideoCallOpen = action.payload;
        },
        setIsVoiceCallOpen: (state, action) => {
            state.isVoiceCallOpen = action.payload;
        },
        addReceive: (state, action) => {
            state.receives.push(action.payload);
        },
        setCalling: (state, action) => {
            state.isCalling = action.payload;
        },
    },
    extraReducers: (builder) => {

    }
});

export const { setIncomingCall, setIsAwaitAccepting,setIsVideoCallOpen, setIsVoiceCallOpen, addReceive, setCalling} = CallSlice.actions;
export { };
export default CallSlice.reducer;