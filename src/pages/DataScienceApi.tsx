import { useEffect, useState } from 'react';
import { KineticCard } from '../components/KineticCard';



function SyncLatencyTracker() {
    const [latency, setLatency] = useState(240);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuate between 150 and 280ms
            const jitter = Math.floor(Math.random() * 40) - 20;
            setLatency(prev => {
                const next = prev + jitter;
                if (next > 300) return 290;
                if (next < 140) return 150;
                return next;
            });
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-6 border border-white/20 bg-black/20 rounded-2xl w-full h-full">
            <span className="text-gray-500 text-xs font-mono mb-2 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Latency
            </span>
            <span className="text-emerald-400 text-5xl font-black font-mono shadow-emerald-400/20 drop-shadow-md">
                {latency} <span className="text-xl">ms</span>
            </span>
        </div>
    );
}

export function DataScienceApi() {
    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-inter pt-28 pb-20 px-4 md:px-12 relative overflow-hidden">
            <header className="max-w-7xl mx-auto mb-10 w-full relative z-10 px-4">
                <p className="text-xs font-mono text-[#00F0FF] tracking-widest font-bold mb-3">
                    N8N ORCHESTRATION // AUTOMATED_UI_EVOLUTION
                </p>
                <h1 className="font-outfit font-black text-4xl md:text-6xl leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600">
                    Agentic Control Loop Execution.
                </h1>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                {/* Latency Tracker */}
                <KineticCard mass={0.5} className="md:col-span-12 xl:col-span-4 flex flex-col justify-between">
                    <div>
                        <h2 className="font-outfit text-2xl font-black tracking-tight mb-2">Network Sync</h2>
                        <p className="text-gray-600 font-light text-sm mb-6">
                            End-to-end webhook execution time from the browser telemetry payload into the generative processing queue.
                        </p>
                    </div>
                    <SyncLatencyTracker />
                </KineticCard>

                {/* Automation Flowchart */}
                <KineticCard mass={2} className="md:col-span-12 xl:col-span-8 flex flex-col justify-between relative overflow-hidden">
                    <h2 className="font-outfit text-2xl font-black tracking-tight mb-2">n8n Workflow Execution</h2>
                    <p className="text-gray-600 font-light text-sm mb-8 max-w-2xl">
                        The fully autonomous loop relies on a closed system without human intervention. Supabase webhooks trigger an n8n container logic tree that feeds clustered persona strings into Gemini Pro.
                    </p>

                    <div className="relative w-full h-[300px] flex items-center justify-between px-4 overflow-x-auto scrollbar-hide py-8">
                        {/* Background connecting SVG Line */}
                        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none">
                            <path
                                d="M 120 150 C 250 150, 350 70, 480 150 C 600 230, 700 70, 850 150"
                                fill="none"
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth="2"
                                strokeDasharray="6 6"
                                className="animate-[dash_20s_linear_infinite]"
                            />
                        </svg>

                        {/* Nodes */}
                        <div className="flex items-center gap-16 min-w-max">
                            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_20px_rgba(52,211,153,0.2)] z-10 backdrop-blur-md w-[200px]">
                                <span className="text-emerald-400 font-bold font-outfit text-center">Supabase Trigger</span>
                                <span className="text-gray-400 font-mono text-[10px] text-center mt-1">Webhook / HDBSCAN</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#00F0FF]/50 bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.2)] z-10 backdrop-blur-md w-[200px] mt-20">
                                <span className="text-[#00F0FF] font-bold font-outfit text-center">Gemini Pro Vision</span>
                                <span className="text-gray-400 font-mono text-[10px] text-center mt-1">Generative Structural Shift</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#FF007A]/50 bg-[#FF007A]/10 shadow-[0_0_20px_rgba(255,0,122,0.2)] z-10 backdrop-blur-md w-[200px] -mt-20">
                                <span className="text-[#FF007A] font-bold font-outfit text-center">Policy Generation</span>
                                <span className="text-gray-400 font-mono text-[10px] text-center mt-1">Pydantic JSON Verification</span>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#7000FF]/50 bg-[#7000FF]/10 shadow-[0_0_20px_rgba(112,0,255,0.2)] z-10 backdrop-blur-md w-[200px]">
                                <span className="text-[#7000FF] font-bold font-outfit text-center">Supabase Update</span>
                                <span className="text-gray-400 font-mono text-[10px] text-center mt-1">Live DB Injection</span>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes dash {
                            to {
                                stroke-dashoffset: -100;
                            }
                        }
                    `}</style>
                </KineticCard>

            </main>
        </div>
    );
}
