import { createPersistConfig } from '@utils/persist';

import { AnalysisState } from './types';

const PERSISTED_KEYS: (keyof AnalysisState)[] = [
    // 'status',
    // 'highlights',
];

export const analysisPersistConfig = createPersistConfig<AnalysisState>('analysis-storage', PERSISTED_KEYS);
