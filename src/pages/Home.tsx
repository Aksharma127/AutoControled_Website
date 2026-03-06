import { motion } from 'framer-motion';
import type { BehaviorMode, PersonaId } from '../types';

interface HomeProps {
    persona: PersonaId;
    behaviorMode: BehaviorMode;
    isLoading: boolean;
    engagementScore: number;
    onPrimaryIntent: () => void;
    onSecondaryIntent: () => void;
}

const FEED = [
    ['PREDICTIVE LAYOUTS', 'Real-time grid reordering'],
    ['INTENT-DRIVEN CTAs', 'Maximizing conversion without friction'],
    ['ANONYMOUS USER RECOGNITION', 'Secure, cookieless identity matching'],
    ['AUTONOMOUS A/B COHORTS', 'Measuring lift before every rollout'],
    ['GEMINI CREATIVE DIRECTOR', 'Agentic optimization of design elements'],
    ['STABLE GRIDS & GUARDRAILS', 'Guaranteed layout integrity'],
];

function personaLabel(persona: PersonaId) {
    if (persona === 'bouncer') return 'HIGH_SPEED_SKIMMER';
    if (persona === 'reader') return 'DEEP_READER';
    if (persona === 'explorer') return 'BROAD_EXPLORER';
    return 'CALIBRATING';
}

function headlineByMode(mode: BehaviorMode) {
    if (mode === 'high_speed_skimmer') return 'Fast signal routing for rapid decisions.';
    if (mode === 'low_engagement') return 'Re-engagement flow activated with adaptive emphasis.';
    if (mode === 'high_intent') return 'Retention mode enabled for high-intent sessions.';
    return 'Predictive UI that anticipates user intent.';
}

export function Home({
    persona,
    behaviorMode,
    isLoading,
    engagementScore,
    onPrimaryIntent,
    onSecondaryIntent,
}: HomeProps) {
    const isSkimmer = behaviorMode === 'high_speed_skimmer';
    const isLowEngagement = behaviorMode === 'low_engagement';
    const isHighIntent = behaviorMode === 'high_intent';

    return (
        <div className="min-h-screen bg-[#07080c] text-white px-6 md:px-8 pb-12 pt-24">
            <header className="max-w-7xl mx-auto mb-10">
                <p className="text-xs font-mono text-cyan-300/80 tracking-wider mb-3">
                    BAI_SYSTEM.V2 // UNLEASHING BEHAVIORAL INTELLIGENCE.
                </p>
                <h1 className="font-outfit font-black text-4xl md:text-6xl leading-tight">
                    The First Fully Autonomous, Production-Grade UI Optimization Platform.
                </h1>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[130px]">
                <section className="md:col-span-4 md:row-span-1 rounded-2xl border border-white/15 bg-black/30 p-5">
                    <p className="text-xs font-mono text-emerald-300 mb-2">SYSTEM STATUS: OPERATIONAL</p>
                    <p className="text-xs font-mono text-white/80">
                        USER PERSONA: {personaLabel(persona)}
                    </p>
                    <p className="text-xs font-mono text-white/80">
                        ENGAGEMENT: {engagementScore}%
                    </p>
                    <p className="text-xs font-mono text-white/80 mb-3">
                        IDENTIFICATION: cookieless hash verified
                    </p>
                    <div className="h-8 flex items-end gap-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-1 rounded-full bg-cyan-300/80"
                                animate={{ height: [6, 22, 8, 26, 10] }}
                                transition={{
                                    duration: 1.8 + i * 0.08,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: i * 0.04,
                                }}
                            />
                        ))}
                    </div>
                </section>

                <section
                    className={`rounded-2xl border border-white/15 bg-black/30 p-6 ${
                        isSkimmer ? 'md:col-span-4 md:row-span-2' : 'md:col-span-8 md:row-span-2'
                    }`}
                >
                    <h2 className="font-outfit text-2xl md:text-3xl font-bold mb-3">
                        {headlineByMode(behaviorMode)}
                    </h2>
                    <p className="text-white/70 max-w-3xl">
                        Our system replaces manual data analysis departments with an automated
                        feedback loop. No more A/B testing. Just seamless, incremental optimization
                        bounded by strict safety guardrails.
                    </p>
                    <div className="mt-6 h-24 rounded-xl border border-white/10 bg-white/5 relative overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 w-10 bg-cyan-300/20"
                            animate={{ x: ['0%', '520%', '0%'] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:22px_22px]" />
                    </div>
                </section>

                <section className="md:col-span-12 md:row-span-3 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h3 className="text-lg font-outfit font-semibold mb-4">Visual Intelligence Feed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {FEED.map(([title, desc]) => (
                            <article
                                key={title}
                                className="rounded-xl p-4 border border-white/10 bg-white/[0.03]"
                            >
                                <p className="text-xs font-mono text-cyan-200 mb-2">{title}</p>
                                <p className="text-sm text-white/70">{desc}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="md:col-span-4 md:row-span-2 rounded-2xl border border-white/15 bg-black/30 p-4">
                    <div className="grid grid-cols-2 gap-3 h-full">
                        <button
                            onClick={onPrimaryIntent}
                            className={`rounded-xl p-4 text-left border transition ${
                                isLowEngagement
                                    ? 'border-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.35)]'
                                    : 'border-white/15'
                            } bg-white/5 hover:bg-white/10`}
                        >
                            <p className="text-xs font-mono text-cyan-200 mb-2">Card A (Primary)</p>
                            <p className="font-semibold">
                                {isHighIntent ? 'VIEW ANALYTICS DASHBOARD' : 'DEPLOY EXPERIMENT'}
                            </p>
                        </button>
                        <button
                            onClick={onSecondaryIntent}
                            className="rounded-xl p-4 text-left border border-white/15 bg-white/5 hover:bg-white/10 transition"
                        >
                            <p className="text-xs font-mono text-cyan-200 mb-2">Card B (Secondary)</p>
                            <p className="font-semibold">REQUEST SYSTEM ADVISORY</p>
                        </button>
                    </div>
                </section>

                {isSkimmer && (
                    <section className="md:col-span-4 md:row-span-1 rounded-2xl border border-white/15 bg-black/30 p-4">
                        <p className="text-xs font-mono text-amber-300 mb-3">SKIMMER QUICK EXITS</p>
                        <div className="flex flex-wrap gap-2">
                            {['Open API', 'Jump to Cases', 'Get Summary', 'Request Demo'].map((x) => (
                                <button
                                    key={x}
                                    className="px-3 py-1.5 rounded-lg text-xs border border-white/15 bg-white/5 hover:bg-white/10"
                                >
                                    {x}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {isLoading && (
                    <section className="md:col-span-12 rounded-2xl border border-white/10 bg-white/5 h-16 animate-pulse" />
                )}
            </main>
        </div>
    );
}
