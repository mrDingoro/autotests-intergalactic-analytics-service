import { PersistOptions } from 'zustand/middleware';

/**
 * Создает конфигурацию для persist middleware
 * @param name - имя для localStorage
 * @param persistedKeys - ключи состояния, которые нужно сохранять
 * @returns PersistOptions
 */
export function createPersistConfig<T extends object>(name: string, persistedKeys: (keyof T)[]): PersistOptions<T, T> {
    return {
        name,
        partialize: (state) =>
            Object.fromEntries(Object.entries(state).filter(([key]) => persistedKeys.includes(key as keyof T))) as T,
    };
}
