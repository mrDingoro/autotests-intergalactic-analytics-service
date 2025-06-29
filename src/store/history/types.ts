import { HistoryItemType } from '@app-types/history';

export interface IHistorySlice {
    history: HistoryItemType[];
    selectedItem: HistoryItemType | null;
    clearHistory: () => void;
    removeFromHistory: (id: string) => void;
    addToHistory: (item: HistoryItemType) => void;
    setSelectedItem: (item: HistoryItemType) => void;
    resetSelectedItem: () => void;
    updateHistoryFromStorage: () => void;
}

export interface IModalSlice {
    isOpenModal: boolean;
    showModal: () => void;
    hideModal: () => void;
}

export interface ISharedSlice {
    reset: () => void;
}

export type HistoryState = IHistorySlice & IModalSlice & ISharedSlice;
