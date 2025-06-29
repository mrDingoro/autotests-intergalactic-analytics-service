import { useEffect, useState } from 'react';

import { Button } from '@ui/Button';
import { Loader } from '@ui/Loader';
import { Typography } from '@ui/Typography';
import { API_HOST } from '@utils/consts';
import cn from 'classnames';

import styles from './GeneratePage.module.css';

// 10 мб
const DEFAULT_SIZE = 0.01;

export const GeneratePage = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            setError(null);

            const response = await fetch(`${API_HOST}/report?size=${DEFAULT_SIZE}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error
                        ? `Произошла ошибка: ${errorData.error}`
                        : 'Неизвестная ошибка при попытке сгенерировать отчёт'
                );
            }

            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : 'report.csv';

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccessMessage('Отчёт успешно сгенерирован!');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Неизвестная ошибка при попытке сгенерировать отчёт');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timeout = setTimeout(() => {
            setSuccessMessage(null);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [successMessage]);

    return (
        <div className={styles.container}>
            <Typography as="h1" size="m" className={styles.title}>
                Сгенерируйте готовый csv-файл нажатием одной кнопки
            </Typography>

            <Button
                type="button"
                variant="primary"
                disabled={isGenerating}
                onClick={handleGenerate}
                className={cn(styles.generateButton, {
                    [styles.isGenerating]: isGenerating,
                })}
            >
                {isGenerating ? <Loader /> : 'Начать генерацию'}
            </Button>

            {successMessage && (
                <Typography as="p" size="s">
                    {successMessage}
                </Typography>
            )}
            {error && (
                <Typography as="p" size="s" color="error">
                    {error}
                </Typography>
            )}
        </div>
    );
};
