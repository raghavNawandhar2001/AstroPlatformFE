import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const MONTHS = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

const getMaxDays = (month) => {
    const daysInMonth = { 1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
    return daysInMonth[month] || 31;
};

export default function ProfilesTab({ onLoadProfile }) {
    const [savedProfiles, setSavedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingProfile, setEditingProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Location Search State (for edit mode)
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchingCity, setSearchingCity] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles`);
            if (res.ok) setSavedProfiles(await res.json());
        } catch (err) {
            setError("Failed to fetch profiles from database.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}'s profile?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete profile');
            // Remove from UI without reloading
            setSavedProfiles(savedProfiles.filter(p => p.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // --- EDIT FORM HANDLERS ---
    const handleEditChange = (e) => {
        let { name, value } = e.target;
        let finalValue = (['year', 'month', 'day', 'hour', 'minute'].includes(name) && value !== '') ? Number(value) : value;

        let updatedProfile = { ...editingProfile, [name]: finalValue };

        // Day validation logic for edit mode
        if (name === 'month' || name === 'day') {
            const currentMonth = name === 'month' ? finalValue : updatedProfile.month;
            if (currentMonth) {
                const max = getMaxDays(currentMonth);
                if (updatedProfile.day > max) updatedProfile.day = max;
            }
        }
        setEditingProfile(updatedProfile);
    };

    const handleLocationChange = async (e) => {
        const value = e.target.value;
        setEditingProfile({ ...editingProfile, location: value });

        if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
        setSearchingCity(true);
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en&format=json`);
            const data = await res.json();
            if (data.results) { setSuggestions(data.results); setShowSuggestions(true); } else setSuggestions([]);
        } catch (err) { console.error(err); } finally { setSearchingCity(false); }
    };

    const handleSelectCity = (city) => {
        const fullName = `${city.name}, ${city.admin1 || ''}, ${city.country}`.replace(', ,', ',');
        setEditingProfile({ ...editingProfile, location: fullName });
        setShowSuggestions(false);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles/${editingProfile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProfile)
            });
            if (!res.ok) throw new Error('Failed to update profile');

            const updatedData = await res.json();
            // Update the UI array with the new data
            setSavedProfiles(savedProfiles.map(p => p.id === updatedData.id ? updatedData : p));
            setEditingProfile(null); // Close edit mode
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500 font-semibold">Loading profiles...</div>;
    }

    // --- EDIT MODE VIEW ---
    if (editingProfile) {
        const maxDays = editingProfile.month ? getMaxDays(editingProfile.month) : 31;
        const timeFields = [
            { name: 'year', label: 'Year', min: 1000, max: 3000 },
            { name: 'month', label: 'Month' },
            { name: 'day', label: 'Date', min: 1, max: maxDays },
            { name: 'hour', label: 'Hour', min: 0, max: 23 },
            { name: 'minute', label: 'Minute', min: 0, max: 59 }
        ];

        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-blue-700">Edit Profile</h2>
                    <button onClick={() => setEditingProfile(null)} className="text-gray-500 hover:text-gray-700 font-semibold text-sm">Cancel</button>
                </div>

                {error && <p className="text-red-500 font-semibold bg-red-50 p-3 rounded mb-4">{error}</p>}

                <form onSubmit={handleUpdateSubmit} className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col flex-grow min-w-[200px]">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Name</label>
                        <input type="text" name="name" value={editingProfile.name} onChange={handleEditChange} className="border rounded px-3 py-2 w-full" required />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Gender</label>
                        <select name="gender" value={editingProfile.gender} onChange={handleEditChange} className="border rounded px-3 py-2 bg-white">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {timeFields.map((field) => (
                        <div key={field.name} className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-600 mb-1">{field.label}</label>
                            {field.name === 'month' ? (
                                <select name="month" value={editingProfile.month} onChange={handleEditChange} className="border rounded px-3 py-2 w-32 bg-white" required>
                                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            ) : (
                                <input type="number" name={field.name} value={editingProfile[field.name]} onChange={handleEditChange} min={field.min} max={field.max} className="border rounded px-3 py-2 w-20" required />
                            )}
                        </div>
                    ))}

                    <div className="flex flex-col flex-grow relative min-w-[250px]">
                        <label className="text-sm font-semibold text-gray-600 mb-1">
                            Location {searchingCity && <span className="text-xs text-blue-500 font-normal">(Searching...)</span>}
                        </label>
                        <input type="text" name="location" value={editingProfile.location} onChange={handleLocationChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} className="border rounded px-3 py-2 w-full" required autoComplete="off" />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 bg-white border shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
                                {suggestions.map((city) => (
                                    <li key={city.id} onClick={() => handleSelectCity(city)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b">
                                        <span className="font-semibold text-gray-800">{city.name}</span><span className="text-gray-500 ml-1">{city.country}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="w-full mt-2">
                        <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 w-full sm:w-auto">
                            {saving ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
            <h2 className="text-xl font-bold mb-6 text-blue-700">Database Profiles</h2>

            {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

            {savedProfiles.length === 0 ? (
                <p className="text-gray-500 italic">No profiles saved yet. Calculate a chart and click "Save to Database".</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedProfiles.map((p) => (
                        <div key={p.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50 relative group">

                            {/* Action Buttons (Edit / Delete) */}
                            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingProfile(p)}
                                    className="p-1.5 bg-white border shadow-sm rounded text-gray-600 hover:text-blue-600 hover:border-blue-300"
                                    title="Edit Profile"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(p.id, p.name)}
                                    className="p-1.5 bg-white border shadow-sm rounded text-gray-600 hover:text-red-600 hover:border-red-300"
                                    title="Delete Profile"
                                >
                                    🗑️
                                </button>
                            </div>

                            <h3 className="font-bold text-lg text-gray-800 pr-16">
                                {p.name} <span className="text-sm font-normal text-gray-500 capitalize">({p.gender})</span>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                📅 {p.day}/{p.month}/{p.year} at {p.hour}:{p.minute.toString().padStart(2, '0')}
                            </p>
                            <p className="text-sm text-gray-600 mb-4 truncate pr-2">📍 {p.location}</p>

                            <button
                                onClick={() => onLoadProfile(p)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded text-sm w-full transition-colors"
                            >
                                Load & Calculate Chart
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}