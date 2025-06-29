import styles from './Header.module.css';
import { Navigation } from './Navigation';
import { Title } from './Title';

export const Header = () => {
    return (
        <header className={styles.header}>
            <Title />
            <Navigation />
        </header>
    );
};
