import { AnalysisStatus, AnalysisHighlight } from '@app-types/analysis';

export interface IFileSlice {
    file: File | null;
    status: AnalysisStatus;
    setFile: (file: File | null) => void;
    setStatus: (status: AnalysisStatus) => void;
}

export interface IAnalysisSlice {
    highlights: AnalysisHighlight[];
    error: string | null;
    setHighlights: (highlights: AnalysisHighlight[]) => void;
    setError: (error: string | null) => void;
}

export interface ISharedSlice {
    reset: () => void;
}

export type AnalysisState = IFileSlice & IAnalysisSlice & ISharedSlice;
