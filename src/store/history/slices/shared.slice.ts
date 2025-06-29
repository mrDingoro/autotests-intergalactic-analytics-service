import { StateCreator } from 'zustand';

import { HistoryState, ISharedSlice } from '../types';

type SharedSliceCreator = StateCreator<HistoryState, [['zustand/devtools', never]], [], ISharedSlice>;

export const createSharedSlice: SharedSliceCreator = (set) => ({
    reset: () =>
        set(
            {
                selectedItem: null,
                isOpenModal: false,
                history: [],
            },
            false,
            'shared/reset'
        ),
});
