import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/subscriptions`;

// Helper to get auth header
const getAuthHeader = (thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.accessToken;
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const initiateSubscription = createAsyncThunk(
    'subscription/initiate',
    async ({ planId, gateway }, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.post(`${API_URL}/initiate`, { planId, gateway }, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const activateSubscription = createAsyncThunk(
    'subscription/activate',
    async (paymentData, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.post(`${API_URL}/activate`, paymentData, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getCurrentSubscription = createAsyncThunk(
    'subscription/getCurrent',
    async (_, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.get(`${API_URL}/current`, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getPaymentHistory = createAsyncThunk(
    'subscription/getPaymentHistory',
    async (_, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.get(`${API_BASE_URL}/api/payments/me`, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const initialState = {
    currentSubscription: null,
    paymentHistory: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        resetSubscription: (state) => {
            state.isError = false;
            state.isSuccess = false;
            state.isLoading = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initiateSubscription.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initiateSubscription.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(initiateSubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
            })
            .addCase(activateSubscription.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(activateSubscription.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = action.payload;
            })
            .addCase(activateSubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
            })
            .addCase(getCurrentSubscription.fulfilled, (state, action) => {
                state.currentSubscription = action.payload;
            })
            .addCase(getPaymentHistory.fulfilled, (state, action) => {
                state.paymentHistory = action.payload;
            });
    },
});

export const { resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
