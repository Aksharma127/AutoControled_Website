import type { BehaviorMode } from '../types';

interface DataScienceApiProps {
    behaviorMode: BehaviorMode;
}

export function DataScienceApi({ behaviorMode }: DataScienceApiProps) {
    const isSkimmer = behaviorMode === 'high_speed_skimmer';

    return (
        <div className="min-h-screen bg-[#07080c] text-white px-6 md:px-8 pb-12 pt-24">
            <header className="max-w-7xl mx-auto mb-10">
                <p className="text-xs font-mono text-cyan-300/80 tracking-wider mb-3">
                    THE BAI DATA ENGINE API.
                </p>
                <h1 className="font-outfit font-black text-4xl md:text-6xl leading-tight">
                    Access behavioral fingerprints and intent clusters with a simple API call.
                </h1>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[130px]">
                <section className="md:col-span-12 md:row-span-3 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-4">Endpoint Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                        {[
                            'POST /telemetry/stream  -> Stream normalized events in batches',
                            'GET /persona/current  -> Retrieve user intent fingerprint',
                            'GET /ui-policy/active  -> Fetch validated layout JSON for rollout',
                            'PATCH /experiment/results  -> Report cohort lift for model training',
                        ].map((r) => (
                            <div key={r} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                {r}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="md:col-span-6 md:row-span-2 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-2">Anonymous User Recognition System</h2>
                    <h3 className="text-sm font-mono text-cyan-300 mb-3">Secure Cookieless Identity Handling.</h3>
                    <p className="text-white/70 text-sm mb-4">
                        We combine FingerprintJS signals with an edge-layer IP hash to recognize returning
                        visitors without storing PII or using restrictive cookies.
                    </p>
                    <p className="text-xs font-mono text-white/60">
                        (Client IP + Browser Fingerprint) -&gt; Hash -&gt; Stable Anonymous ID
                    </p>
                </section>

                <section className="md:col-span-6 md:row-span-2 rounded-2xl border border-white/15 bg-black/30 p-6">
                    <h2 className="font-outfit text-2xl font-semibold mb-3">Code Snippet Library</h2>
                    {!isSkimmer ? (
                        <pre className="text-xs font-mono p-4 rounded-xl border border-white/10 bg-zinc-950/80 overflow-x-auto">
{`npm install @bai/core

import { BAIClient } from '@bai/core';

const bai = new BAIClient();
bai.trackIntent('cta_hover');`}
                        </pre>
                    ) : (
                        <p className="text-sm text-white/75 font-mono">
                            Skimmer mode: detailed code samples are collapsed. Use endpoint summary above.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
}
