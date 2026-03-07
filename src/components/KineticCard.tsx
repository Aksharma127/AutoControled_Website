import { motion, Transition } from 'framer-motion';
import { ReactNode } from 'react';

interface KineticCardProps {
    children: ReactNode;
    mass?: number; // Affects Framer Motion physics damping. 1 = Standard. 2 = Heavy.
    className?: string;
    style?: React.CSSProperties;
    id?: string;
}

export function KineticCard({ children, mass = 1, className = '', style, id }: KineticCardProps) {

    // Higher mass means more damping and slightly slower stiffness. Gives weight.
    const kineticSpring: Transition = {
        type: 'spring',
        stiffness: 45 / Math.pow(mass, 0.5),
        damping: 20 * Math.pow(mass, 0.5),
        duration: 3
    };

    // Stagger float animation duration randomly between 8s and 16s so cards float independently
    const randomFloatTime = 8 + (id ? (id.length % 8) : 4);

    return (
        <motion.article
            id={id}
            layout
            layoutId={id}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={kineticSpring}
            whileHover={{
                y: -10,
                scale: 1.02,
                boxShadow: "0 50px 100px rgba(0,0,0,0.12), 0 0 140px rgba(0, 240, 255, 0.3)"
            }}
            style={{
                ...style,
                animationDuration: `${randomFloatTime}s`
            }}
            className={`kinetic-glass overflow-hidden rounded-[2.5rem] p-8 ${className}`}
        >
            <div className="relative z-10 w-full h-full">
                {children}
            </div>

            {/* Secondary Glass Glare Overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-60 mix-blend-overlay" />
        </motion.article>
    );
}
