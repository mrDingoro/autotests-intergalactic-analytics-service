import { Highlights } from '@app-types/common';
import { describe, it, beforeEach, vi, expect } from 'vitest';

import { STORAGE_KEY } from '../consts';
import { getHistory, addToHistory, removeFromHistory, clearHistory } from '../storage';

describe('Утилиты работы с хранилищем', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockHighlights: Highlights = {
        total_spend_galactic: 1000,
        rows_affected: 100,
        less_spent_at: 1,
        big_spent_at: 365,
        less_spent_value: 10,
        big_spent_value: 500,
        average_spend_galactic: 50,
        big_spent_civ: 'monsters',
        less_spent_civ: 'humans',
    };

    describe('addToHistory', () => {
        it('должен добавлять новый элемент в пустую историю', () => {
            vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});

            const result = addToHistory({
                fileName: 'test.csv',
                highlights: mockHighlights,
            });

            expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.stringContaining('test.csv'));

            expect(result.fileName).toBe('test.csv');
            expect(result.id).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });

        it('должен добавлять новый элемент в начало существующей истории', () => {
            const existingHistory = [{ id: 'old-id', timestamp: 123456, fileName: 'old.csv' }];

            vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingHistory));
            vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});

            addToHistory({
                fileName: 'new.csv',
                highlights: mockHighlights,
            });

            const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
            const savedHistory = JSON.parse(setItemCalls[0][1]);

            expect(savedHistory[0].fileName).toBe('new.csv');
            expect(savedHistory[1].fileName).toBe('old.csv');
        });

        it('должен корректно обрабатывать ошибки localStorage', () => {
            vi.spyOn(localStorage, 'getItem').mockReturnValue('[]');
            vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
                throw new Error('setItem testing=> localStorage error');
            });

            expect(() =>
                addToHistory({
                    fileName: 'test.csv',
                    highlights: mockHighlights,
                })
            ).toThrow('setItem testing=> localStorage error');
        });
    });

    describe('getHistory', () => {
        it('должен возвращать пустой массив, если localStorage пуст', () => {
            vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

            const history = getHistory();

            expect(history).toEqual([]);
        });

        it('должен возвращать распарсенную историю из localStorage', () => {
            const mockHistoryData = [
                {
                    id: '1',
                    timestamp: Date.now(),
                    fileName: 'test.csv',
                    highlights: mockHighlights,
                },
            ];

            vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockHistoryData));

            const history = getHistory();

            expect(history).toEqual(mockHistoryData);
        });

        it('должен возвращать пустой массив, если JSON.parse завершился с ошибкой', () => {
            vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid-json{');

            const history = getHistory();

            expect(history).toEqual([]);
        });
    });

    describe('removeFromHistory', () => {
        it('должен удалять элемент с указанным id', () => {
            const existingHistory = [{ id: 'old-id', timestamp: 123456, fileName: 'old.csv' }];

            vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingHistory));
            vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});

            removeFromHistory(existingHistory[0].id);

            const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;

            const withoutTheRemovedOne = setItemCalls[0][1];

            expect(withoutTheRemovedOne).toBe('[]');
        });

        it('должен корректно обрабатывать ошибки localStorage при удалении', () => {
            vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid-json{');
            vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
                throw new Error('remove testing => localStorage error');
            });

            expect(() => removeFromHistory('any-id')).toThrow('remove testing => localStorage error');
        });
    });

    describe('clearHistory', () => {
        it('должен вызывать localStorage.removeItem с правильным ключом', () => {
            vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {});

            clearHistory();

            expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
        });

        it('должен корректно обрабатывать ошибки localStorage при очистке', () => {
            vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
                throw new Error('clear testing => localStorage error');
            });

            expect(() => clearHistory()).toThrow('clear testing => localStorage error');
        });
    });
});
