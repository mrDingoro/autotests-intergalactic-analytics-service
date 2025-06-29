import { FC } from 'react';

import { IconBaseProps } from '@app-types/common';
import { SvgBase } from '@ui/SvgBase';

export const Trash: FC<IconBaseProps> = ({ size, ...rest }) => (
    <SvgBase size={size} {...rest}>
        <path
            d="M9 30C8.175 30 7.469 29.7065 6.882 29.1195C6.295 28.5325 6.001 27.826 6 27V7.5H4.5V4.5H12V3H21V4.5H28.5V7.5H27V27C27 27.825 26.7065 28.5315 26.1195 29.1195C25.5325 29.7075 24.826 30.001 24 30H9ZM12 24H15V10.5H12V24ZM18 24H21V10.5H18V24Z"
            fill="currentColor"
        />
    </SvgBase>
);
