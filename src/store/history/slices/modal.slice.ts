import { StateCreator } from 'zustand';

import { HistoryState, IModalSlice } from '../types';

type ModalSliceCreator = StateCreator<HistoryState, [['zustand/devtools', never]], [], IModalSlice>;

export const createModalSlice: ModalSliceCreator = (set) => ({
    isOpenModal: false,
    showModal: () => set({ isOpenModal: true }, false, 'modal/showModal'),
    hideModal: () => set({ isOpenModal: false }, false, 'modal/hideModal'),
});
