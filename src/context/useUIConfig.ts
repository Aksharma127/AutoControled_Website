import { useContext } from 'react';
import { UIConfigContext } from './UIConfigStore';

export function useUIConfig() {
    return useContext(UIConfigContext);
}
