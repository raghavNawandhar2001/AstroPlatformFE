import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ email: '', password: '', fullName: '', phoneNumber: '', age: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === 'age' && value !== '' ? Number(value) : value });
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setResetMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email })
            });
            if (!res.ok) throw new Error('Failed to send reset link.');
            setResetMessage(await res.text());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error(await res.text() || 'Authentication failed');

            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            onLoginSuccess(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isForgotPassword) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative animate-fadeIn">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
                    <h2 className="text-2xl font-bold mb-4 text-indigo-700">Reset Password</h2>

                    {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-semibold">{error}</p>}
                    {resetMessage && <p className="bg-emerald-50 text-emerald-600 p-3 rounded mb-4 text-sm font-semibold">{resetMessage}</p>}

                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Email Address</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded transition-colors mt-2">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm border-t pt-4">
                        <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); setResetMessage(''); }} className="text-indigo-600 font-bold hover:underline">
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">{isLogin ? 'Sign In' : 'Create an Account'}</h2>

                {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-semibold">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Full Name</label>
                                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-grow">
                                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                                    <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
                                </div>
                                <div className="w-24">
                                    <label className="text-sm font-semibold text-gray-600">Age</label>
                                    <input type="number" name="age" value={form.age} onChange={handleChange} min="1" max="120" className="w-full border rounded px-3 py-2 mt-1" required />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-sm font-semibold text-gray-600">Email Address</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600">Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2 mt-1" required />
                        {isLogin && (
                            <div className="text-right mt-1">
                                <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); }} className="text-xs text-indigo-600 font-semibold hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded transition-colors mt-4">
                        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-600 font-bold hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}