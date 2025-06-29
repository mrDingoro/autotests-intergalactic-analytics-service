import { Highlights } from './common';

export type HistoryItemType = {
    id: string;
    timestamp: number;
    fileName: string;
    highlights?: Highlights;
};
