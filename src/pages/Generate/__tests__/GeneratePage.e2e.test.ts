import { test, expect } from '@playwright/test';

/**
 * End-to-End Tests for GeneratePage
 *
 * Tests the CSV generation functionality including:
 * - Page rendering and navigation
 * - API integration with success/error scenarios
 * - Loading states and user feedback
 * - File download functionality
 * - Error handling and display
 */

test.describe('E2E тесты страницы генерации', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/generate');
    });

    test.describe('Рендеринг страницы', () => {
        test('должен корректно отображать элементы страницы', async ({ page }) => {
            await expect(
                page.getByRole('heading', {
                    name: 'Сгенерируйте готовый csv-файл нажатием одной кнопки',
                })
            ).toBeVisible();

            const generateButton = page.getByTestId('generate-button');
            await expect(generateButton).toBeVisible();
            await expect(generateButton).toBeEnabled();

            await expect(page.getByText('Отчёт успешно сгенерирован!')).not.toBeVisible();
            await expect(page.getByText(/Произошла ошибка/)).not.toBeVisible();
        });

        test('должен быть доступен через навигацию', async ({ page }) => {
            await page.goto('/');

            await page.getByRole('link', { name: /CSV Генератор/i }).click();

            await expect(page).toHaveURL('/generate');
            await expect(
                page.getByRole('heading', {
                    name: 'Сгенерируйте готовый csv-файл нажатием одной кнопки',
                })
            ).toBeVisible();
        });
    });

    test.describe('Процесс генерации CSV', () => {
        test('должен успешно генерировать и скачивать CSV файл', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 100));

                const csvContent = 'id,name,value\n1,Test,100\n2,Example,200';
                const buffer = Buffer.from(csvContent, 'utf-8');

                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=report.csv',
                    },
                    body: buffer,
                });
            });

            const downloadPromise = page.waitForEvent('download');

            const generateButton = page.getByTestId('generate-button');
            await generateButton.click();

            await expect(page.locator('[data-testid="loader"]')).toBeVisible();
            await expect(generateButton).toBeDisabled();

            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBe('report.csv');

            await expect(page.getByText('Отчёт успешно сгенерирован!')).toBeVisible();

            await expect(generateButton).toBeEnabled();
            await expect(generateButton).toHaveText('Начать генерацию');
        });

        test('должен показывать состояние загрузки во время генерации', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));

                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=report.csv',
                    },
                    body: 'id,name\n1,test',
                });
            });

            const generateButton = page.getByTestId('generate-button');

            await generateButton.click();

            await expect(page.locator('[data-testid="loader"]')).toBeVisible();
            await expect(generateButton).toBeDisabled();

            await expect(generateButton).not.toHaveText('Начать генерацию');

            await expect(page.getByText('Отчёт успешно сгенерирован!')).toBeVisible();
            await expect(generateButton).toBeEnabled();
        });

        test('должен корректно обрабатывать ошибки API', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        error: 'Internal server error during CSV generation',
                    }),
                });
            });

            const generateButton = page.getByTestId('generate-button');

            await generateButton.click();

            await expect(page.getByText(/Произошла ошибка: Internal server error during CSV generation/)).toBeVisible();

            await expect(generateButton).toBeEnabled();

            await expect(page.getByText('Отчёт успешно сгенерирован!')).not.toBeVisible();
        });

        test('должен обрабатывать сетевые ошибки', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await route.fulfill({
                    status: 503,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Service Unavailable' }),
                });
            });

            const generateButton = page.getByTestId('generate-button');

            await generateButton.click();

            await expect(page.getByText('Неизвестная ошибка при попытке сгенерировать отчёт')).toBeVisible();

            await expect(generateButton).toBeEnabled();
        });

        test('должен обрабатывать некорректные ответы с ошибками', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Bad request',
                    }),
                });
            });

            const generateButton = page.getByTestId('generate-button');

            await generateButton.click();

            await expect(page.getByText('Неизвестная ошибка при попытке сгенерировать отчёт')).toBeVisible();
        });
    });

    test.describe('Пользовательский опыт', () => {
        test('должен скрывать сообщение об успехе после таймаута', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=report.csv',
                    },
                    body: 'test,data\n1,2',
                });
            });

            const downloadPromise = page.waitForEvent('download');

            const generateButton = page.getByTestId('generate-button');

            await generateButton.click();

            await downloadPromise;
            await expect(page.getByText('Отчёт успешно сгенерирован!')).toBeVisible();

            await expect(page.getByText('Отчёт успешно сгенерирован!')).not.toBeVisible({ timeout: 3000 });
        });

        test('должен позволять множественные генерации', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=report.csv',
                    },
                    body: 'test,data\n1,2',
                });
            });

            const generateButton = page.getByTestId('generate-button');

            // Первая генерация
            const firstDownloadPromise = page.waitForEvent('download');
            await generateButton.click();
            await firstDownloadPromise;
            await expect(page.getByText('Отчёт успешно сгенерирован!')).toBeVisible();

            // Вторая генерация
            const secondDownloadPromise = page.waitForEvent('download');
            await generateButton.click();
            await secondDownloadPromise;
            await expect(page.getByText('Отчёт успешно сгенерирован!')).toBeVisible();
        });

    });

    test.describe('Функциональность скачивания файлов', () => {
        test('должен скачивать файл с правильным именем из Content-Disposition', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=report.csv',
                    },
                    body: 'test,data\n1,2',
                });
            });

            const downloadPromise = page.waitForEvent('download');

            const generateButton = page.getByTestId('generate-button');
            await generateButton.click();

            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBe('report.csv');
        });

        test('должен использовать имя файла по умолчанию когда отсутствует Content-Disposition', async ({ page }) => {
            await page.route('**/report?size=0.01', async (route) => {
                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                    },
                    body: 'test,data\n1,2',
                });
            });

            const downloadPromise = page.waitForEvent('download');

            const generateButton = page.getByTestId('generate-button');
            await generateButton.click();

            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBe('report.csv');
        });
    });
});
