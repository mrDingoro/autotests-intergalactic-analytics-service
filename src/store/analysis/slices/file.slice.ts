import { StateCreator } from 'zustand';

import { AnalysisState, IFileSlice } from '../types';

// Явно определяем, что `set` может принимать имя экшена
type FileSliceCreator = StateCreator<AnalysisState, [['zustand/devtools', never]], [], IFileSlice>;

export const createFileSlice: FileSliceCreator = (set) => ({
    file: null,
    status: 'idle',
    setFile: (file: File | null) => set({ file, status: 'idle', highlights: [], error: null }, false, 'file/setFile'),
    setStatus: (status: IFileSlice['status']) => set({ status }, false, 'file/setStatus'),
});
