import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPayouts, fetchPayoutBalance, getUsers, initiateManualPayout, resetPayout } from '../features/payouts/payoutSlice';
import DashboardNavbar from '../components/DashboardNavbar';
import {
    TrendingUp,
    Users as UsersIcon,
    Activity,
    Banknote,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Search,
    Filter,
    Download,
    Send,
    User as UserIcon,
    AlertTriangle
} from 'lucide-react';

const AdminPayoutDashboard = () => {
    const dispatch = useDispatch();
    const { payouts, balance, users, isLoading, isError, isSuccess, message } = useSelector((state) => state.payout);

    const [selectedUserEmail, setSelectedUserEmail] = useState('');
    const [manualAmount, setManualAmount] = useState('1');
    const [manualPurpose, setManualPurpose] = useState('Admin Manual Transfer');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGateway, setSelectedGateway] = useState('PAYNPRO');

    useEffect(() => {
        dispatch(getAllPayouts());
        dispatch(fetchPayoutBalance());
        dispatch(getUsers());
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess || isError) {
            const timer = setTimeout(() => {
                dispatch(resetPayout());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, isError, dispatch]);

    const handleManualTransfer = (e) => {
        e.preventDefault();
        if (!selectedUserEmail) return;
        dispatch(initiateManualPayout({
            email: selectedUserEmail,
            amount: manualAmount,
            purpose: manualPurpose,
            gateway: selectedGateway
        }));
    };

    const filteredUsers = users.filter(u =>
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return 'bg-green-100 text-green-700';
            case 'PROCESSING': return 'bg-blue-100 text-blue-700';
            case 'FAILED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Admin Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                            Admin Central
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Payout Management</h1>
                        <p className="text-gray-500 font-medium mt-1">Global monitoring for all system disbursements.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-500 hover:text-blue-600 shadow-sm transition-all">
                            <Download size={20} />
                        </button>
                        <button className="bg-white border border-gray-100 px-6 py-3 rounded-2xl text-gray-700 font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                            <Filter size={18} />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {/* PaynPro Balance Card */}
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl group-hover:scale-110 transition-transform">
                                <Banknote size={24} className="text-indigo-400" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">PaynPro Balance</p>
                            <h3 className="text-3xl font-black mb-2">₹{balance?.paynpro?.balance || '0.00'}</h3>
                            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                <TrendingUp size={16} />
                                <span>Real-time Sync</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                            <Activity size={200} />
                        </div>
                    </div>

                    {/* Razorpay Balance Card */}
                    <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-100 group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl group-hover:scale-110 transition-transform">
                                <Banknote size={24} className="text-blue-100" />
                            </div>
                            <p className="text-blue-200 font-bold uppercase text-[10px] tracking-widest mb-1">RazorpayX Balance</p>
                            <h3 className="text-3xl font-black mb-2">₹{(balance?.razorpay?.balance / 100).toFixed(2) || '0.00'}</h3>
                            <div className="flex items-center gap-2 text-blue-100 text-sm font-bold">
                                <TrendingUp size={16} />
                                <span>Enterprise Bank</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                            <Activity size={200} />
                        </div>
                    </div>

                    {/* Total Payouts Card */}
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <UsersIcon size={24} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total Payouts</p>
                        <h3 className="text-4xl font-black text-gray-900 mb-2">{payouts.length}</h3>
                        <p className="text-gray-500 text-sm font-medium">Global history</p>
                    </div>

                    {/* Pending Payouts Card */}
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Clock size={24} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Processing</p>
                        <h3 className="text-4xl font-black text-gray-900 mb-2">
                            {payouts.filter(p => p.status === 'PROCESSING' || p.status === 'PENDING').length}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium">Sync required</p>
                    </div>
                </div>

                {/* Manual Transfer Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Send size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Manual Transfer</h3>
                                <p className="text-gray-500 font-medium text-sm">Initiate an arbitrary payout to any platform user.</p>
                            </div>
                        </div>

                        <form onSubmit={handleManualTransfer} className="space-y-8">
                            {/* Merchant Choice */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Payout Merchant</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGateway('PAYNPRO')}
                                        className={`p-4 rounded-[24px] border-2 transition-all flex items-center justify-between group ${selectedGateway === 'PAYNPRO'
                                            ? 'border-indigo-600 bg-indigo-50/50'
                                            : 'border-gray-50 bg-gray-50/30 hover:border-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${selectedGateway === 'PAYNPRO' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
                                                }`}>
                                                PN
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-sm font-black ${selectedGateway === 'PAYNPRO' ? 'text-indigo-900' : 'text-gray-500'}`}>PaynPro</p>
                                                <p className="text-[10px] font-bold text-gray-400">Manual & Auto</p>
                                            </div>
                                        </div>
                                        {selectedGateway === 'PAYNPRO' && (
                                            <CheckCircle2 size={18} className="text-indigo-600" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedGateway('RAZORPAY')}
                                        className={`p-4 rounded-[24px] border-2 transition-all flex items-center justify-between group ${selectedGateway === 'RAZORPAY'
                                            ? 'border-blue-600 bg-blue-50/50'
                                            : 'border-gray-50 bg-gray-50/30 hover:border-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${selectedGateway === 'RAZORPAY' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
                                                }`}>
                                                RZ
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-sm font-black ${selectedGateway === 'RAZORPAY' ? 'text-blue-900' : 'text-gray-500'}`}>RazorpayX</p>
                                                <p className="text-[10px] font-bold text-gray-400">Enterprise Payout</p>
                                            </div>
                                        </div>
                                        {selectedGateway === 'RAZORPAY' && (
                                            <CheckCircle2 size={18} className="text-blue-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Search and Select User */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Recipient</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Search size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-600/10 transition-all mb-2"
                                        />
                                        <select
                                            value={selectedUserEmail}
                                            onChange={(e) => setSelectedUserEmail(e.target.value)}
                                            required
                                            className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600/10 transition-all"
                                        >
                                            <option value="">Choose User...</option>
                                            {filteredUsers.map(u => (
                                                <option key={u.id} value={u.email}>
                                                    {u.name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Amount (INR)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Banknote size={18} />
                                        </div>
                                        <input
                                            type="number"
                                            value={manualAmount}
                                            onChange={(e) => setManualAmount(e.target.value)}
                                            required
                                            min="1"
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600/10 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setManualAmount('1')}
                                            className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black hover:bg-gray-200 transition-colors"
                                        >
                                            1.00
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setManualAmount('10')}
                                            className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black hover:bg-gray-200 transition-colors"
                                        >
                                            10.00
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setManualAmount('100')}
                                            className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black hover:bg-gray-200 transition-colors"
                                        >
                                            100.00
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Purpose / Remark</label>
                                <input
                                    type="text"
                                    value={manualPurpose}
                                    onChange={(e) => setManualPurpose(e.target.value)}
                                    placeholder="Reason for transfer"
                                    className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-600/10 transition-all"
                                />
                            </div>

                            {/* Status Messages */}
                            {isSuccess && (
                                <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 size={20} />
                                    <span className="font-bold">{message}</span>
                                </div>
                            )}
                            {isError && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <span className="font-bold">{message}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !selectedUserEmail}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group/btn"
                            >
                                <Send size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                {isLoading ? 'PROCESSING...' : `TRANSFER ₹${manualAmount} NOW`}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8">
                            <div className="flex items-center gap-3 text-amber-700 mb-4">
                                <AlertTriangle size={24} />
                                <h4 className="font-black uppercase text-xs tracking-widest">Safety Check</h4>
                            </div>
                            <p className="text-amber-900/60 text-sm font-medium leading-relaxed">
                                Manual transfers are direct and non-reversible. Please verify the beneficiary bank account details before initiating.
                            </p>
                        </div>

                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Manual History</h4>
                            <div className="space-y-4">
                                {payouts.filter(p => p.payoutRef?.startsWith('MAN_')).slice(0, 3).map(p => (
                                    <div key={p.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">₹{p.amount}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{p.user?.email}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusColor(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                ))}
                                {payouts.filter(p => p.payoutRef?.startsWith('MAN_')).length === 0 && (
                                    <p className="text-sm text-gray-400 font-medium italic">No manual transfers yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900">Recent Transactions</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Ref or User..."
                                className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl font-bold text-sm w-80 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Payout Ref</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">User / Beneficiary</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-gray-900">{payout.payoutRef}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className={`w-3 h-3 rounded-full ${payout.gateway === 'RAZORPAY' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{payout.gateway}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-900">{payout.beneficiaryName}</p>
                                            <p className="text-xs text-gray-400 font-medium">{payout.user?.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black text-gray-900">₹{payout.amount}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(payout.status)}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                            {new Date(payout.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all">
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                                                    <Banknote size={32} />
                                                </div>
                                                <p className="text-gray-500 font-bold">No payout records found in the system.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPayoutDashboard;
