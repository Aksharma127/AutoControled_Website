import { motion, useScroll, useMotionValueEvent, Transition, useVelocity, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AdaptiveNavProps {
    currentPath: string;
    onNavigate: (path: string) => void;
}

const NAV_ITEMS = [
    { path: '/', label: 'Explore' },
    { path: '/technology', label: 'Intelligence' },
    { path: '/api', label: 'Sync' },
];

export function AdaptiveNav({ currentPath, onNavigate }: AdaptiveNavProps) {
    const normalized = currentPath || '/';
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    // Map velocity to increase brightness/opacity on fast scrolls
    const heartbeatOpacity = useTransform(smoothVelocity, [-1000, 0, 1000], [1, 0.3, 1]);

    const [scrolled, setScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [confidence, setConfidence] = useState(96.4);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > 50) {
            setScrolled(true);
            if (latest > previous && latest > 150) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
        } else {
            setScrolled(false);
            setIsHidden(false);
        }
    });

    useEffect(() => {
        // Fluctuate confidence slightly around 96%
        const interval = setInterval(() => {
            setConfidence(prev => {
                const jitter = (Math.random() - 0.5) * 0.4; // +/- 0.2
                const next = prev + jitter;
                return Number(Math.max(92.1, Math.min(99.9, next)).toFixed(1));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const kineticSpring: Transition = { type: 'spring', stiffness: 40, damping: 20 };

    return (
        <motion.nav
            className="fixed top-6 left-1/2 z-50 flex items-center justify-between w-[95%] max-w-6xl shadow-2xl kinetic-glass rounded-full px-6 py-4 overflow-hidden"
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{
                y: isHidden ? -100 : 0,
                x: "-50%",
                opacity: isHidden ? 0 : 1,
                scale: scrolled ? 0.95 : 1
            }}
            transition={kineticSpring}
        >
            {/* Neural Heartbeat */}
            <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]"
                style={{
                    opacity: heartbeatOpacity,
                    animation: 'none' // override css
                }}
                animate={{ width: ["0%", "100%", "100%"], opacity: [0, 1, 0] }}
                transition={{
                    duration: 3, // fallback if styles don't bridge, but we'll use motion's repeat
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Left: System Status */}
            <div className="flex items-center gap-3 w-1/3">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F0FF]"></span>
                </div>
                <span className="font-outfit font-bold text-xs tracking-widest uppercase text-gray-500 hidden md:block">Neural Link: Active</span>
            </div>

            {/* Center: Ghost Nav */}
            <div className="flex items-center justify-center gap-6 w-1/3">
                {NAV_ITEMS.map((item) => {
                    const isActive = normalized === item.path;
                    let activeColorClass = 'text-gray-600 hover:text-black';

                    if (isActive) {
                        if (item.path === '/') activeColorClass = 'text-[#00F0FF] underline underline-offset-4';
                        if (item.path === '/technology') activeColorClass = 'text-[#FF007A] underline underline-offset-4';
                        if (item.path === '/api') activeColorClass = 'text-[#7000FF] underline underline-offset-4';
                    }

                    return (
                        <a
                            key={item.path}
                            href={item.path}
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate(item.path);
                            }}
                            className={`text-sm font-semibold tracking-wide transition-colors ${activeColorClass}`}
                        >
                            {item.label}
                        </a>
                    );
                })}
            </div>

            {/* Right: Persona Chip / Confidence Score */}
            <div className="flex justify-end w-1/3 hidden md:flex">
                <motion.div
                    layout
                    transition={kineticSpring}
                    className="flex items-center gap-2 px-4 py-1.5 font-mono font-semibold text-[10px] rounded-full bg-white/50 text-[#7000FF] tracking-widest uppercase border border-white/80 shadow-[0_0_15px_rgba(112,0,255,0.15)]"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7000FF] animate-pulse" />
                    Confidence: {confidence.toFixed(1)}%
                </motion.div>
            </div>
        </motion.nav>
    );
}
