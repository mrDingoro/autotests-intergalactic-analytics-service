import { StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Middleware для Redux DevTools
 */
export const reduxDevtools = <T>(f: StateCreator<T>, name?: string) => devtools(f, { name: name || 'store' });
