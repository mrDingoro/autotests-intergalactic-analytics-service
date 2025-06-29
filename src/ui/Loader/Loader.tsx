import styles from './Loader.module.css';

export const Loader = ({ size = 60 }: { size?: number }) => {
    return <div className={styles.loader} style={{ width: size, height: size }} />;
};
