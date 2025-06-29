import { create } from 'zustand';

import { withMiddlewares } from './analysis';
import { createAnalysisSlice, createFileSlice, createSharedSlice, AnalysisState } from './analysis';

export const useAnalysisStore = create<AnalysisState>()(
    withMiddlewares((...a) => ({
        ...createFileSlice(...a),
        ...createAnalysisSlice(...a),
        ...createSharedSlice(...a),
    }))
);
