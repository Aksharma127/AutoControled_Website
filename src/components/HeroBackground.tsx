import { motion } from 'framer-motion';

interface HeroBackgroundProps {
    colorMood?: string;
}

const MOOD_GRADIENTS: Record<string, string> = {
    energetic: 'from-slate-900 via-indigo-950/70 to-cyan-950/60',
    calm: 'from-slate-950 via-slate-900 to-cyan-950/45',
    focused: 'from-zinc-950 via-slate-900 to-zinc-900',
};

export function HeroBackground({ colorMood = 'energetic' }: HeroBackgroundProps) {
    const gradient = MOOD_GRADIENTS[colorMood] ?? MOOD_GRADIENTS.energetic;

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none bg-[#07080c]">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70 transition-colors duration-1000`} />

            <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 80%)',
                }}
            />

            <motion.div
                className="absolute w-[760px] h-[760px] rounded-full blur-[120px] bg-indigo-500/20"
                animate={{ x: [0, 80, -60, 0], y: [0, -50, 60, 0] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute w-[560px] h-[560px] rounded-full blur-[110px] bg-cyan-500/20 right-[-120px] top-[-120px]"
                animate={{ x: [0, -40, 40, 0], y: [0, 40, -30, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
}
