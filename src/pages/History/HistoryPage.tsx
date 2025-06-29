import { ClearHistoryButton } from '@components/ClearHistoryButton';
import { GenerateMoreButton } from '@components/GenerateMoreButton';
import { HistoryList } from '@components/HistoryList';
import { HistoryModal } from '@components/HistoryModal';

import styles from './HistoryPage.module.css';

export const HistoryPage = () => {
    return (
        <div className={styles.container}>
            <HistoryList />
            <div className={styles.actions}>
                <GenerateMoreButton />
                <ClearHistoryButton />
            </div>
            <HistoryModal />
        </div>
    );
};
