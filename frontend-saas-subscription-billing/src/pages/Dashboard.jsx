import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentSubscription } from '../features/subscriptions/subscriptionSlice';
import DashboardNavbar from '../components/DashboardNavbar';
import {
    Zap,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Calendar,
    CreditCard,
    History,
    ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentSubscription, isLoading } = useSelector((state) => state.subscription);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getCurrentSubscription());
    }, [dispatch]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your subscription and billing details below.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Active Subscription Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Zap size={120} strokeWidth={3} />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                                        Current Plan
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900">{currentSubscription?.plan?.name || 'No Active Plan'}</h2>
                                    <p className="text-gray-500 mt-2 font-medium">
                                        {currentSubscription?.plan?.description || 'You are not currently subscribed to any plan.'}
                                    </p>
                                </div>

                                {currentSubscription ? (
                                    <div className="bg-green-50 px-6 py-4 rounded-3xl border border-green-100 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Status</p>
                                            <p className="text-lg font-black text-green-900 uppercase">Active</p>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all flex items-center gap-2 group/btn"
                                    >
                                        UPGRADE NOW
                                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>

                            {currentSubscription && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Renews on</p>
                                            <p className="font-bold text-gray-900">{formatDate(currentSubscription?.endDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Amount</p>
                                            <p className="font-bold text-gray-900">₹{currentSubscription?.plan?.price} / {currentSubscription?.plan?.billingCycle}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions / Future Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
                                onClick={() => navigate('/billing-history')}
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <History size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Billing History</h3>
                                <p className="text-sm text-gray-500 font-medium">View all your past transactions and invoices.</p>
                            </div>
                            <div
                                onClick={() => navigate('/pricing')}
                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <ArrowUpRight size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Upgrade Plan</h3>
                                <p className="text-sm text-gray-500 font-medium">Get more features and increase your limits.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Mini Info / Support */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-4">Need help? 🚀</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                    Our support team is available 24/7 to help you with any subscription or billing queries.
                                </p>
                                <button className="w-full bg-white text-slate-900 py-3 rounded-2xl font-bold hover:bg-slate-100 transition-colors">
                                    Contact Support
                                </button>
                            </div>
                            <div className="absolute -bottom-10 -right-10 opacity-10">
                                <AlertCircle size={150} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Account Details</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-bold uppercase tracking-tight">Email</span>
                                    <span className="text-sm font-bold text-gray-900">{user?.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-bold uppercase tracking-tight">Role</span>
                                    <span className="text-sm font-bold text-gray-900 uppercase">{user?.role || 'User'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
