export interface AnalysisHighlight {
    title: string;
    description: string;
}

export type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'error';
