import { useCallback } from 'react';

import { AnalysisHighlight } from '@app-types/analysis';
import { Highlights } from '@app-types/common';
import { InvalidServerResponseError, transformAnalysisData } from '@utils/analysis';
import { API_HOST } from '@utils/consts';

const DEFAULT_ROWS = 10000;

interface CsvAnalysisParams {
    onData: (data: AnalysisHighlight[]) => void;
    onError: (error: Error) => void;
    onComplete: (highlights?: Highlights) => void;
}

export const useCsvAnalysis = ({ onData, onError, onComplete }: CsvAnalysisParams) => {
    const analyzeCsv = useCallback(
        async (csv: File) => {
            try {
                const formData = new FormData();
                formData.append('file', csv);

                const response = await fetch(`${API_HOST}/aggregate?rows=${DEFAULT_ROWS}`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.body) {
                    throw new Error('Пустой ответ от сервера :(');
                }

                if (!response.ok) {
                    throw new Error('Неизвестная ошибка при попытке обработать файл :(');
                }

                const reader = response.body.getReader();
                let isDone = false;

                let highlights: Highlights | undefined = undefined;

                while (!isDone) {
                    const { done, value } = await reader.read();

                    isDone = done;
                    if (done) {
                        onComplete(highlights);
                        break;
                    }
                    if (value) {
                        const { highlights: highlightsFromApi, highlightsToStore } = transformAnalysisData(value);
                        highlights = highlightsFromApi;
                        onData(highlightsToStore);
                    }
                }
            } catch (error) {
                if (error instanceof InvalidServerResponseError) {
                    onError(error);
                    return;
                }

                onError(new Error('Неизвестная ошибка парсинга :('));
            }
        },
        [onData, onError, onComplete]
    );

    return { analyzeCsv };
};
