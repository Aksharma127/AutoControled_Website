import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AdaptiveButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
    onClick?: () => void;
}

export function AdaptiveButton({ children, variant = 'primary', className = '', onClick }: AdaptiveButtonProps) {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                flex items-center justify-center gap-2 overflow-hidden group
                ${isPrimary
                    ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                    : isSecondary ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'bg-transparent text-white border border-white/20 hover:bg-white/5 hover:border-white/30'
                }
                ${className}
            `}
        >
            {isPrimary && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            )}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
}
