import { StateCreator } from 'zustand';

import { AnalysisState, ISharedSlice } from '../types';

type SharedSliceCreator = StateCreator<AnalysisState, [['zustand/devtools', never]], [], ISharedSlice>;

export const createSharedSlice: SharedSliceCreator = (set) => ({
    reset: () => {
        set(
            {
                file: null,
                status: 'idle',
                highlights: [],
                error: null,
            },
            false,
            'store/reset'
        );
    },
});
