import { useRef } from 'react';

type DebounceType = 'animation' | 'timeout';

interface UseDebounceOptions {
    /**
     * Тип дебаунса:
     * - 'animation' — через requestAnimationFrame (обычно ~16ms)
     * - 'timeout' — через setTimeout с миллисекундами задержки
     */
    type?: DebounceType;
    /**
     * Задержка в миллисекундах (только для type="timeout")
     * Игнорируется, если type === 'animation'
     */
    delay?: number;
}

/**
 * useDebounceHook(fn, {type, delay})
 *
 * type: 'animation' — дебаунс через requestAnimationFrame (по умолчанию)
 * type: 'timeout' — дебаунс через setTimeout, задержка задается в delay
 */
export const useDebounce = function <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult,
    options: UseDebounceOptions = {}
) {
    const { type = 'animation', delay = 100 } = options;

    const state = useRef({
        queue: [] as Parameters<typeof fn>[],
        isUpdating: false,
        timeoutId: null as ReturnType<typeof setTimeout> | null,
    });

    const run = () => {
        if (state.current.queue.length === 0) {
            state.current.isUpdating = false;
            return;
        }

        if (type === 'animation') {
            requestAnimationFrame(() => {
                const args = state.current.queue.shift()!;
                fn(...args);
                run();
            });
        } else {
            // type === 'timeout'
            state.current.timeoutId = setTimeout(() => {
                const args = state.current.queue.shift()!;
                fn(...args);
                run();
            }, delay);
        }
    };

    return (...args: Parameters<typeof fn>) => {
        state.current.queue.push(args);

        if (!state.current.isUpdating) {
            state.current.isUpdating = true;
            run();
        }
    };
};
