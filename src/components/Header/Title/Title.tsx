import { Typography } from '@ui/Typography';

import { Logo } from './Logo';
import styles from './Title.module.css';

export const Title = () => {
    return (
        <div className={styles.root}>
            <Logo />
            <Typography className={styles.title} weight="medium" as="h1">
                Межгалактическая аналитика
            </Typography>
        </div>
    );
};
