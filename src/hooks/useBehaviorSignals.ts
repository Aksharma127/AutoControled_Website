import { useEffect, useMemo, useState } from 'react';
import type { BehaviorMode, PersonaId } from '../types';

const RETENTION_FLAG = 'bai_high_intent';
const IDLE_THRESHOLD_MS = 5000;

export function useBehaviorSignals(persona: PersonaId) {
    const [lastInteractionAt, setLastInteractionAt] = useState(Date.now());
    const [now, setNow] = useState(Date.now());
    const [isHighIntent, setIsHighIntent] = useState(
        sessionStorage.getItem(RETENTION_FLAG) === '1'
    );

    useEffect(() => {
        const touch = () => setLastInteractionAt(Date.now());
        window.addEventListener('mousemove', touch, { passive: true });
        window.addEventListener('scroll', touch, { passive: true });
        window.addEventListener('keydown', touch);
        window.addEventListener('click', touch, { passive: true });

        return () => {
            window.removeEventListener('mousemove', touch);
            window.removeEventListener('scroll', touch);
            window.removeEventListener('keydown', touch);
            window.removeEventListener('click', touch);
        };
    }, []);

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const idleMs = now - lastInteractionAt;

    const behaviorMode = useMemo<BehaviorMode>(() => {
        if (isHighIntent) return 'high_intent';
        if (idleMs > IDLE_THRESHOLD_MS) return 'low_engagement';
        if (persona === 'bouncer') return 'high_speed_skimmer';
        return 'default';
    }, [idleMs, isHighIntent, persona]);

    function markHighIntent() {
        sessionStorage.setItem(RETENTION_FLAG, '1');
        setIsHighIntent(true);
    }

    return { behaviorMode, markHighIntent };
}
