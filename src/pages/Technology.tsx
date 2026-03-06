import type { BehaviorMode } from '../types';

interface TechnologyProps {
    behaviorMode: BehaviorMode;
}

export function Technology({ behaviorMode }: TechnologyProps) {
    const isSkimmer = behaviorMode === 'high_speed_skimmer';
    const isHighIntent = behaviorMode === 'high_intent';

    return (
        <div className="min-h-screen bg-[#07080c] text-white px-6 md:px-8 pb-12 pt-24">
            <header className="max-w-7xl mx-auto mb-10">
                <p className="text-xs font-mono text-cyan-300/80 tracking-wider mb-3">
                    THE SENSOR-TO-ROLLOUT PIPELINE.
                </p>
                <h1 className="font-outfit font-black text-4xl md:text-6xl leading-tight">
                    The intelligence required to run an autonomous UI requires highly normalized behavioral telemetry.
                </h1>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[130px]">
                {isHighIntent && (
                    <section className="md:col-span-12 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5">
                        <p className="text-xs font-mono text-emerald-300 mb-1">
                            System Health Monitor: Policy V.1.3 Running
                        </p>
                        <p className="text-white/80 text-sm">
                            Guardrails active. Rollout telemetry stable. Adaptive policy in retention mode.
                        </p>
                    </section>
                )}

                <section className="md:col-span-12 md:row-span-4 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-4">Telemetry Data Matrix</h2>
                    {isSkimmer ? (
                        <ul className="text-sm text-white/75 space-y-2 font-mono">
                            <li>(Raw Inputs: mousemove, click)</li>
                            <li>-&gt; (Normalizer: THROTTLE, BATCH)</li>
                            <li>-&gt; (Intent Vectors: scroll_velocity, dwell_ratio, idle_time)</li>
                            <li>-&gt; (Storage: Supabase aggregated_metrics)</li>
                            <li>-&gt; (Analysis: K-Means Clustering)</li>
                            <li>-&gt; (Action: Gemini Layout Policy)</li>
                        </ul>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs font-mono">
                            {[
                                'Raw Inputs\nmousemove, click',
                                'Normalizer\nTHROTTLE, BATCH',
                                'Intent Vectors\nscroll_velocity, dwell_ratio, idle_time',
                                'Storage\nSupabase aggregated_metrics',
                                'Analysis\nK-Means Clustering',
                                'Action\nGemini Layout Policy',
                            ].map((x) => (
                                <div key={x} className="rounded-xl border border-white/10 bg-white/5 p-3 whitespace-pre-line">
                                    {x}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="md:col-span-6 md:row-span-3 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-4">Persona Archetypes</h2>
                    <div className="space-y-3">
                        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <h3 className="font-semibold">THE SKIMMER</h3>
                            <p className="text-sm text-white/70">High Velocity, Low Dwell Ratio</p>
                        </article>
                        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <h3 className="font-semibold">THE DEEP READER</h3>
                            <p className="text-sm text-white/70">Low Velocity, High Dwell Ratio</p>
                        </article>
                        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <h3 className="font-semibold">THE EXPLORER</h3>
                            <p className="text-sm text-white/70">Broad Scroll Depth, High Click Density</p>
                        </article>
                    </div>
                </section>

                <section className="md:col-span-6 md:row-span-2 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h3 className="font-outfit text-xl font-semibold mb-4">
                        AI Constraints: Guaranteed Professional Integrity.
                    </h3>
                    <ul className="text-xs font-mono text-white/75 space-y-2">
                        <li>[RULE_01] VALIDATE_SCHEMA(jsonb)</li>
                        <li>[RULE_02] CONTRAST_RATIO &gt;= WCAG_AA</li>
                        <li>[RULE_03] LAYOUT_SHIFT &lt; CLS_THRESHOLD (0.1)</li>
                        <li>[RULE_04] GRID_BOUNDS = 12 columns</li>
                        <li>[RULE_05] NO_FUNCTION_EDITS (Code is fixed)</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}
