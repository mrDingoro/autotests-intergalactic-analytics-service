import { Header } from '@components/Header';
import { Outlet } from 'react-router-dom';

import styles from './MainLayout.module.css';

export const MainLayout = () => {
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
};
