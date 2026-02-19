import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/admin/payouts`;

// Helper to get auth header
const getAuthHeader = (thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.accessToken;
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    };
};

export const updateBankDetails = createAsyncThunk(
    'payout/updateBankDetails',
    async (bankData, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const userEmail = thunkAPI.getState().auth.user?.email;
            const response = await axios.post(`${API_URL}/update-bank-details`, { ...bankData, email: userEmail }, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getPayoutHistory = createAsyncThunk(
    'payout/getHistory',
    async (_, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const userEmail = thunkAPI.getState().auth.user?.email;
            const response = await axios.get(`${API_URL}/history/${userEmail}`, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getAllPayouts = createAsyncThunk(
    'payout/getAll',
    async (_, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.get(`${API_URL}/all`, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchPayoutBalance = createAsyncThunk(
    'payout/fetchBalance',
    async (_, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.get(`${API_URL}/balance`, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getUsers = createAsyncThunk(
    'payout/getUsers',
    async (_, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.get(`${API_BASE_URL}/api/admin/users`, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const initiateManualPayout = createAsyncThunk(
    'payout/initiateManual',
    async (payoutData, thunkAPI) => {
        try {
            const config = getAuthHeader(thunkAPI);
            const response = await axios.post(`${API_URL}/initiate-manual`, payoutData, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const initialState = {
    payouts: [],
    users: [],
    balance: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const payoutSlice = createSlice({
    name: 'payout',
    initialState,
    reducers: {
        resetPayout: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateBankDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateBankDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = action.payload.message || 'Bank details updated successfully';
            })
            .addCase(updateBankDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getPayoutHistory.fulfilled, (state, action) => {
                state.payouts = action.payload;
            })
            .addCase(getAllPayouts.fulfilled, (state, action) => {
                state.payouts = action.payload;
            })
            .addCase(fetchPayoutBalance.fulfilled, (state, action) => {
                state.balance = action.payload;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.users = action.payload;
            })
            .addCase(initiateManualPayout.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initiateManualPayout.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = 'Manual payout initiated successfully';
                state.payouts.unshift(action.payload);
            })
            .addCase(initiateManualPayout.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetPayout } = payoutSlice.actions;
export default payoutSlice.reducer;
