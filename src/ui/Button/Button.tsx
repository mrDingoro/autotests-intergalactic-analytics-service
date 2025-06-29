import React, { ButtonHTMLAttributes, FC } from 'react';

import cn from 'classnames';

import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'download' | 'upload' | 'clear';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    fullWidth?: boolean;
    children: React.ReactNode;
};

export const Button: FC<Props> = ({
    variant = 'primary',
    children,
    fullWidth = false,
    className = '',
    disabled = false,
    ...rest
}) => {
    return (
        <button
            className={cn(
                styles.button,
                styles[variant],
                {
                    [styles.fullWidth]: fullWidth,
                    [styles.disabled]: disabled,
                },
                className
            )}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    );
};
