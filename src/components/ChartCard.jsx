import React from 'react';
import NorthIndianChart from '../charts/NorthIndianChart';

export default function ChartCard({ title, data, controls }) {
    if (!data) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-indigo-700">{title}</h3>
                {controls && controls}
            </div>
            <p className="text-sm mb-4 bg-indigo-50 inline-block px-3 py-1.5 rounded text-indigo-900 border border-indigo-100">
                Ascendant: <span className="font-bold">{data.ascendantSignName}</span> <span className="mx-1.5">•</span> <span className="font-semibold">{data.ascendantNakshatra}</span>
            </p>
            <div className="mb-6"><NorthIndianChart chartData={data} /></div>

            <div className="overflow-x-auto mt-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-100 text-sm">
                        <th className="p-2 border">Planet</th>
                        <th className="p-2 border">House</th>
                        <th className="p-2 border">Sign</th>
                        <th className="p-2 border">Degree</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="border-b text-sm bg-indigo-50/60 font-bold">
                        <td className="p-2 text-indigo-700">Lagna</td>
                        <td className="p-2">1</td>
                        <td className="p-2">{data.ascendantSignName}</td>
                        <td className="p-2">{data.ascendantFormattedDegree}</td>
                    </tr>
                    {data.planets.map((p) => (
                        <tr key={p.name} className="border-b text-sm hover:bg-gray-50">
                            <td className="p-2 font-semibold">{p.name} {p.isRetrograde ? '(R)' : ''}</td>
                            <td className="p-2">{p.houseNumber}</td>
                            <td className="p-2">{p.signName}</td>
                            <td className="p-2">{p.degrees}° {p.minutes}'</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}