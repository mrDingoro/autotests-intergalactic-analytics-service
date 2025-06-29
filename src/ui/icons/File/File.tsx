import { FC } from 'react';

import { IconBaseProps } from '@app-types/common';
import { SvgBase } from '@ui/SvgBase';

export const File: FC<IconBaseProps> = ({ size, ...rest }) => (
    <SvgBase size={size} {...rest}>
        <path
            d="M15.8684 21.8773H24.1317M15.8684 27.3862H20M8.98233 9.48245V31.5178C8.98233 32.2483 9.27253 32.9489 9.78908 33.4655C10.3056 33.982 11.0062 34.2722 11.7368 34.2722H28.2633C28.9938 34.2722 29.6944 33.982 30.211 33.4655C30.7275 32.9489 31.0177 32.2483 31.0177 31.5178V15.4623C31.0177 15.0954 30.9443 14.7321 30.8019 14.3939C30.6595 14.0557 30.451 13.7494 30.1886 13.4929L24.0738 7.51304C23.5592 7.00988 22.8682 6.72812 22.1485 6.72803H11.7368C11.0062 6.72803 10.3056 7.01822 9.78908 7.53478C9.27253 8.05133 8.98233 8.75193 8.98233 9.48245Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M22.7547 6.72803V12.2369C22.7547 12.9674 23.0449 13.668 23.5615 14.1845C24.078 14.7011 24.7786 14.9913 25.5091 14.9913H31.018"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
        />
    </SvgBase>
);
