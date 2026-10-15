import React, { useState, useEffect } from 'react';
import BirthChartTab from './tabs/BirthChartTab';
import PanchangTab from './tabs/PanchangTab';
import ProfilesTab from './tabs/ProfilesTab';
import ResetPasswordTab from './tabs/ResetPasswordTab';
import AuthModal from './components/AuthModal';

export default function App() {
    const [activeTab, setActiveTab] = useState('chart');
    const [chartResult, setChartResult] = useState(null);
    const [profileToLoad, setProfileToLoad] = useState(null);

    const [user, setUser] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // NEW: State for checking if we are in a "Password Reset" flow
    const [resetToken, setResetToken] = useState(null);

    useEffect(() => {
        // 1. Check for logged-in user
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch (e) { console.error("Failed to parse user"); }
        }

        // 2. Check URL for password reset token
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            setResetToken(tokenFromUrl);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setActiveTab('chart');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center mb-6">
                <h1 className="text-2xl font-extrabold text-indigo-700">AstroPlatform</h1>
                <div>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="font-semibold text-gray-700">Welcome, {user.fullName}</span>
                            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-bold ml-4 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded transition-colors">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition-colors">
                            Sign In / Register
                        </button>
                    )}
                </div>
            </header>

            <div className="max-w-6xl mx-auto space-y-6 px-8 pb-8">

                {resetToken ? (
                    /* Render ONLY the reset password screen if there is a token in the URL */
                    <ResetPasswordTab
                        token={resetToken}
                        onResetComplete={() => {
                            setResetToken(null);
                            window.history.replaceState({}, document.title, "/"); // Clear the token from the URL bar
                            setIsAuthModalOpen(true); // Pop open the login modal
                        }}
                    />
                ) : (
                    /* Render normal application tabs */
                    <>
                        <div className="flex space-x-4 border-b border-gray-300 pb-2 overflow-x-auto">
                            {['chart', 'panchang', 'profiles'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-lg font-bold pb-2 px-4 whitespace-nowrap transition-colors capitalize ${
                                        activeTab === tab ? 'border-b-4 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:text-indigo-500'
                                    }`}
                                >
                                    {tab === 'profiles' ? 'Saved Profiles' : `${tab} Tab`}
                                </button>
                            ))}
                        </div>

                        <div className="animate-fadeIn">
                            {activeTab === 'chart' && (
                                <BirthChartTab
                                    chartResult={chartResult} setChartResult={setChartResult}
                                    profileToLoad={profileToLoad} setProfileToLoad={setProfileToLoad}
                                    user={user} onRequireAuth={() => setIsAuthModalOpen(true)}
                                />
                            )}
                            {activeTab === 'panchang' && <PanchangTab />}
                            {activeTab === 'profiles' && (
                                <ProfilesTab
                                    user={user} onRequireAuth={() => setIsAuthModalOpen(true)}
                                    onLoadProfile={(data) => { setProfileToLoad(data); setActiveTab('chart'); }}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={(userData) => setUser(userData)} />
        </div>
    );
}