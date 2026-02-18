import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset as authReset } from '../features/auth/authSlice';
import { Zap, LogOut, User, LayoutDashboard, CreditCard } from 'lucide-react';

const DashboardNavbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(authReset());
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Zap size={18} className="text-white fill-current" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">SaaS Dashboard</span>
                        </div>

                        <div className="hidden md:flex items-center gap-6 ml-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-blue-600 font-medium text-sm flex items-center gap-2"
                            >
                                <LayoutDashboard size={16} /> Overview
                            </button>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="text-gray-600 hover:text-blue-600 font-medium text-sm flex items-center gap-2"
                            >
                                <Zap size={16} /> Plans
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                            <span className="text-xs text-gray-500">{user?.email}</span>
                        </div>

                        <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                            <User size={20} />
                        </div>

                        <button
                            onClick={onLogout}
                            className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
