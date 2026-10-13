import React, { useState, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
import DashaTreeItem from '../components/DashaTreeItem';

const extractCurrentPath = (dashas) => {
    let path = [];
    let currentNodes = dashas;
    while (currentNodes && currentNodes.length > 0) {
        const activeNode = currentNodes.find(n => n.active === true);
        if (activeNode) {
            path.push(activeNode);
            currentNodes = activeNode.subPeriods;
        } else break;
    }
    return path;
};

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

export default function BirthChartTab({ chartResult, setChartResult, profileToLoad, setProfileToLoad }) {
    const [form, setForm] = useState({ name: '', gender: 'male', year: '', month: '', day: '', hour: '', minute: '', location: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedVarga, setSelectedVarga] = useState('D9');

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchingCity, setSearchingCity] = useState(false);

    useEffect(() => {
        if (profileToLoad) {
            setForm(profileToLoad);
            handleSubmit(null, profileToLoad);
            setProfileToLoad(null);
        }
    }, [profileToLoad]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        let finalValue = (['year', 'month', 'day', 'hour', 'minute'].includes(name) && value !== '') ? Number(value) : value;

        let updatedForm = { ...form, [name]: finalValue };

        // Day validation logic
        if (name === 'month' || name === 'day') {
            const currentMonth = name === 'month' ? finalValue : updatedForm.month;
            if (currentMonth) {
                const max = getMaxDays(currentMonth);
                if (updatedForm.day > max) updatedForm.day = max;
            }
        }
        setForm(updatedForm);
    };

    const handleLocationChange = async (e) => {
        const value = e.target.value;
        setForm({ ...form, location: value });

        if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
        setSearchingCity(true);
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en&format=json`);
            const data = await response.json();
            if (data.results) { setSuggestions(data.results); setShowSuggestions(true); } else setSuggestions([]);
        } catch (err) { console.error(err); } finally { setSearchingCity(false); }
    };

    const handleSelectCity = (city) => {
        const fullName = `${city.name}, ${city.admin1 || ''}, ${city.country}`.replace(', ,', ',');
        setForm({ ...form, location: fullName });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e, directData = null) => {
        if (e) e.preventDefault();
        setLoading(true); setError(''); setSuccessMsg('');
        const dataToSend = directData || form;

        try {
            const response = await fetch('http://localhost:9090/api/chart/d1', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend),
            });
            if (!response.ok) throw new Error('Failed to fetch chart data.');
            setChartResult(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveProfileToDb = async () => {
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            const response = await fetch('http://localhost:9090/api/profiles', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
            });
            if (!response.ok) throw new Error('Failed to save profile.');
            setSuccessMsg('Profile saved successfully!');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    const maxDays = form.month ? getMaxDays(form.month) : 31;
    const chartTimeFields = [
        { name: 'year', label: 'Year', min: 1000, max: 3000 },
        { name: 'month', label: 'Month' },
        { name: 'day', label: 'Date', min: 1, max: maxDays },
        { name: 'hour', label: 'Hour', min: 0, max: 23 },
        { name: 'minute', label: 'Minute', min: 0, max: 59 }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {error && <p className="text-red-500 font-semibold bg-red-50 p-4 rounded border border-red-200">{error}</p>}
            {successMsg && <p className="text-emerald-600 font-semibold bg-emerald-50 p-4 rounded border border-emerald-200">{successMsg}</p>}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-indigo-700">Birth Details</h2>

                <form onSubmit={(e) => handleSubmit(e, null)} className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col flex-grow">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Gender</label>
                        <select name="gender" value={form.gender} onChange={handleChange} className="border rounded px-3 py-2 bg-white">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {chartTimeFields.map((field) => (
                        <div key={field.name} className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-600 mb-1">{field.label}</label>
                            {field.name === 'month' ? (
                                <select name="month" value={form.month} onChange={handleChange} className="border rounded px-3 py-2 w-32 bg-white" required>
                                    <option value="" disabled>Select Month</option>
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input type="number" name={field.name} value={form[field.name]} onChange={handleChange} min={field.min} max={field.max} className="border rounded px-3 py-2 w-20" required />
                            )}
                        </div>
                    ))}

                    <div className="flex flex-col flex-grow relative">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Location {searchingCity && <span className="text-xs text-indigo-500 font-normal">(Searching...)</span>}</label>
                        <input type="text" name="location" value={form.location} onChange={handleLocationChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} className="border rounded px-3 py-2 w-full" required autoComplete="off" />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 bg-white border shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
                                {suggestions.map((city) => (
                                    <li key={city.id} onClick={() => handleSelectCity(city)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b">
                                        <span className="font-semibold text-gray-800">{city.name}</span><span className="text-gray-500 ml-1">{city.country}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2">
                        <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 flex-grow">
                            {loading ? 'Calculating...' : 'Generate Chart'}
                        </button>
                        <button type="button" onClick={saveProfileToDb} disabled={loading || !form.name || !form.location} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50">
                            Save to DB
                        </button>
                    </div>
                </form>
            </div>

            {chartResult && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="D1 Rashi Chart" data={chartResult.divisionalCharts['D1']} />
                        <ChartCard
                            title="Divisional Charts"
                            data={chartResult.divisionalCharts[selectedVarga]}
                            controls={
                                <select
                                    value={selectedVarga}
                                    onChange={(e) => setSelectedVarga(e.target.value)}
                                    className="border border-purple-300 text-purple-800 bg-purple-50 rounded px-3 py-1 text-sm font-bold cursor-pointer outline-none"
                                >
                                    {Object.keys(chartResult.divisionalCharts)
                                        .filter(key => key !== 'D1' && key !== 'Swamsha' && key !== 'Karakamsha')
                                        .map(key => (<option key={key} value={key}>{key} Chart</option>))
                                    }
                                </select>
                            }
                        />
                    </div>

                    <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 rounded-lg shadow-md text-white">
                        <h3 className="text-xl font-bold mb-6 flex items-center"><span className="text-2xl mr-2">⏱️</span> Currently Running Dasha</h3>
                        <div className="flex flex-col lg:flex-row gap-4">
                            {extractCurrentPath(chartResult.dashas).map((node, i) => {
                                const levelNames = ['Maha', 'Antar', 'Pratyantar', 'Sookshma', 'Prana'];
                                return (
                                    <div key={i} className="flex-1 bg-white/10 p-4 rounded-lg border border-white/20 backdrop-blur-sm relative">
                                        {i !== 4 && <div className="hidden lg:block absolute top-1/2 -right-4 w-4 border-t-2 border-dashed border-white/30 z-10"></div>}
                                        <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">{levelNames[i]}</p>
                                        <p className="text-2xl font-extrabold mb-2">{node.planet}</p>
                                        <div className="text-xs text-emerald-100/80 space-y-1">
                                            <p>From: {node.startDate.split(' ')[0]}</p>
                                            <p>To: {node.endDate.split(' ')[0]}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="mb-6"><h3 className="text-lg font-bold text-gray-800">All Dashas (120 Years)</h3></div>
                        <div className="border border-gray-200 rounded bg-gray-50/50 p-4 max-h-[700px] overflow-y-auto">
                            {chartResult.dashas.map((dasha, idx) => (
                                <DashaTreeItem key={idx} dasha={dasha} level={1} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}