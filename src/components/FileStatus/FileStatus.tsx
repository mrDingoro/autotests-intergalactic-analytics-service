import { FC } from 'react';

import { Smile } from '@ui/icons/Smile';
import { SmileSad } from '@ui/icons/SmileSad';
import { Typography } from '@ui/Typography';
import cn from 'classnames';

import styles from './FileStatus.module.css';

type Props = {
    type: 'success' | 'error';
    isActive: boolean;
};
export const FileStatus: FC<Props> = ({ type, isActive }) => {
    return (
        <span className={cn(styles.root, { [styles.active]: isActive })}>
            {type === 'success' ? (
                <>
                    <Typography>Обработан успешно</Typography>
                    <Smile size={40} />
                </>
            ) : (
                <>
                    <Typography>Не удалось обработать</Typography>
                    <SmileSad size={40} />
                </>
            )}
        </span>
    );
};
