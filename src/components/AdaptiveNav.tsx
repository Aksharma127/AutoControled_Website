import { motion, AnimatePresence } from 'framer-motion';
import { AdaptiveButton } from './AdaptiveButton';

interface AdaptiveNavProps {
    currentPath: string;
    onNavigate: (path: string) => void;
}

const NAV_ITEMS = [
    { path: '/', label: 'Command Center' },
    { path: '/technology', label: 'Technology' },
    { path: '/use-cases', label: 'Use Cases' },
    { path: '/api', label: 'Data API' },
];

export function AdaptiveNav({ currentPath, onNavigate }: AdaptiveNavProps) {
    const normalized = currentPath || '/';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 py-3 backdrop-blur-xl bg-[#07080c]/55 border-b border-white/10">
            <motion.div className="font-outfit font-bold text-lg md:text-xl tracking-tight flex items-center gap-2 text-white/95" whileHover={{ scale: 1.03 }}>
                <div className="w-7 h-7 rounded-md bg-white/90 flex items-center justify-center text-[#09090b] text-base">❖</div>
                BAI
            </motion.div>

            <AnimatePresence>
                <div className="flex items-center gap-3 md:gap-4">
                    {NAV_ITEMS.map((item, idx) =>
                        item.path === '/' ? (
                            <motion.a
                                key={item.path}
                                href={item.path}
                                layout
                                layoutId={`nav-${item.path}`}
                                style={{ order: idx }}
                                className="no-underline ml-1"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(item.path);
                                }}
                            >
                                <AdaptiveButton
                                    variant="primary"
                                    className="!px-4 !py-2 !text-xs !rounded-full"
                                >
                                    {item.label}
                                </AdaptiveButton>
                            </motion.a>
                        ) : (
                            <motion.a
                                key={item.path}
                                href={item.path}
                                layout
                                layoutId={`nav-${item.path}`}
                                style={{ order: idx }}
                                className={`text-sm font-medium transition-colors px-1 py-2 no-underline ${
                                    normalized === item.path
                                        ? 'text-white'
                                        : 'text-white/70 hover:text-white'
                                }`}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(item.path);
                                }}
                            >
                                {item.label}
                            </motion.a>
                        )
                    )}
                </div>
            </AnimatePresence>
        </nav>
    );
}
