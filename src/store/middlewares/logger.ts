import { StateCreator, StoreMutatorIdentifier } from 'zustand';

const IS_DEBUG_MODE =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'logger';

type Logger = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    f: StateCreator<T, Mps, Mcs>,
    name?: string
) => StateCreator<T, Mps, Mcs>;

const logger: Logger = (f, name) => (set, get, store) => {
    if (!IS_DEBUG_MODE) {
        return f(set, get, store);
    }

    type SetState = (
        partial: Parameters<typeof set>[0],
        replace?: Parameters<typeof set>[1],
        actionName?: string
    ) => void;

    const loggedSet: SetState = (partial, replace, actionName) => {
        const prevState = get();
        set(partial, replace);
        const nextState = get();

        console.groupCollapsed(`LOGGER: action ${name || ''} / ${actionName || 'unknown'}`);
        console.log('%c  Prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
        console.log('%c  Action', 'color: #03A9F4; font-weight: bold;', {
            type: actionName,
            payload: partial,
        });
        console.log('%c  Next state', 'color: #4CAF50; font-weight: bold;', nextState);
        console.groupEnd();
    };

    return f(loggedSet as typeof set, get, store);
};

export { logger };
