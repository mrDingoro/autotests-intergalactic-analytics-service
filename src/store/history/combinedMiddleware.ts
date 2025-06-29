import { StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { logger } from '../middlewares/logger';

import { historyPersistConfig } from './persist.config';
import { HistoryState } from './types';

export const withMiddlewares = (config: StateCreator<HistoryState>) => {
    return logger(devtools(persist(config, historyPersistConfig), { name: 'HistoryStore' }), 'HistoryStore');
};
