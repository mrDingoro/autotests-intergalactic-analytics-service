import { renderHook } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';

import { useCsvAnalysis } from '../use-csv-analysis';

describe('Хук useCsvAnalysis', () => {
    let mockOnData: ReturnType<typeof vi.fn>;
    let mockOnError: ReturnType<typeof vi.fn>;
    let mockOnComplete: ReturnType<typeof vi.fn>;
    let mockFile: File;

    beforeEach(() => {
        mockOnData = vi.fn();
        mockOnError = vi.fn();
        mockOnComplete = vi.fn();
        mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });

        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    describe('поведение хука с колбэками', () => {
        it('должен вызывать onError когда fetch завершается с ошибкой', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() =>
                useCsvAnalysis({ onData: mockOnData, onError: mockOnError, onComplete: mockOnComplete })
            );

            await result.current.analyzeCsv(mockFile);

            expect(mockOnError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Неизвестная ошибка парсинга :(',
                })
            );

            expect(mockOnData).not.toHaveBeenCalled();
            expect(mockOnComplete).not.toHaveBeenCalled();
        });

        it('должен вызывать onError когда ответ не содержит body', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                body: null,
            } as Response);

            const { result } = renderHook(() =>
                useCsvAnalysis({ onData: mockOnData, onError: mockOnError, onComplete: mockOnComplete })
            );

            await result.current.analyzeCsv(mockFile);

            expect(mockOnError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Неизвестная ошибка парсинга :(',
                })
            );
        });

        it('должен вызывать onError когда ответ не ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                body: {} as ReadableStream,
            } as Response);

            const { result } = renderHook(() =>
                useCsvAnalysis({ onData: mockOnData, onError: mockOnError, onComplete: mockOnComplete })
            );

            await result.current.analyzeCsv(mockFile);

            expect(mockOnError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Неизвестная ошибка парсинга :(',
                })
            );
        });

        it('должен вызывать fetch с правильными параметрами', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                body: { getReader: () => ({ read: () => Promise.resolve({ done: true }) }) },
            } as unknown as Response);

            const { result } = renderHook(() =>
                useCsvAnalysis({ onData: mockOnData, onError: mockOnError, onComplete: mockOnComplete })
            );

            await result.current.analyzeCsv(mockFile);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/aggregate?rows=10000'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData),
                })
            );
        });
    });

    describe('валидация функции колбэка', () => {
        it('должен создавать функцию analyzeCsv', () => {
            const { result } = renderHook(() =>
                useCsvAnalysis({ onData: mockOnData, onError: mockOnError, onComplete: mockOnComplete })
            );

            expect(result.current).toHaveProperty('analyzeCsv');
            expect(typeof result.current.analyzeCsv).toBe('function');
        });
    });
});
