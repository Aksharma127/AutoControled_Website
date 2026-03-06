import { motion } from 'framer-motion';

interface AdaptiveCardProps {
    title: string;
    body: string;
    order?: number;
    className?: string;
    colorClass?: string;
    delay?: number;
    id?: string;
}

export function AdaptiveCard({
    title,
    body,
    order = 0,
    className = '',
    colorClass = 'from-indigo-500/10 to-purple-500/10',
    delay = 0,
    id,
}: AdaptiveCardProps) {
    return (
        <motion.article
            id={id}
            layout
            layoutId={id}
            style={{ order }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                layout: { type: 'spring', stiffness: 250, damping: 30 },
                opacity: { delay: delay * 0.1 },
            }}
            className={`
                relative overflow-hidden rounded-2xl p-6
                bg-gradient-to-br ${colorClass}
                border border-white/15 bg-white/[0.035]
                shadow-[0_10px_30px_rgba(0,0,0,0.2)]
                backdrop-blur-md
                ${className}
            `}
        >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-transparent opacity-50" />
            <div className="relative z-10">
                <h3 className="font-outfit font-semibold text-xl text-white/95 mb-3">{title}</h3>
                <p className="text-white/75 text-sm leading-relaxed">{body}</p>
            </div>
        </motion.article>
    );
}
