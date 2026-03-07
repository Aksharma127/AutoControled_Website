import { useEffect, useState } from 'react';
import { KineticCard } from '../components/KineticCard';
import { ScatterPlot } from '../components/ScatterPlot';

function VelocityTracker() {
    const [velocity, setVelocity] = useState(0);

    useEffect(() => {
        let lastTime = performance.now();
        let lastX = 0;
        let lastY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const now = performance.now();
            const dt = Math.max(now - lastTime, 1);
            if (dt < 50) return; // throttle slightly

            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // px/sec
            const v = (dist / dt) * 1000;
            setVelocity(Math.round(v));

            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = now;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-6 border border-white/20 bg-black/20 rounded-2xl">
            <span className="text-gray-500 text-xs font-mono mb-2 uppercase tracking-widest">Live Saccade Tracker</span>
            <span className="text-[#00F0FF] text-4xl font-black font-mono shadow-[#00F0FF]/20 drop-shadow-md">
                {velocity} <span className="text-xl">px/s</span>
            </span>
        </div>
    );
}

const FlowArrow = () => <div className="text-[#FF007A] font-bold text-xl px-2">→</div>;
const FlowNode = ({ title, active }: { title: string, active?: boolean }) => (
    <div className={`shrink-0 flex items-center justify-center px-6 py-4 rounded-xl font-mono text-sm tracking-wide ${active ? 'bg-[#7000FF] text-white shadow-[0_0_20px_#7000FF]' : 'bg-white/40 text-gray-800 border border-white/80'}`}>
        {title}
    </div>
);

export function Technology() {
    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-inter pt-28 pb-20 px-4 md:px-12 relative overflow-hidden">
            <header className="max-w-7xl mx-auto mb-10 w-full relative z-10 px-4">
                <p className="text-xs font-mono text-[#7000FF] tracking-widest font-bold mb-3">
                    THE ML PIPELINE // OBSERVABILITY_MATRIX
                </p>
                <h1 className="font-outfit font-black text-4xl md:text-6xl leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600">
                    Real-Time Sensor Aggregation and Heuristic Evolution.
                </h1>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                {/* Euclidean Velocity Formula Card */}
                <KineticCard mass={1} className="md:col-span-12 xl:col-span-5 flex flex-col justify-between">
                    <div>
                        <h2 className="font-outfit text-2xl font-black tracking-tight mb-2">Intent Thresholds</h2>
                        <p className="text-gray-600 font-light text-sm mb-6">
                            Micro-movements are ignored. Raw telemetry relies on computing aggressive intent trajectories using fundamental Euclidean geometry over time intervals.
                        </p>
                        <div className="p-4 mb-6 rounded-xl bg-black/5 border border-black/10 font-mono text-center flex items-center justify-center">
                            <span className="text-lg">
                                <span className="text-[#00F0FF]">V</span> = <span className="text-[#FF007A]">√</span>((x₂ - x₁)² + (y₂ - y₁)²) / (t₂ - t₁)
                            </span>
                        </div>
                    </div>
                    <VelocityTracker />
                </KineticCard>

                {/* HDBSCAN Scatter Plot Card */}
                <KineticCard mass={2} className="md:col-span-12 xl:col-span-7 flex flex-col justify-between overflow-visible">
                    <div>
                        <h2 className="font-outfit text-2xl font-black tracking-tight mb-2">HDBSCAN Architecture</h2>
                        <p className="text-gray-600 font-light text-sm mb-4">
                            Agglomerative clustering ignores sphere-based restrictions (unlike K-Means). Noise points are strictly labelled -1 allowing genuine behavior centroids to emerge organically over thousands of sessions.
                        </p>
                    </div>
                    <div className="h-full min-h-[300px] w-full mt-4 -mx-2 bg-black/90 rounded-3xl p-4 shadow-inner relative border border-white/20">
                        {/* We import the ScatterPlot dynamically */}
                        <ScatterPlot />
                    </div>
                </KineticCard>

                {/* The GRU Architecture Vector Mapping */}
                <KineticCard mass={1.5} className="md:col-span-12 flex flex-col gap-4">
                    <h2 className="font-outfit text-2xl font-black tracking-tight mb-2">GRU Sequence Embedder</h2>
                    <p className="text-gray-600 font-light text-sm max-w-3xl mb-4">
                        User behavior is sequential. Recurrent networks transform long strings of clicks, scrolls, and saccade velocities into a static 16D array representation viable for multi-dimensional clustering without length disparity limits.
                    </p>
                    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex items-center min-w-max">
                            <FlowNode title="Raw Telemetry" />
                            <FlowArrow />
                            <FlowNode title="Temporal Throttle" />
                            <FlowArrow />
                            <FlowNode title="GRU 16D Embed" />
                            <FlowArrow />
                            <FlowNode title="HDBSCAN Cloud" />
                            <FlowArrow />
                            <FlowNode title="Persona Policy ID" active />
                        </div>
                    </div>
                </KineticCard>
            </main>
        </div>
    );
}
