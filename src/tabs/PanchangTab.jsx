import React, { useState } from 'react';

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

export default function PanchangTab() {
    const today = new Date();
    const [form, setForm] = useState({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate(), location: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchingCity, setSearchingCity] = useState(false);

    const handleChange = (e) => {
        let { name, value } = e.target;
        let finalValue = (['year', 'month', 'day'].includes(name) && value !== '') ? Number(value) : value;

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
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en&format=json`);
            const data = await res.json();
            if (data.results) { setSuggestions(data.results); setShowSuggestions(true); } else setSuggestions([]);
        } catch (err) { console.error(err); } finally { setSearchingCity(false); }
    };

    const handleSelectCity = (city) => {
        const fullName = `${city.name}, ${city.admin1 || ''}, ${city.country}`.replace(', ,', ',');
        setForm({ ...form, location: fullName });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const response = await fetch('http://localhost:9090/api/panchang/daily', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
            });
            if (!response.ok) throw new Error('Panchang calculation failed.');
            setResult(await response.json());
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    const maxDays = form.month ? getMaxDays(form.month) : 31;
    const panchangTimeFields = [
        { name: 'year', label: 'Year', min: 1000, max: 3000 },
        { name: 'month', label: 'Month' },
        { name: 'day', label: 'Date', min: 1, max: maxDays }
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200">
                <h2 className="text-xl font-bold mb-4 text-orange-700">Check Daily Panchang</h2>
                {error && <p className="text-red-500 font-semibold mb-4 bg-red-50 p-3 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                    {panchangTimeFields.map((field) => (
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
                                <input type="number" name={field.name} value={form[field.name]} onChange={handleChange} min={field.min} max={field.max} className="border rounded px-3 py-2 w-24" required />
                            )}
                        </div>
                    ))}

                    <div className="flex flex-col flex-grow relative">
                        <label className="text-sm font-semibold text-gray-600 mb-1">
                            Location {searchingCity && <span className="text-xs text-orange-500 font-normal">(Searching...)</span>}
                        </label>
                        <input type="text" name="location" value={form.location} onChange={handleLocationChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} className="border rounded px-3 py-2 w-full" required autoComplete="off" />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded-md mt-1 z-50 max-h-60 overflow-y-auto">
                                {suggestions.map((city) => (
                                    <li key={city.id} onClick={() => handleSelectCity(city)} className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm border-b">
                                        <span className="font-semibold">{city.name}</span> <span className="text-gray-500">, {city.country}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50">
                        {loading ? 'Calculating...' : 'Get Panchang'}
                    </button>
                </form>
            </div>

            {result && (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
                    <div className="text-center border-b pb-6">
                        <h2 className="text-3xl font-bold text-gray-800">
                            {new Date(result.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h2>
                        <p className="text-lg text-gray-500 mt-2">{result.location}</p>
                        <div className="flex justify-center gap-6 mt-4 text-sm font-semibold text-gray-600">
                            <span className="flex items-center gap-1"><span className="text-yellow-500 text-lg">☀</span> Sunrise: {result.sunriseTime}</span>
                            <span className="flex items-center gap-1"><span className="text-indigo-500 text-lg">🌙</span> Sunset: {result.sunsetTime}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { title: "Vara (Day)", value: result.vara, color: "text-blue-600", bg: "bg-blue-50", desc: "Day of the week" },
                            { title: "Tithi", value: result.tithi, color: "text-purple-600", bg: "bg-purple-50", desc: "Lunar day" },
                            { title: "Nakshatra", value: result.nakshatra, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Lunar mansion" },
                            { title: "Yoga", value: result.yoga, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Luni-solar combination" },
                            { title: "Karana", value: result.karana, color: "text-rose-600", bg: "bg-rose-50", desc: "Half of Tithi" }
                        ].map((limb, i) => (
                            <div key={i} className={`${limb.bg} p-6 rounded-lg text-center shadow-sm border border-white/50`}>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">{limb.title}</h4>
                                <p className={`text-xl font-bold ${limb.color} mb-1`}>{limb.value}</p>
                                <p className="text-xs text-gray-400">{limb.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Planetary Positions (at Sunrise)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-gray-100 text-sm">
                                    <th className="p-2 border">Planet</th>
                                    <th className="p-2 border">Sign</th>
                                    <th className="p-2 border">Degree</th>
                                    <th className="p-2 border">Nakshatra (Pada)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {result.planets.map((p) => (
                                    <tr key={p.name} className="border-b text-sm hover:bg-gray-50">
                                        <td className="p-2 font-semibold text-gray-700">
                                            {p.name} {p.isRetrograde ? <span className="text-red-500 text-xs ml-1">(R)</span> : ''}
                                        </td>
                                        <td className="p-2">{p.signName}</td>
                                        <td className="p-2">{p.degrees}° {p.minutes}'</td>
                                        <td className="p-2">{p.nakshatraName} - P{p.nakshatraPada}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}