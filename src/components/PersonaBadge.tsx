/**
 * PersonaBadge — visible only in debug mode (?debug=1).
 * Shows current persona, color mood, session stats.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useUIConfig } from '../context/useUIConfig';

const PERSONA_EMOJI: Record<string, string> = {
    explorer: '🚀',
    reader: '📚',
    bouncer: '⚡',
    unknown: '🌱',
};

const PERSONA_DESC: Record<string, string> = {
    explorer: 'High-curiosity navigator',
    reader: 'Deep-focus content consumer',
    bouncer: 'Fast-decision maker',
    unknown: 'Calibrating persona...',
};

export function PersonaBadge() {
    const isDebug = new URLSearchParams(window.location.search).get('debug') === '1';
    const { config, persona, experiment, isLoading } = useUIConfig();

    return (
        <AnimatePresence>
            {isDebug && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="fixed bottom-6 right-6 z-[100] p-4 rounded-2xl bg-black/80 border border-violet-500/40 backdrop-blur-xl text-white max-w-xs"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-mono text-white/60">ORGANISM DEBUG</span>
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-white/50">Calibrating...</p>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{PERSONA_EMOJI[persona]}</span>
                                <div>
                                    <p className="font-semibold text-violet-300 capitalize">{persona}</p>
                                    <p className="text-xs text-white/50">{PERSONA_DESC[persona]}</p>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-2 space-y-1 text-xs font-mono text-white/60">
                                <div>cohort: <span className="text-blue-300">{experiment.cohort}</span></div>
                                <div>policy: <span className="text-emerald-300">{experiment.policyVersionId ?? 'none'}</span></div>
                                <div>mood: <span className="text-fuchsia-300">{config.colorMood}</span></div>
                                <div>hero: <span className="text-cyan-300">{config.heroStyle}</span></div>
                                <div>wobble: <span className="text-amber-300">{config.wobblyIntensity.toFixed(1)}</span></div>
                                <div>cards: <span className="text-green-300">[{config.cardOrder.join(',')}]</span></div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
