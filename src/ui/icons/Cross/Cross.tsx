import { FC } from 'react';

import { IconBaseProps } from '@app-types/common';
import { SvgBase } from '@ui/SvgBase';

export const Cross: FC<IconBaseProps> = ({ size, ...rest }) => (
    <SvgBase size={size} {...rest}>
        <path
            d="M6.66675 25.3332L16.0001 15.9998M16.0001 15.9998L25.3334 6.6665M16.0001 15.9998L6.66675 6.6665M16.0001 15.9998L25.3334 25.3332"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </SvgBase>
);
