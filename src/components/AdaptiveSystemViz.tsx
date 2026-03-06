import { motion } from 'framer-motion';

interface AdaptiveSystemVizProps {
    intensity?: number;
}

const FLOW_LINES = [
    { left: '8%', delay: 0, duration: 2.8 },
    { left: '22%', delay: 0.4, duration: 3.4 },
    { left: '38%', delay: 0.2, duration: 3.1 },
    { left: '54%', delay: 0.7, duration: 3.6 },
    { left: '70%', delay: 0.35, duration: 2.9 },
    { left: '86%', delay: 0.6, duration: 3.3 },
];

const NODE_LAYOUTS = [
    [
        { x: 8, y: 18 },
        { x: 34, y: 28 },
        { x: 58, y: 16 },
        { x: 80, y: 30 },
        { x: 24, y: 68 },
        { x: 54, y: 64 },
        { x: 78, y: 72 },
    ],
    [
        { x: 18, y: 24 },
        { x: 42, y: 16 },
        { x: 72, y: 24 },
        { x: 82, y: 52 },
        { x: 56, y: 72 },
        { x: 30, y: 70 },
        { x: 12, y: 50 },
    ],
    [
        { x: 14, y: 38 },
        { x: 30, y: 18 },
        { x: 58, y: 24 },
        { x: 78, y: 40 },
        { x: 68, y: 70 },
        { x: 36, y: 74 },
        { x: 16, y: 62 },
    ],
];

const NODE_SIZE = [10, 8, 12, 9, 11, 7, 10];

export function AdaptiveSystemViz({ intensity = 0.6 }: AdaptiveSystemVizProps) {
    const glowOpacity = 0.25 + intensity * 0.2;

    return (
        <div className="adaptive-accent relative w-full max-w-3xl h-[280px] md:h-[340px] mx-auto rounded-3xl border border-white/15 bg-slate-900/30 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:38px_38px] opacity-40" />

            {FLOW_LINES.map((line, idx) => (
                <motion.div
                    key={`${line.left}-${idx}`}
                    className="absolute top-0 w-px h-full bg-gradient-to-b from-cyan-200/0 via-cyan-200/60 to-cyan-200/0"
                    style={{ left: line.left }}
                    animate={{ opacity: [0.1, 0.9, 0.1], scaleY: [0.7, 1, 0.7] }}
                    transition={{ duration: line.duration, delay: line.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}

            <div className="absolute inset-0">
                {NODE_LAYOUTS[0].map((_node, index) => (
                    <motion.div
                        key={`node-${index}`}
                        className="absolute rounded-full bg-slate-100/90 border border-cyan-100/50 shadow-[0_0_20px_rgba(125,211,252,0.35)]"
                        style={{
                            width: NODE_SIZE[index],
                            height: NODE_SIZE[index],
                        }}
                        animate={{
                            left: NODE_LAYOUTS.map((layout) => `${layout[index].x}%`),
                            top: NODE_LAYOUTS.map((layout) => `${layout[index].y}%`),
                            boxShadow: [
                                '0 0 12px rgba(125,211,252,0.18)',
                                '0 0 24px rgba(125,211,252,0.45)',
                                '0 0 12px rgba(125,211,252,0.18)',
                            ],
                        }}
                        transition={{
                            left: { duration: 9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: index * 0.08 },
                            top: { duration: 9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: index * 0.08 },
                            boxShadow: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
                        }}
                    />
                ))}
            </div>

            <motion.div
                className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[55%] h-36 rounded-full bg-cyan-300/30 blur-3xl"
                animate={{ opacity: [glowOpacity * 0.7, glowOpacity, glowOpacity * 0.7], scale: [0.96, 1.04, 0.96] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
}
