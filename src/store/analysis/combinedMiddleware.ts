import { StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { logger } from '../middlewares/logger';

import { analysisPersistConfig } from './persist.config';
import { AnalysisState } from './types';

export const withMiddlewares = (config: StateCreator<AnalysisState>) => {
    return logger(devtools(persist(config, analysisPersistConfig), { name: 'AnalysisStore' }), 'AnalysisStore');
};
