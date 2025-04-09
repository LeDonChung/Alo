import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    userRegister: {
        phoneNumber: '',
        password: '',
        rePassword: '',
        fullName: '',
    },
};

const register = createAsyncThunk('RegisterSlice/register', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/register', request);
      return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
})

const RegisterSlice = createSlice({
    name: 'RegisterSlice',
    initialState: initialState,
    reducers: {
        setUserRegister : (state, action) => {
            state.userRegister = action.payload;
        }
    },
    extraReducers: (builder) => {

        // Register
        builder.addCase(register.pending, (state) => {
            state.errorResponse = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.errorResponse = null;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.errorResponse = action.payload;
        });
    }
});

export const { setUserRegister } = RegisterSlice.actions;
export { register };
export default RegisterSlice.reducer;