import { Highlights } from '@app-types/common';
import { describe, it, expect } from 'vitest';

import {
    transformAnalysisData,
    convertHighlightsToArray,
    isCsvFile,
    validateServerResponse,
    InvalidServerResponseError,
} from '../analysis';

describe('analysis utils', () => {
    describe('isCsvFile', () => {
        it('должен возвращать true для CSV файлов', () => {
            const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
            expect(isCsvFile(csvFile)).toBe(true);
        });

        it('должен возвращать true для CSV файлов в верхнем регистре', () => {
            const csvFile = new File(['test'], 'TEST.CSV', { type: 'text/csv' });
            expect(isCsvFile(csvFile)).toBe(true);
        });

        it('должен возвращать false для не-CSV файлов', () => {
            const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });
            expect(isCsvFile(txtFile)).toBe(false);
        });

        it('должен возвращать false для файлов без расширения', () => {
            const noExtFile = new File(['test'], 'test', { type: 'text/plain' });
            expect(isCsvFile(noExtFile)).toBe(false);
        });
    });

    describe('validateServerResponse', () => {
        it('должен возвращать true для валидного ответа с хайлайтами', () => {
            const validResponse = {
                total_spend_galactic: 1000,
                rows_affected: 100,
                average_spend_galactic: 10,
            };
            expect(validateServerResponse(validResponse)).toBe(true);
        });

        it('должен возвращать false для ответа без валидных ключей', () => {
            const invalidResponse = {
                unknown_key: 123,
                another_unknown: 'test',
            };
            expect(validateServerResponse(invalidResponse)).toBe(false);
        });

        it('должен возвращать true если есть хотя бы один валидный ключ', () => {
            const partiallyValidResponse = {
                total_spend_galactic: 1000,
                unknown_key: 123,
            };
            expect(validateServerResponse(partiallyValidResponse)).toBe(true);
        });
    });

    describe('convertHighlightsToArray', () => {
        it('должен преобразовать объект highlights в массив', () => {
            const highlights: Highlights = {
                total_spend_galactic: 1000.5,
                rows_affected: 100,
                less_spent_at: 1,
                big_spent_at: 365,
                less_spent_value: 10.2,
                big_spent_value: 500.8,
                average_spend_galactic: 50.25,
                big_spent_civ: 'monsters',
                less_spent_civ: 'humans',
            };

            const result = convertHighlightsToArray(highlights);

            expect(result).toHaveLength(9);
            expect(result[0]).toEqual({
                title: '1001',
                description: 'Общие расходы',
            });
            expect(result[7]).toEqual({
                title: 'monsters',
                description: 'Цивилизация max расходов',
            });
        });

        it('должен корректно обрабатывать числа с округлением', () => {
            const highlights: Highlights = {
                total_spend_galactic: 1000.7,
                rows_affected: 100,
                less_spent_at: 1,
                big_spent_at: 365,
                less_spent_value: 10,
                big_spent_value: 500,
                average_spend_galactic: 50,
                big_spent_civ: 'monsters',
                less_spent_civ: 'humans',
            };

            const result = convertHighlightsToArray(highlights);
            expect(result[0].title).toBe('1001');
        });

        it('должен возвращать Неизвестный параметр для неизвестных ключей', () => {
            const highlights = {
                unknown_key: 123,
                total_spend_galactic: 1000.7,
                rows_affected: 100,
                less_spent_at: 1,
                big_spent_at: 365,
                less_spent_value: 10,
                big_spent_value: 500,
                average_spend_galactic: 50,
                big_spent_civ: 'monsters',
                less_spent_civ: 'humans',
            };

            const result = convertHighlightsToArray(highlights);

            expect(result[0].description).toBe('Неизвестный параметр');
        });
    });

    describe('transformAnalysisData', () => {
        it('должен корректно трансформировать валидные данные', () => {
            const mockData = {
                total_spend_galactic: 1000,
                rows_affected: 100,
                average_spend_galactic: 50,
                less_spent_at: 1,
                big_spent_at: 365,
                less_spent_value: 10,
                big_spent_value: 500,
                big_spent_civ: 'monsters',
                less_spent_civ: 'humans',
            };

            const withoutRowsAffected = {
                total_spend_galactic: 1000,
                average_spend_galactic: 50,
                less_spent_at: 1,
                big_spent_at: 365,
                less_spent_value: 10,
                big_spent_value: 500,
                big_spent_civ: 'monsters',
                less_spent_civ: 'humans',
            };

            const mockValue = new TextEncoder().encode(JSON.stringify(mockData) + '\n');

            const result = transformAnalysisData(mockValue);
            expect(result.highlights).toEqual(withoutRowsAffected);
            expect(result.highlightsToStore).toHaveLength(8);
            expect(result.highlightsToStore[0]).toEqual({
                title: '1000',
                description: 'Общие расходы',
            });
        });

        it('должен выбрасывать InvalidServerResponseError для невалидных данных', () => {
            const invalidData = {
                unknown_key: 123,
                another_unknown: 'test',
            };

            const mockValue = new TextEncoder().encode(JSON.stringify(invalidData) + '\n');

            expect(() => transformAnalysisData(mockValue)).toThrow(InvalidServerResponseError);
            expect(() => transformAnalysisData(mockValue)).toThrow('Файл не был корректно обработан на сервере :(');
        });

        it('должен корректно парсить первый JSON объект из строки', () => {
            const mockData1 = { total_spend_galactic: 1000 };
            const mockData2 = { total_spend_galactic: 2000 };

            const multilineData = JSON.stringify(mockData1) + '\n' + JSON.stringify(mockData2);
            const mockValue = new TextEncoder().encode(multilineData);

            const result = transformAnalysisData(mockValue);

            expect(result.highlights.total_spend_galactic).toBe(1000);
        });
    });
});
