import React from 'react';

export default function NorthIndianChart({ chartData }) {
    if (!chartData || !chartData.planets) return null;

    // Group planets by house number (1 to 12)
    const planetsByHouse = {};
    chartData.planets.forEach(p => {
        if (!planetsByHouse[p.houseNumber]) planetsByHouse[p.houseNumber] = [];
        planetsByHouse[p.houseNumber].push(p.name.substring(0, 2) + (p.isRetrograde ? 'R' : ''));
    });

    // Calculate which zodiac sign falls in each house, based on the Ascendant
    const ascSign = chartData.ascendantSignNumber;
    const getSignForHouse = (houseNum) => ((ascSign + houseNum - 2) % 12) + 1;

    // X, Y coordinates for the text inside the 12 houses
    const houseCenters = {
        1: { x: 200, y: 100 }, 2: { x: 100, y: 50 },
        3: { x: 50, y: 100 },  4: { x: 100, y: 200 },
        5: { x: 50, y: 300 },  6: { x: 100, y: 350 },
        7: { x: 200, y: 300 }, 8: { x: 300, y: 350 },
        9: { x: 350, y: 300 }, 10: { x: 300, y: 200 },
        11: { x: 350, y: 100 }, 12: { x: 300, y: 50 }
    };

    return (
        <div className="w-full max-w-md mx-auto aspect-square bg-white border-2 border-red-800 relative">
            <svg viewBox="0 0 400 400" className="w-full h-full stroke-red-800 stroke-2 fill-none">
                {/* Outer Box */}
                <rect x="0" y="0" width="400" height="400" />
                {/* Diagonals */}
                <line x1="0" y1="0" x2="400" y2="400" />
                <line x1="0" y1="400" x2="400" y2="0" />
                {/* Inner Diamond */}
                <polygon points="200,0 400,200 200,400 0,200" />

                {/* Labels (Planets & Zodiac Signs) */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => (
                    <g key={house} transform={`translate(${houseCenters[house].x}, ${houseCenters[house].y})`} className="stroke-none">
                        {/* Zodiac Sign Number */}
                        <text x="0" y="-15" textAnchor="middle" className="text-xs fill-gray-400 font-semibold">
                            {getSignForHouse(house)}
                        </text>
                        {/* Planets in the house */}
                        <text x="0" y="5" textAnchor="middle" className="text-sm fill-gray-900 font-bold leading-tight">
                            {planetsByHouse[house]?.join(', ')}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}