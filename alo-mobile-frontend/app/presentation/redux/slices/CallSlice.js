import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    incomingCall: null,
    isAwaitAccepting: true,
    isVideoCallOpen: false,
    receives: [],
    isCalling: false,
    token: null,
    meetingId: null,
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
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setMeetingId: (state, action) => {
            state.meetingId = action.payload;
        }
    },
    extraReducers: (builder) => {

    }
});

export const { setIncomingCall, setIsAwaitAccepting,setIsVideoCallOpen, setIsVoiceCallOpen, addReceive, setCalling, setMeetingId, setToken} = CallSlice.actions;
export { };
export default CallSlice.reducer;