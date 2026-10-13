import React, { useState } from 'react';

export default function DashaTreeItem({ dasha, level = 1 }) {
    const isRunning = dasha.active;
    const [expanded, setExpanded] = useState(isRunning);
    const hasChildren = dasha.subPeriods && dasha.subPeriods.length > 0;

    const levelConfig = {
        1: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Maha' },
        2: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Antar' },
        3: { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Pratyantar' },
        4: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Sookshma' },
        5: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Prana' }
    };
    const style = levelConfig[level] || levelConfig[5];

    return (
        <div className="mt-1">
            <div
                onClick={() => hasChildren && setExpanded(!expanded)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border ${style.bg} ${hasChildren ? 'cursor-pointer hover:shadow-sm' : ''} transition-all ${isRunning ? `border-l-4 border-l-emerald-500 shadow-md` : style.border}`}
            >
                <div className="flex items-center space-x-3">
                    <span className="w-5 flex justify-center text-gray-400">{hasChildren ? (expanded ? '▼' : '▶') : '•'}</span>
                    <span className={`font-bold ${style.color} w-24 ${isRunning ? 'text-emerald-800' : ''}`}>{dasha.planet}</span>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold bg-white px-2 py-1 rounded shadow-sm">{style.label}</span>
                    {isRunning && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded shadow-sm">Current</span>}
                </div>
                <div className={`flex space-x-4 mt-2 sm:mt-0 text-sm font-medium pl-8 sm:pl-0 ${isRunning ? 'text-emerald-700 font-bold' : 'text-gray-600'}`}>
                    <span className="w-36">{dasha.startDate}</span><span className="text-gray-300">➔</span><span className="w-36">{dasha.endDate}</span>
                </div>
            </div>
            {expanded && hasChildren && (
                <div className={`ml-6 pl-4 mt-1 space-y-1 ${isRunning ? 'border-l-2 border-emerald-300' : 'border-l-2 border-gray-200'}`}>
                    {dasha.subPeriods.map((sub, idx) => (
                        <DashaTreeItem key={`${level}-${idx}`} dasha={sub} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}