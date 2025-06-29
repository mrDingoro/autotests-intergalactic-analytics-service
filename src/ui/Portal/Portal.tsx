import { FC, PropsWithChildren } from 'react';

import { createPortal } from 'react-dom';

type Props = PropsWithChildren & {
    mountElement?: HTMLElement | null;
};

export const Portal: FC<Props> = ({ children, mountElement }) => {
    const element = mountElement ?? document.body;

    return createPortal(children, element);
};
