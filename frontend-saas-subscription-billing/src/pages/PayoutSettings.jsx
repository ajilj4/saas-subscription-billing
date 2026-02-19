import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBankDetails, resetPayout, getPayoutHistory } from '../features/payouts/payoutSlice';
import DashboardNavbar from '../components/DashboardNavbar';
import {
    Banknote,
    User,
    CreditCard,
    Building2,
    Hash,
    Save,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PayoutSettings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { isLoading, isError, isSuccess, message } = useSelector((state) => state.payout);

    const [formData, setFormData] = useState({
        beneficiaryName: user?.payoutBeneficiaryName || '',
        accountNo: user?.payoutAccountNo || '',
        ifsc: user?.payoutIfsc || '',
        bankName: user?.payoutBankName || ''
    });

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                dispatch(resetPayout());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, dispatch]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(updateBankDetails(formData));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <DashboardNavbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-blue-600 border border-gray-100 shadow-sm transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payout Settings</h1>
                        <p className="text-gray-500 font-medium">Manage your bank details for automated payouts.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
                            <div className="relative z-10">
                                <ShieldCheck size={40} className="mb-6 opacity-80" />
                                <h3 className="text-xl font-bold mb-3">Secure Transfers</h3>
                                <p className="text-blue-100 text-sm leading-relaxed font-medium">
                                    Your bank details are encrypted and used only for processing subscription-related payouts.
                                </p>
                            </div>
                            <div className="absolute -bottom-6 -right-6 opacity-10">
                                <Banknote size={140} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Requirements</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-gray-500 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    Account must be active
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-500 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    IFSC code should be 11 characters
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-500 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    Correct Beneficiary Name
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                            <form onSubmit={onSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    {/* Beneficiary Name */}
                                    <div className="space-y-2 group">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Beneficiary Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <User size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                name="beneficiaryName"
                                                value={formData.beneficiaryName}
                                                onChange={onChange}
                                                required
                                                placeholder="Name as per bank records"
                                                className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Account Number */}
                                    <div className="space-y-2 group">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <Hash size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                name="accountNo"
                                                value={formData.accountNo}
                                                onChange={onChange}
                                                required
                                                placeholder="Enter bank account number"
                                                className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* IFSC */}
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                    <CreditCard size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="ifsc"
                                                    value={formData.ifsc}
                                                    onChange={onChange}
                                                    required
                                                    placeholder="SBIN00XXXX"
                                                    className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600/10 focus:bg-white uppercase transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Bank Name */}
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                    <Building2 size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="bankName"
                                                    value={formData.bankName}
                                                    onChange={onChange}
                                                    required
                                                    placeholder="State Bank of India"
                                                    className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isSuccess && (
                                    <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-bottom-2">
                                        <CheckCircle2 size={20} />
                                        <span className="font-bold">{message}</span>
                                    </div>
                                )}

                                {isError && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                                        <AlertCircle size={20} />
                                        <span className="font-bold">{message}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none translate-y-2 group/btn"
                                >
                                    {isLoading ? 'SAVING...' : (
                                        <>
                                            <Save size={22} className="group-hover/btn:scale-110 transition-transform" />
                                            SAVE BANK DETAILS
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PayoutSettings;
