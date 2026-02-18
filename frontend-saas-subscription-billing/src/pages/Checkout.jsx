import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPlans } from '../features/plans/planSlice';
import { initiateSubscription, activateSubscription, resetSubscription } from '../features/subscriptions/subscriptionSlice';
import { CreditCard, ShieldCheck, CheckCircle2, Loader2, AlertCircle, ArrowLeft, Zap, Sparkles } from 'lucide-react';

const Checkout = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [selectedGateway, setSelectedGateway] = useState('razorpay');

    const { plans } = useSelector((state) => state.plans);
    const { user } = useSelector((state) => state.auth);
    const { isLoading, isError, message } = useSelector((state) => state.subscription);

    const plan = plans.find((p) => p.id.toString() === planId);

    useEffect(() => {
        if (plans.length === 0) dispatch(getPlans());

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            dispatch(resetSubscription());
        };
    }, [dispatch, plans.length]);

    const handlePayment = async () => {
        if (selectedGateway === 'razorpay') {
            try {
                const resultAction = await dispatch(initiateSubscription(planId));
                if (initiateSubscription.fulfilled.match(resultAction)) {
                    const orderData = resultAction.payload;
                    const options = {
                        key: orderData.key,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: orderData.name,
                        description: orderData.description,
                        order_id: orderData.orderId,
                        handler: async (response) => {
                            const activationData = {
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                            };
                            const activateResult = await dispatch(activateSubscription(activationData));
                            if (activateSubscription.fulfilled.match(activateResult)) navigate('/dashboard');
                        },
                        prefill: { name: user.name, email: user.email },
                        theme: { color: '#2563eb' },
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }
            } catch (err) {
                console.error('Payment initiation failed:', err);
            }
        } else {
            alert('Paynpro integration coming soon!');
        }
    };

    if (!plan) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
        );
    }

    const gateways = [
        { id: 'razorpay', icon: <CreditCard size={18} />, name: 'Razorpay', sub: 'Cards · Netbanking · UPI' },
        { id: 'paynpro', icon: <Zap size={18} />, name: 'Paynpro', sub: 'Global payments gateway' },
    ];

    return (
        <div className="min-h-screen  flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-4xl">

                {/* Back */}
                <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium mb-10 transition-colors group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to plans
                </button>

                {/* Headline */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-1">
                        Complete your order
                    </h1>
                    <p className="text-slate-500 text-sm">Review your plan and choose a payment method.</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* ── Left: Plan card ── */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

                        {/* Header */}
                        <div className="bg-blue-600 px-7 py-6 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

                            <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">
                                <Sparkles size={10} />
                                Selected Plan
                            </div>
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                                    <p className="text-blue-200 text-sm mt-1">{plan.description}</p>
                                </div>
                                <div className="text-right ml-4 shrink-0">
                                    <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                                    <p className="text-blue-300 text-xs mt-0.5">per {plan.billingCycle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <ul className="px-7 py-5 flex flex-col gap-3.5">
                            {plan.features.slice(0, 4).map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={12} className="text-blue-600" />
                                    </span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Security strip */}
                        <div className="mx-6 mb-6 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                            <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Your payment is processed securely. We never store card details on our servers.
                            </p>
                        </div>
                    </div>

                    {/* ── Right: Payment card ── */}
                    <div className="bg-white rounded-2xl border border-slate-200 px-7 py-7 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-5">Payment method</h3>

                        {/* Gateways */}
                        <div className="flex flex-col gap-3 mb-7">
                            {gateways.map((gw) => {
                                const active = selectedGateway === gw.id;
                                return (
                                    <label
                                        key={gw.id}
                                        className={`flex items-center gap-4 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all
                                            ${active
                                                ? 'border-blue-600 bg-blue-50/60'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gateway"
                                            value={gw.id}
                                            checked={active}
                                            onChange={(e) => setSelectedGateway(e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0
                                            ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {gw.icon}
                                        </span>
                                        <span className="flex-1">
                                            <span className="block text-sm font-semibold text-slate-900">{gw.name}</span>
                                            <span className="block text-xs text-slate-500 mt-0.5">{gw.sub}</span>
                                        </span>
                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                                            ${active ? 'border-blue-600' : 'border-slate-300'}`}>
                                            {active && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-5">
                            <span className="flex-1 h-px bg-slate-100" />
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Order total</span>
                            <span className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Total row */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm text-slate-500">{plan.name} · {plan.billingCycle}</span>
                            <span className="text-2xl font-bold text-slate-900">₹{plan.price}</span>
                        </div>

                        {/* Error */}
                        {isError && (
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
                                <AlertCircle size={15} />
                                {message}
                            </div>
                        )}

                        {/* Pay button */}
                        <button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60
                                text-white font-semibold text-base py-4 rounded-xl transition-all
                                shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2.5"
                        >
                            {isLoading
                                ? <Loader2 className="animate-spin" size={18} />
                                : `Pay ₹${plan.price}`}
                        </button>

                        <p className="text-center text-xs text-slate-400 mt-4">
                            By continuing you agree to our Terms of Service
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;