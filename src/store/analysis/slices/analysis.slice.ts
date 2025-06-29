import { StateCreator } from 'zustand';

import { AnalysisState, IAnalysisSlice } from '../types';

type AnalysisSliceCreator = StateCreator<AnalysisState, [['zustand/devtools', never]], [], IAnalysisSlice>;

export const createAnalysisSlice: AnalysisSliceCreator = (set) => ({
    highlights: [],
    error: null,
    setHighlights: (highlights: IAnalysisSlice['highlights']) => set({ highlights }, false, 'analysis/setHighlights'),
    setError: (error: string | null) => set({ error, status: 'error' }, false, 'analysis/setError'),
});
