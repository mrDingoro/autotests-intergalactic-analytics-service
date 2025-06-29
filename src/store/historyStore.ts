import { create } from 'zustand';

import { withMiddlewares } from './history';
import { createHistorySlice, createModalSlice, createSharedSlice, HistoryState } from './history';

export const useHistoryStore = create<HistoryState>()(
    withMiddlewares((...a) => ({
        ...createHistorySlice(...a),
        ...createModalSlice(...a),
        ...createSharedSlice(...a),
    }))
);
