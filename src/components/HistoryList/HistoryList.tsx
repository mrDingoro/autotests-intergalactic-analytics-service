import { useEffect } from 'react';

import { HistoryItemType } from '@app-types/history';
import { HistoryItem } from '@components/HistoryItem';
import { useHistoryStore } from '@store/historyStore';
import { removeFromHistory } from '@utils/storage';
import { useShallow } from 'zustand/react/shallow';

import styles from './HistoryList.module.css';

export const HistoryList = () => {
    const { history, showModal, setSelectedItem, removeFromHistoryStore, updateHistoryFromStorage } = useHistoryStore(
        useShallow((state) => ({
            showModal: state.showModal,
            setSelectedItem: state.setSelectedItem,
            removeFromHistoryStore: state.removeFromHistory,
            history: state.history,
            updateHistoryFromStorage: state.updateHistoryFromStorage,
        }))
    );

    useEffect(() => {
        updateHistoryFromStorage();
    }, [updateHistoryFromStorage]);

    const handleItemClick = (item: HistoryItemType) => {
        setSelectedItem(item);
        showModal();
    };

    const handleDeleteItem = (id: string) => {
        removeFromHistory(id);
        removeFromHistoryStore(id);
    };

    return (
        <div className={styles.list}>
            {history.map((item) => (
                <HistoryItem key={item.id} item={item} onClick={handleItemClick} onDelete={handleDeleteItem} />
            ))}
        </div>
    );
};
