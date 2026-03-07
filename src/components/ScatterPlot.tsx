import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export function ScatterPlot() {
    const [liveDot, setLiveDot] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Move the glow dot randomly to simulate real-time shifting between clusters
        const interval = setInterval(() => {
            setLiveDot({
                x: (Math.random() * 60) - 30,
                y: (Math.random() * 60) - 30,
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const data = {
        datasets: [
            {
                label: 'Cluster -1 (Noise)',
                data: Array.from({ length: 40 }).map(() => ({
                    x: (Math.random() * 80) - 40,
                    y: (Math.random() * 80) - 40,
                })),
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                pointRadius: 3,
            },
            {
                label: 'Skimmer Cluster',
                data: Array.from({ length: 50 }).map(() => ({
                    x: 20 + Math.random() * 15,
                    y: 20 + Math.random() * 15,
                })),
                backgroundColor: 'rgba(0, 240, 255, 0.5)',
                pointRadius: 4,
            },
            {
                label: 'Reader Cluster',
                data: Array.from({ length: 50 }).map(() => ({
                    x: -20 + Math.random() * 10,
                    y: -15 + Math.random() * 12,
                })),
                backgroundColor: 'rgba(255, 0, 122, 0.5)',
                pointRadius: 4,
            },
            {
                label: 'Active Session',
                data: [liveDot],
                backgroundColor: 'rgba(112, 0, 255, 1)',
                pointRadius: 12,
                pointHoverRadius: 15,
                pointBorderColor: 'rgba(0, 240, 255, 0.8)',
                pointBorderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                display: false,
                min: -50,
                max: 50,
            },
            y: {
                display: false,
                min: -50,
                max: 50,
            },
        },
    };

    return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center relative">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]" />
            <Scatter options={options} data={data} className="relative z-10" />
        </div>
    );
}
