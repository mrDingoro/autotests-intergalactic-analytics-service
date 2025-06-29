import { AnalysisHighlight } from '@app-types/analysis';
import { HIGHLIGHT_TITLES } from '@utils/consts';

import { Highlights } from '../types/common';

/**
 * Кастомная ошибка для некорректных ответов сервера
 */
export class InvalidServerResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidServerResponseError';
    }
}
/**
 * Парсит потоковый ответ от сервера
 * @param value Блок потоковых данных
 * @returns Первый JSON объект из блока
 */
const getFirstJsonObject = (value: Uint8Array): Record<string, string | number> => {
    const decoder = new TextDecoder();
    const textChunk = decoder.decode(value).split('\n')[0];
    return JSON.parse(textChunk);
};

/**
 * Преобразует потоковые данные API в объект хайлайтов.
 * @param value Потоковые данные в формате Uint8Array.
 * @returns.highlights Сырые данные хайлайтов в формате Highlights.
 * @returns.highlightsToStore Массив отформатированных объектов Highlight с полями title и description.
 */
export const transformAnalysisData = (
    value: Uint8Array
): {
    highlights: Highlights;
    highlightsToStore: AnalysisHighlight[];
} => {
    const rawData = getFirstJsonObject(value);

    // TODO: remove this after server validation will be fixed
    if (!validateServerResponse(rawData)) {
        throw new InvalidServerResponseError('Файл не был корректно обработан на сервере :(');
    }

    const { rows_affected: _rows_affected, ...highlights } = rawData;

    const highlightsToStore = convertHighlightsToArray(highlights as Highlights);

    return { highlights: highlights as Highlights, highlightsToStore };
};

/**
 * Преобразует объект Highlights в массив объектов Highlight.
 * @param highlights Объект с данными хайлайтов типа Highlights.
 * @returns Массив объектов Highlight с полями title и description.
 */
export const convertHighlightsToArray = (highlights: Highlights): AnalysisHighlight[] => {
    return Object.entries(highlights).map(([key, title]) => ({
        title: typeof title === 'number' ? String(Math.round(title)) : String(title),
        description: HIGHLIGHT_TITLES[key] ?? 'Неизвестный параметр',
    }));
};

/**
 * Проверяет, является ли файл CSV
 * @param file - Файл для проверки
 * @returns true, если файл является CSV, иначе false
 */
export const isCsvFile = (file: File): boolean => {
    return file.name.toLowerCase().endsWith('.csv');
};
/**
 * Валидирует ответ сервера
 * @param rawData - Сырые данные от сервера
 * @returns true, если ответ валидный, иначе false
 */
export const validateServerResponse = (rawData: Record<string, string | number>) => {
    const validHighlightKeys = Object.keys(HIGHLIGHT_TITLES);
    const responseHighlightKeys = Object.keys(rawData);

    // Проверяем, что в ответе есть хотя бы один ожидаемый ключ
    const hasValidKeys = validHighlightKeys.some((key) => responseHighlightKeys.includes(key));
    if (!hasValidKeys) {
        return false;
    }

    // Проверяем, что нет null значений в полях ответа
    const hasNullValues = Object.values(rawData).some((value) => value === null);
    if (hasNullValues) {
        throw new InvalidServerResponseError('Ответ сервера содержит некорректные данные (null значения)');
    }

    return true;
};
