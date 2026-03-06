import type { BehaviorMode } from '../types';

interface UseCasesProps {
    behaviorMode: BehaviorMode;
}

const CASES = [
    'CLIENT X (Retail) · Problem: High bounce on product pages. BAI Solution: Dynamic image scaling + focus mode. Result: +14% Conversion.',
    'CLIENT Y (SaaS) · Problem: Low free-trial signup. BAI Solution: Intent-driven CTA placement + social proof emphasis. Result: +22% Sales.',
    'CLIENT Z (Content) · Problem: Low read depth. BAI Solution: Simplified layout + automated article flow. Result: +34% Engagement.',
    'CLIENT Q (Fintech) · Problem: Form abandonment. BAI Solution: Step compression + adaptive inline guidance. Result: +19% Completion.',
];

export function UseCases({ behaviorMode }: UseCasesProps) {
    const isLowEngagement = behaviorMode === 'low_engagement';
    const isHighIntent = behaviorMode === 'high_intent';

    const orderedCases = isLowEngagement
        ? [CASES[1], CASES[0], CASES[2], CASES[3]]
        : CASES;

    return (
        <div className="min-h-screen bg-[#07080c] text-white px-6 md:px-8 pb-12 pt-24">
            <header className="max-w-7xl mx-auto mb-10">
                <p className="text-xs font-mono text-cyan-300/80 tracking-wider mb-3">
                    REPLACING ANALYSIS DEPARTMENTS WITH AGENTIC INTELLIGENCE.
                </p>
                <h1 className="font-outfit font-black text-4xl md:text-6xl leading-tight">
                    From raw behavior data to direct customer action, instantly.
                </h1>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[130px]">
                <section className="md:col-span-6 md:row-span-3 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-3">Autonomous E-Commerce Optimization</h2>
                    <p className="text-white/70 mb-4">
                        Automatically adapt the checkout flow and component priority to minimize cart abandonment.
                    </p>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-mono text-white/70">
                        checkout_layout: shipping_calculator moved ↑ when price_dwell detected.
                    </div>
                </section>

                <section className="md:col-span-6 md:row-span-3 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-3">Predictive Help Desk UI</h2>
                    <p className="text-white/70 mb-4">
                        AI detects user frustration via telemetry and dynamically simplifies the help interface.
                    </p>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-mono text-white/70">
                        support_portal: faq_grid -&gt; focused_search when idle_time_ratio spikes.
                    </div>
                </section>

                <section className="md:col-span-12 md:row-span-3 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-4">
                        {isHighIntent ? 'Integration Guides' : 'Simulated Case Studies'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(isHighIntent
                            ? [
                                'Guide A: Retail policy rollout with fallback checkpoints.',
                                'Guide B: SaaS onboarding intent model integration.',
                                'Guide C: Content-depth adaptive card orchestration.',
                                'Guide D: API instrumentation and cohort reporting.',
                            ]
                            : orderedCases
                        ).map((item) => (
                            <article key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/75">
                                {item}
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
