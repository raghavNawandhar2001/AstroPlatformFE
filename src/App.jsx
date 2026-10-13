import React, { useState } from 'react';
import BirthChartTab from './tabs/BirthChartTab';
import AdvancedMetricsTab from './tabs/AdvancedMetricsTab';
import PanchangTab from './tabs/PanchangTab';
import ProfilesTab from './tabs/ProfilesTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('chart');

  // Lifted state
  const [chartResult, setChartResult] = useState(null);
  const [profileToLoad, setProfileToLoad] = useState(null); // NEW: Tracks the profile clicked in the DB

  return (
      <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* TAB NAVIGATION */}
          <div className="flex space-x-4 border-b border-gray-300 pb-2 overflow-x-auto">
            {['chart', 'advanced', 'panchang', 'profiles'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-lg font-bold pb-2 px-4 whitespace-nowrap transition-colors capitalize ${
                        activeTab === tab ? 'border-b-4 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:text-indigo-500'
                    }`}
                >
                  {tab === 'advanced' ? 'Advanced Metrics' : tab === 'profiles' ? 'Saved Profiles' : `${tab} Tab`}
                </button>
            ))}
          </div>

          {/* TAB RENDERING */}
          <div className="animate-fadeIn">
            {activeTab === 'chart' && (
                <BirthChartTab
                    chartResult={chartResult}
                    setChartResult={setChartResult}
                    profileToLoad={profileToLoad}
                    setProfileToLoad={setProfileToLoad}
                />
            )}
            {activeTab === 'advanced' && (
                <AdvancedMetricsTab chartResult={chartResult} onGoToChart={() => setActiveTab('chart')} />
            )}
            {activeTab === 'panchang' && (
                <PanchangTab />
            )}
            {activeTab === 'profiles' && (
                <ProfilesTab onLoadProfile={(data) => {
                  setProfileToLoad(data); // Sends the data up
                  setActiveTab('chart');  // Switches to the chart tab
                }}/>
            )}
          </div>

        </div>
      </div>
  );
}