import { motion } from 'framer-motion';
import type { BehaviorMode, PersonaId } from '../types';
import { KineticCard } from '../components/KineticCard';
import { NeuralNetwork } from '../components/NeuralNetwork';

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
];

const HERO_COPY: Record<string, { headline: string; sub: string }> = {
    explorer: {
        headline: 'AUTONOMOUS\nUI_OS',
        sub: 'This interface analyzes Saccadic movements to optimize geometry locally.',
    },
    reader: {
        headline: 'AUTONOMOUS\nUI_OS',
        sub: 'Built on your behavior. It breathes and learns as you dwell.',
    },
    bouncer: {
        headline: 'AUTONOMOUS\nUI_OS',
        sub: 'Removing noise and focusing purely on the critical paths.',
    },
    unknown: {
        headline: 'AUTONOMOUS\nUI_OS',
        sub: 'Awaiting sufficient telemetry to configure your designated workspace.',
    }
};

export function Home({
    persona,
    behaviorMode,
    isLoading,
    engagementScore,
    onPrimaryIntent,
    onSecondaryIntent,
}: HomeProps) {
    const copy = HERO_COPY[persona] ?? HERO_COPY.unknown;

    // The AI config maps the gravity grid depending on priority
    let gridTemplate = `
      "dossier dossier apex apex"
      "feed monolith monolith monolith"
      "pulse monolith monolith monolith"
      "control . . ."
    `;

    if (persona === 'reader' || behaviorMode === 'low_engagement') {
        gridTemplate = `
          "apex apex dossier dossier"
          "monolith monolith monolith feed"
          "monolith monolith monolith pulse"
          ". . control control"
        `;
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-inter pt-28 pb-20 px-4 md:px-12 relative overflow-hidden">
            <section
                className="w-full max-w-[1400px] mx-auto grid gap-6 md:gap-8 relative z-10"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gridAutoRows: 'minmax(120px, auto)',
                    gridTemplateAreas: gridTemplate,
                    transition: 'all 2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* The Monolith */}
                <KineticCard mass={2} style={{ gridArea: 'monolith' }} className="flex flex-col justify-center min-h-[500px] md:min-h-[600px] bg-white/40 border-2 relative">
                    <NeuralNetwork />
                    <div className="relative z-10">
                        <div className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-gray-600 text-xs font-mono mb-8 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_10px_#00F0FF]" />
                            {isLoading ? 'Calibrating...' : 'System Active'}
                        </div>

                        <h1
                            className="font-inter font-black text-6xl md:text-[7rem] leading-[0.85] mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            {copy.headline}
                        </h1>

                        <p className="text-gray-600 text-xl md:text-2xl max-w-2xl font-light mb-12 leading-relaxed">
                            {copy.sub}
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <button
                                onClick={onPrimaryIntent}
                                className="relative px-8 py-4 font-outfit font-bold tracking-wide uppercase text-white rounded-full bg-gray-900 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,240,255,0.4)] transition-all duration-500 will-change-transform"
                            >
                                <span className="relative z-10">Establish_Connection</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#7000FF] opacity-0 hover:opacity-100 transition-opacity duration-500" />
                            </button>
                        </div>
                    </div>
                </KineticCard>

                {/* The Dossier */}
                <KineticCard mass={1} style={{ gridArea: 'dossier' }} className="flex flex-col justify-between">
                    <h3 className="font-outfit font-bold text-gray-800 text-lg uppercase tracking-widest">Persona Dossier</h3>
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm font-mono text-gray-600">
                            <span>Intent Class:</span>
                            <span className="font-bold text-black">{persona.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-mono text-gray-600">
                            <span>Engagement:</span>
                            <span className="font-bold text-[#FF007A]">{engagementScore}%</span>
                        </div>
                        <div className="flex justify-between text-sm font-mono text-gray-600">
                            <span>Behavior Mode:</span>
                            <span className="font-bold text-[#7000FF]">{behaviorMode.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                    </div>
                </KineticCard>

                {/* The Feed */}
                <KineticCard mass={1} style={{ gridArea: 'feed' }} className="flex flex-col">
                    <h3 className="font-outfit font-bold text-gray-800 text-lg uppercase tracking-widest mb-4">Active Deployments</h3>
                    <div className="flex-1 flex flex-col gap-3 font-mono text-xs text-gray-500">
                        {FEED.map(([title]) => (
                            <div key={title} className="p-3 rounded-xl bg-white/40 border border-white/80">→ {title}</div>
                        ))}
                    </div>
                </KineticCard>

                {/* The Pulse */}
                <KineticCard mass={0.5} style={{ gridArea: 'pulse' }} className="flex flex-col justify-center items-center overflow-hidden relative">
                    <h3 className="absolute top-6 left-6 font-outfit font-bold text-gray-800 text-lg uppercase tracking-widest z-10">Telemetry Pulse</h3>
                    {/* Simplified pulse for performance inside Glass */}
                    <div className="w-full h-full flex items-center justify-center pt-8">
                        <div className="flex items-end gap-1 h-16">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 rounded-full bg-gradient-to-t from-[#00F0FF] to-[#FF007A]"
                                    animate={{ height: [10, 30 + Math.random() * 30, 10] }}
                                    transition={{
                                        duration: 1.5 + Math.random(),
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.1,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </KineticCard>

                {/* The Control */}
                <KineticCard mass={1.5} style={{ gridArea: 'control' }} className="flex flex-col justify-between">
                    <h3 className="font-outfit font-bold text-gray-800 text-lg uppercase tracking-widest">System Overrides</h3>
                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={onSecondaryIntent}
                            className="text-left p-3 rounded-xl border border-gray-200 hover:border-[#00F0FF] hover:bg-white/50 transition-all font-mono text-xs text-gray-600"
                        >
                            [TRIGGER_SECONDARY_INTENT]
                        </button>
                        <label className="flex items-center justify-between text-sm font-mono text-gray-600 cursor-pointer">
                            <span>Morphing</span>
                            <div className="w-10 h-5 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF] relative">
                                <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-[#00F0FF]" />
                            </div>
                        </label>
                    </div>
                </KineticCard>

            </section>
        </div>
    );
}
