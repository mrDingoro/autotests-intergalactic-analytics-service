import { Create } from '@ui/icons/Create';
import { History } from '@ui/icons/History';
import { Upload } from '@ui/icons/Upload';

import { NavElement } from './NavElement';
import styles from './Navigation.module.css';

export const Navigation = () => {
    return (
        <nav className={styles.root}>
            <NavElement to="/" title="CSV Аналитик" icon={<Upload size={36} />} end />
            <NavElement to="/generate" title="CSV Генератор" icon={<Create size={36} />} />
            <NavElement to="/history" title="История" icon={<History size={36} />} />
        </nav>
    );
};
