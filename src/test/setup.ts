import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => {
            return store[key] || null;
        }),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 0);
    return 1;
});

Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
    },
});

global.fetch = vi.fn();

beforeEach(() => {
    localStorageMock.clear();
});
