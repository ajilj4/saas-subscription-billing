import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPlans } from '../features/plans/planSlice';
import { initiateSubscription, activateSubscription } from '../features/subscriptions/subscriptionSlice';
import { Check, Zap, Shield, Loader2, AlertCircle } from 'lucide-react';

const Pricing = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { plans, isLoading: plansLoading, isError: plansError, message: plansMessage } = useSelector(
        (state) => state.plans
    );
    const { user } = useSelector((state) => state.auth);
    const { isLoading: subLoading, isError: subError, message: subMessage } = useSelector(
        (state) => state.subscription
    );

    useEffect(() => {
        dispatch(getPlans());
    }, [dispatch]);

    const handleSubscription = (planId) => {
        navigate(`/checkout/${planId}`);
    };

    if (plansLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Simple Pricing</h2>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"> Choose the right plan for you</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Scale your business with our flexible subscription options. No hidden fees.
                    </p>
                </div>

                {(plansError || subError) && (
                    <div className="max-w-2xl mx-auto mb-10 p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700 rounded-lg">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{plansError ? plansMessage : subMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-3xl p-8 border ${plan.name.toLowerCase().includes('pro') ? 'border-2 border-blue-500 shadow-2xl scale-105' : 'border-gray-200 shadow-xl'
                                } transition-all hover:translate-y-[-8px]`}
                        >
                            {plan.name.toLowerCase().includes('pro') && (
                                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-4">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                        <Zap size={14} fill="currentColor" /> Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-500 text-sm h-10 line-clamp-2">{plan.description}</p>
                            </div>

                            <div className="flex items-baseline mb-8">
                                <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                                <span className="text-gray-500 ml-1">/{plan.billingCycle.toLowerCase()}</span>
                            </div>

                            <button
                                onClick={() => handleSubscription(plan.id)}
                                disabled={subLoading}
                                className={`w-full py-4 px-6 rounded-2xl font-bold transition-all mb-8 ${plan.name.toLowerCase().includes('pro')
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                    } flex items-center justify-center gap-2`}
                            >
                                {subLoading ? <Loader2 className="animate-spin" size={20} /> : 'Get Started'}
                            </button>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">What's included:</p>
                                <ul className="space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 bg-green-100 p-0.5 rounded-full">
                                                <Check size={14} className="text-green-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-gray-600 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <Shield size={14} />
                                    <span>Secure checkout via Razorpay</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
