import React, { FC, PropsWithChildren } from 'react';

import { Button } from '@ui/Button';
import { Cross } from '@ui/icons/Cross';
import cn from 'classnames';

import { Portal } from '../Portal';

import styles from './Modal.module.css';

type Props = PropsWithChildren & {
    isOpen: boolean;
    onClose?: () => void;
};

export const Modal: FC<Props> = ({ isOpen, children, onClose }) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Portal>
            <div
                className={cn(styles.backdrop, {
                    [styles.backdropShown]: isOpen,
                })}
                onClick={handleBackdropClick}
            >
                <div className={styles.modal} onClick={handleModalClick}>
                    {onClose && (
                        <Button variant="clear" className={styles.closeButton} onClick={onClose}>
                            <Cross size={32} />
                        </Button>
                    )}
                    {children}
                </div>
            </div>
        </Portal>
    );
};
