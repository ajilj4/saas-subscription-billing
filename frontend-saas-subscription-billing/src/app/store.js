import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import planReducer from '../features/plans/planSlice';
import subscriptionReducer from '../features/subscriptions/subscriptionSlice';
import payoutReducer from '../features/payouts/payoutSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        plans: planReducer,
        subscription: subscriptionReducer,
        payout: payoutReducer,
    },
});
