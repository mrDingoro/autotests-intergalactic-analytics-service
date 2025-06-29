import { FC } from 'react';

import { IconBaseProps } from '@app-types/common';

export const SvgBase: FC<IconBaseProps> = ({ size, children, ...rest }) => (
    <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
    >
        {children}
    </svg>
);
