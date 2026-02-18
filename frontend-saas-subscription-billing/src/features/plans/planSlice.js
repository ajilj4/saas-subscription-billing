import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:9000/api/plans';

export const getPlans = createAsyncThunk('plans/getAll', async (_, thunkAPI) => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

const initialState = {
    plans: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const planSlice = createSlice({
    name: 'plans',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPlans.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getPlans.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.plans = action.payload;
            })
            .addCase(getPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = planSlice.actions;
export default planSlice.reducer;
