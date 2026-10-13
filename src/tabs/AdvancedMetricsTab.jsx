import React from 'react';
import ChartCard from '../components/ChartCard';

export default function AdvancedMetricsTab({ chartResult, onGoToChart }) {
    if (!chartResult) {
        return (
            <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
                <span className="text-4xl">📊</span>
                <h2 className="text-xl font-bold mt-4 text-gray-700">No Chart Data</h2>
                <p className="text-gray-500 mt-2">Generate a Birth Chart first to view advanced metrics.</p>
                <button onClick={onGoToChart} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-bold">
                    Go to Chart
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* JAIMINI SECTION */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-rose-200">
                <h3 className="text-lg font-bold mb-6 text-rose-700 flex items-center">✨ Jaimini Chara Karakas & Charts</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'Atma (AK)', value: chartResult.jaimini.atmakaraka, desc: 'Soul / Self' },
                        { label: 'Amatya (AmK)', value: chartResult.jaimini.amatyakaraka, desc: 'Career / Mind' },
                        { label: 'Bhratri (BK)', value: chartResult.jaimini.bhratrikaraka, desc: 'Siblings / Guru' },
                        { label: 'Matri (MK)', value: chartResult.jaimini.matrikaraka, desc: 'Mother / Education' },
                        { label: 'Pitri (PiK)', value: chartResult.jaimini.pitrikaraka, desc: 'Father / Ancestors' },
                        { label: 'Gnati (GK)', value: chartResult.jaimini.gnatikaraka, desc: 'Obstacles / Relatives' },
                        { label: 'Dara (DK)', value: chartResult.jaimini.darakaraka, desc: 'Spouse / Partnerships' },
                    ].map((k) => (
                        <div key={k.label} className="bg-rose-50 p-3 rounded border border-rose-100">
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{k.label}</p>
                            <p className="text-lg font-bold text-rose-900 leading-tight mt-1">{k.value}</p>
                            <p className="text-[10px] text-rose-500 mt-1">{k.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-rose-100 pt-6">
                    <ChartCard title="Swamsha Chart (D9 Planets on AK)" data={chartResult.divisionalCharts['Swamsha']} />
                    <ChartCard title="Karakamsha Chart (D1 Planets on AK)" data={chartResult.divisionalCharts['Karakamsha']} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ASHTAKVARGA */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-200 lg:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-amber-700 flex items-center">🔢 Ashtakvarga Tables</h3>
                        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded">BPHS Exact</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse text-sm">
                            <thead>
                            <tr className="bg-amber-50 border-b-2 border-amber-200">
                                <th className="p-2 text-left text-amber-900">Planet</th>
                                {["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"].map(s => (
                                    <th key={s} className="p-2 font-bold text-amber-800 w-10">{s}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((pName) => (
                                <tr key={pName} className="border-b hover:bg-amber-50/50">
                                    <td className="p-2 text-left font-bold text-gray-700">{pName}</td>
                                    {chartResult.ashtakvarga[pName].map((points, idx) => (
                                        <td key={`${pName}-${idx}`} className={`p-2 ${points >= 5 ? 'text-emerald-600 font-bold' : points <= 3 ? 'text-red-500' : 'text-gray-600'}`}>
                                            {points}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr className="bg-amber-100/50 border-t-2 border-amber-300">
                                <td className="p-3 text-left font-extrabold text-amber-900 uppercase tracking-wide">Total (SAV)</td>
                                {[0,1,2,3,4,5,6,7,8,9,10,11].map(colIdx => {
                                    const savTotal = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].reduce((sum, p) => sum + chartResult.ashtakvarga[p][colIdx], 0);
                                    return (
                                        <td key={`sav-${colIdx}`} className={`p-3 font-extrabold text-lg ${savTotal >= 30 ? 'text-emerald-700' : savTotal <= 24 ? 'text-red-600' : 'text-amber-800'}`}>
                                            {savTotal}
                                        </td>
                                    );
                                })}
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SHADBALA */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-sky-200 lg:col-span-3">
                    <h3 className="text-lg font-bold mb-2 text-sky-700 flex items-center">💪 Shadbala (6-Fold Strength)</h3>
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
                                <th className="p-3 border-b">Planet</th>
                                <th className="p-3 border-b text-right">Sthana</th>
                                <th className="p-3 border-b text-right">Dig</th>
                                <th className="p-3 border-b text-right">Kala</th>
                                <th className="p-3 border-b text-right">Chesta</th>
                                <th className="p-3 border-b text-right">Naisargika</th>
                                <th className="p-3 border-b text-right">Drik</th>
                                <th className="p-3 border-b text-right border-l-2 border-gray-300">Total (Rupas)</th>
                                <th className="p-3 border-b w-64">Strength vs Required</th>
                            </tr>
                            </thead>
                            <tbody>
                            {chartResult.shadbala.map((bala) => {
                                const percentOfRequired = (bala.totalRupas / bala.requiredRupas) * 100;
                                const isStrong = percentOfRequired >= 100;
                                const barColor = isStrong ? 'bg-emerald-500' : percentOfRequired > 75 ? 'bg-amber-400' : 'bg-red-400';

                                return (
                                    <tr key={bala.planet} className="border-b text-sm hover:bg-sky-50">
                                        <td className="p-3 font-bold text-gray-800">{bala.planet}</td>
                                        <td className="p-3 text-right text-gray-600">{bala.sthanaBala}</td>
                                        <td className="p-3 text-right text-gray-600">{bala.digBala}</td>
                                        <td className="p-3 text-right text-gray-600">{bala.kalaBala}</td>
                                        <td className="p-3 text-right text-gray-600">{bala.chestaBala}</td>
                                        <td className="p-3 text-right text-gray-600">{bala.naisargikaBala}</td>
                                        <td className="p-3 text-right text-gray-600">{bala.drikBala}</td>
                                        <td className="p-3 text-right font-extrabold text-sky-800 border-l-2 border-gray-200">
                                            {bala.totalRupas} <span className="text-[10px] font-normal text-gray-400">/ {bala.requiredRupas}</span>
                                        </td>
                                        <td className="p-3 align-middle pl-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className={`h-2.5 rounded-full ${barColor}`} style={{ width: `${Math.min(percentOfRequired, 100)}%` }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}