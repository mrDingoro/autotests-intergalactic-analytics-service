import { createPersistConfig } from '@utils/persist';

import { HistoryState } from './types';

const PERSISTED_KEYS: (keyof HistoryState)[] = [
    'history',
    // 'selectedItem',
    // 'isOpenModal',
];

export const historyPersistConfig = createPersistConfig<HistoryState>('history-storage', PERSISTED_KEYS);
