import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

export default function ResetPasswordTab({ token, onResetComplete }) {
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            if (!res.ok) throw new Error(await res.text());
            setMessage('Password reset successful. You can now log in.');
            setTimeout(onResetComplete, 3000); // Redirect after 3 seconds
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-12">
            <h2 className="text-xl font-bold text-indigo-700 mb-4">Set New Password</h2>
            {error && <p className="text-red-500 font-semibold mb-4 bg-red-50 p-3 rounded">{error}</p>}
            {message && <p className="text-emerald-600 font-semibold mb-4 bg-emerald-50 p-3 rounded">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-gray-600">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" required minLength="6" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}