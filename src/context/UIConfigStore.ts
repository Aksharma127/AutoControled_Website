import { createContext } from 'react';
import type { ExperimentState, PersonaId, UIConfig } from '../types';
import { DEFAULT_CONFIG } from '../types';

export interface UIConfigContextValue {
    config: UIConfig;
    persona: PersonaId;
    experiment: ExperimentState;
    isLoading: boolean;
}

export const UIConfigContext = createContext<UIConfigContextValue>({
    config: DEFAULT_CONFIG,
    persona: 'unknown',
    experiment: { cohort: 'adaptive', policyVersionId: null },
    isLoading: true,
});
