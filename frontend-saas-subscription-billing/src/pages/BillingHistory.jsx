import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentSubscription } from '../features/subscriptions/subscriptionSlice';
import DashboardNavbar from '../components/DashboardNavbar';
import { Receipt, Calendar, CreditCard, ArrowLeft, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BillingHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentSubscription } = useSelector((state) => state.subscription);

    useEffect(() => {
        dispatch(getCurrentSubscription());
    }, [dispatch]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Extract payments from current subscription (or mock if empty)
    const payments = currentSubscription?.payments || [];

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900">
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            Billing History <Receipt size={32} className="text-blue-600" />
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage and download your past invoices and payment receipts.</p>
                    </div>

                    <div className="bg-blue-600 text-white px-6 py-4 rounded-3xl shadow-lg flex items-center gap-4">
                        <ShieldCheck size={24} className="opacity-50" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Encryption</p>
                            <p className="font-bold">Bank-grade Security</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Date & Time</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Transaction ID</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Amount</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Method</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Status</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className="text-blue-500" />
                                                    <span className="text-gray-900 font-bold">{formatDate(payment.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-600">
                                                    {payment.txnId}
                                                </code>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-gray-900 font-black">₹{payment.amount}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 uppercase tracking-tighter text-xs font-black text-gray-500">
                                                    <CreditCard size={14} />
                                                    {payment.gateway}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${payment.status === 'SUCCESS'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 font-black text-sm flex items-center gap-2 ml-auto">
                                                    Download <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                                                    <History size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-bold text-lg">No transactions yet</p>
                                                    <p className="text-gray-500 text-sm">When you pay for a plan, it will appear here.</p>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/pricing')}
                                                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 uppercase tracking-widest"
                                                >
                                                    Explore Plans
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 bg-indigo-900 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-800 rounded-3xl flex items-center justify-center rotate-3">
                            <ShieldCheck size={32} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Secure Billing</h3>
                            <p className="text-indigo-300 text-sm font-medium">All our payments are processed securely via SSL encryption.</p>
                        </div>
                    </div>
                    <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2">
                        Update Payment Method <ExternalLink size={18} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default BillingHistory;
