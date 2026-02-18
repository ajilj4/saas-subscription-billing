import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isSuccess || user) {
            navigate('/dashboard');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            // Logic for confirming passwords match
            // For now we can rely on thunk or simple local alert
            return;
        }
        const userData = { name, email, password };
        dispatch(register(userData));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-xl mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Create Account</h2>
                    <p className="text-gray-500 mt-2">Start your premium experience today</p>
                </div>

                {isError && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 flex items-center gap-3 text-green-700">
                        <CheckCircle2 size={20} />
                        <p className="text-sm font-medium">Account created successfully!</p>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="name">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                placeholder="John Doe"
                                onChange={onChange}
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                placeholder="you@example.com"
                                onChange={onChange}
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                placeholder="••••••••"
                                onChange={onChange}
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <CheckCircle2 size={18} />
                            </div>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                placeholder="••••••••"
                                onChange={onChange}
                                className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border ${password !== confirmPassword && confirmPassword !== '' ? 'border-red-300' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm`}
                                required
                            />
                        </div>
                        {password !== confirmPassword && confirmPassword !== '' && (
                            <p className="mt-1 text-xs text-red-500 font-medium">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (password !== confirmPassword && confirmPassword !== '')}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
