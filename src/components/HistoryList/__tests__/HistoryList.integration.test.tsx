import { HistoryItemType } from '@app-types/history';
import { HistoryList } from '@components/HistoryList';
import { useHistoryStore } from '@store/historyStore';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addToHistory, clearHistory, getHistory, removeFromHistory } from '@utils/storage';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Интеграционные тесты HistoryList', () => {
    const mockHistoryItem1: HistoryItemType = {
        id: 'test-id-1',
        fileName: 'first-file-data.csv',
        timestamp: Date.now() - 1000,
        highlights: {
            total_spend_galactic: 1500,
            rows_affected: 150,
            less_spent_at: 2,
            big_spent_at: 300,
            less_spent_value: 15,
            big_spent_value: 750,
            average_spend_galactic: 75,
            big_spent_civ: 'robots',
            less_spent_civ: 'elves',
        },
    };

    const mockHistoryItem2: HistoryItemType = {
        id: 'test-id-2',
        fileName: 'second-file-data.csv',
        timestamp: Date.now(),
        highlights: {
            total_spend_galactic: 2000,
            rows_affected: 200,
            less_spent_at: 1,
            big_spent_at: 365,
            less_spent_value: 20,
            big_spent_value: 1000,
            average_spend_galactic: 100,
            big_spent_civ: 'aliens',
            less_spent_civ: 'humans',
        },
    };

    beforeEach(() => {
        // Очищаем localStorage
        clearHistory();

        // Очищаем store
        act(() => {
            const store = useHistoryStore.getState();
            store.hideModal();
            store.resetSelectedItem();
            store.clearHistory();
        });

        // Сбрасываем моки localStorage
        vi.clearAllMocks();
    });

    // Отладочный тест для проверки localStorage
    it('должен правильно работать с localStorage', () => {
        // Проверяем, что localStorage пуст
        expect(getHistory()).toHaveLength(0);

        // Добавляем элемент
        const _item = addToHistory({
            fileName: 'test.csv',
            highlights: mockHistoryItem1.highlights,
        });

        // Проверяем, что элемент добавлен
        const history = getHistory();
        expect(history).toHaveLength(1);
        expect(history[0].fileName).toBe('test.csv');
    });

    describe('Начальная загрузка и синхронизация', () => {
        it('должен загружать историю из localStorage при монтировании', async () => {
            // Добавляем данные в localStorage
            const _item1 = addToHistory({
                fileName: 'first-file-data.csv',
                highlights: mockHistoryItem1.highlights,
            });
            const _item2 = addToHistory({
                fileName: 'second-file-data.csv',
                highlights: mockHistoryItem2.highlights,
            });

            // Проверяем, что данные действительно добавлены
            const history = getHistory();
            expect(history).toHaveLength(2);

            render(<HistoryList />);

            // Ждем, пока компонент загрузит данные из localStorage
            await waitFor(() => {
                const store = useHistoryStore.getState();
                expect(store.history).toHaveLength(2);
            });

            // Теперь проверяем, что элементы отображаются
            await waitFor(() => {
                expect(screen.getByText('first-file-data.csv')).toBeInTheDocument();
                expect(screen.getByText('second-file-data.csv')).toBeInTheDocument();
            });
        });

        it('должен отображать пустое состояние когда история не существует', () => {
            render(<HistoryList />);

            expect(screen.queryByText('.csv')).not.toBeInTheDocument();
        });

        it('должен синхронизировать store с данными из localStorage', async () => {
            const _item = addToHistory({
                fileName: 'first-file-data.csv',
                highlights: mockHistoryItem1.highlights,
            });

            render(<HistoryList />);

            await waitFor(() => {
                const history = getHistory();

                expect(history).toHaveLength(1);
                expect(history[0].fileName).toBe('first-file-data.csv');
                expect(history[0].id).toMatch(/^test-uuid-/);
            });
        });
    });

    describe('Интеграция с store', () => {
        it('должен обновлять отображение когда история в store изменяется', async () => {
            render(<HistoryList />);

            expect(screen.queryByText('first-file-data.csv')).not.toBeInTheDocument();

            act(() => {
                addToHistory({
                    fileName: 'first-file-data.csv',
                    highlights: mockHistoryItem1.highlights,
                });
                useHistoryStore.getState().updateHistoryFromStorage();
            });

            // Проверяем, что данные добавлены в localStorage
            const history = getHistory();
            expect(history).toHaveLength(1);

            // Ждем обновления store
            await waitFor(() => {
                const store = useHistoryStore.getState();
                expect(store.history).toHaveLength(1);
            });

            // Ждем отображения в DOM
            await waitFor(() => {
                expect(screen.getByText('first-file-data.csv')).toBeInTheDocument();
            });
        });

        it('должен вызывать updateHistoryFromStorage при монтировании', async () => {
            const spy = vi.spyOn(useHistoryStore.getState(), 'updateHistoryFromStorage');

            render(<HistoryList />);

            await waitFor(() => {
                expect(spy).toHaveBeenCalled();
            });

            spy.mockRestore();
        });

        it('должен отражать изменения состояния store немедленно', async () => {
            act(() => {
                addToHistory({
                    fileName: 'first-file-data.csv',
                    highlights: mockHistoryItem1.highlights,
                });

                addToHistory({
                    fileName: 'second-file-data.csv',
                    highlights: mockHistoryItem2.highlights,
                });
            });

            // Проверяем, что данные добавлены в localStorage
            const history = getHistory();
            expect(history).toHaveLength(2);

            render(<HistoryList />);

            // Ждем обновления store
            await waitFor(() => {
                const store = useHistoryStore.getState();
                expect(store.history).toHaveLength(2);
            });

            // Ждем отображения в DOM
            await waitFor(() => {
                expect(screen.getByText('first-file-data.csv')).toBeInTheDocument();
                expect(screen.getByText('second-file-data.csv')).toBeInTheDocument();
            });

            // Remove the first item from history
            const historyAfterRender = getHistory();
            const firstItemId = historyAfterRender[0].id;
            const firstItemFileName = historyAfterRender[0].fileName;

            act(() => {
                removeFromHistory(firstItemId);
                useHistoryStore.getState().updateHistoryFromStorage();
            });

            await waitFor(() => {
                if (firstItemFileName === 'first-file-data.csv') {
                    expect(screen.queryByText('first-file-data.csv')).not.toBeInTheDocument();
                    expect(screen.getByText('second-file-data.csv')).toBeInTheDocument();
                } else {
                    expect(screen.getByText('first-file-data.csv')).toBeInTheDocument();
                    expect(screen.queryByText('second-file-data.csv')).not.toBeInTheDocument();
                }
            });
        });
    });

    describe('Взаимодействие с элементами', () => {
        it('должен открывать модальное окно с правильными данными при клике на элемент', async () => {
            const user = userEvent.setup();

            act(() => {
                addToHistory({
                    fileName: 'first-file-data.csv',
                    highlights: mockHistoryItem1.highlights,
                });
            });

            // Проверяем, что данные добавлены в localStorage
            const history = getHistory();
            expect(history).toHaveLength(1);

            render(<HistoryList />);

            // Ждем обновления store и отображения
            await waitFor(() => {
                const store = useHistoryStore.getState();
                expect(store.history).toHaveLength(1);
            });

            await waitFor(() => {
                expect(screen.getByText('first-file-data.csv')).toBeInTheDocument();
            });

            const historyAfterRender = getHistory();

            const historyItem = historyAfterRender.find((item) => item.fileName === 'first-file-data.csv');

            expect(historyItem).toBeDefined();

            const clickableButton = screen.getByTestId(`open-button-${historyItem!.id}`);
            expect(clickableButton).toBeInTheDocument();

            await user.click(clickableButton);

            await waitFor(() => {
                expect(useHistoryStore.getState().isOpenModal).toBe(true);
            });
        });

        it('должен правильно обрабатывать клики на разные элементы', async () => {
            const user = userEvent.setup();

            act(() => {
                addToHistory({
                    fileName: 'first-file-data.csv',
                    highlights: mockHistoryItem1.highlights,
                });
                addToHistory({
                    fileName: 'second-file-data.csv',
                    highlights: mockHistoryItem2.highlights,
                });
            });

            // Проверяем, что данные добавлены в localStorage
            const history = getHistory();
            expect(history).toHaveLength(2);

            render(<HistoryList />);

            // Ждем обновления store и отображения
            await waitFor(() => {
                const store = useHistoryStore.getState();
                expect(store.history).toHaveLength(2);
            });

            await waitFor(() => {
                expect(screen.getByText('first-file-data.csv')).toBeInTheDocument();
                expect(screen.getByText('second-file-data.csv')).toBeInTheDocument();
            });

            const historyAfterRender = getHistory();

            const historyItem = historyAfterRender.find((item) => item.fileName === 'first-file-data.csv');

            if (historyItem) {
                const clickableButton = screen.getByTestId(`open-button-${historyItem.id}`);
                expect(clickableButton).toBeInTheDocument();

                await user.click(clickableButton);
                expect(useHistoryStore.getState().selectedItem?.id).toBe(historyItem.id);
            }

            // Click second item
            const historyItem2 = historyAfterRender.find((item) => item.fileName === 'second-file-data.csv');

            if (historyItem2) {
                const clickableButton2 = screen.getByTestId(`open-button-${historyItem2.id}`);
                expect(clickableButton2).toBeInTheDocument();

                await user.click(clickableButton2);
                expect(useHistoryStore.getState().selectedItem?.id).toBe(historyItem2.id);
            }
        });
    });

    describe('Удаление элементов', () => {
        it('должен удалять элемент из хранилища и store при удалении', async () => {
            const user = userEvent.setup();

            act(() => {
                addToHistory({
                    fileName: 'first-file-data.csv',
                    highlights: mockHistoryItem1.highlights,
                });
                addToHistory({
                    fileName: 'second-file-data.csv',
                    highlights: mockHistoryItem2.highlights,
                });
            });

            // Проверяем, что данные добавлены в localStorage
            const history = getHistory();
            expect(history).toHaveLength(2);

            render(<HistoryList />);

            // Ждем обновления store и отображения
            await waitFor(() => {
                const store = useHistoryStore.getState();
                expect(store.history).toHaveLength(2);
            });

            await waitFor(() => {
                expect(screen.getByText('first-file-data.csv')).toBeInTheDocument();
                expect(screen.getByText('second-file-data.csv')).toBeInTheDocument();
            });

            const historyAfterRender = getHistory();

            const historyItem = historyAfterRender.find((item) => item.fileName === 'first-file-data.csv');

            if (historyItem) {
                const deleteButton = screen.getByTestId(`delete-button-${historyItem.id}`);

                await user.click(deleteButton);

                await waitFor(() => {
                    expect(useHistoryStore.getState().history).toHaveLength(1);
                    useHistoryStore.getState().updateHistoryFromStorage();
                });

                expect(screen.queryByText('first-file-data.csv')).not.toBeInTheDocument();
                expect(screen.getByText('second-file-data.csv')).toBeInTheDocument();
            }
        });
    });

    describe('Обработка ошибок', () => {
        it('должен обрабатывать поврежденные данные localStorage', async () => {
            act(() => {
                localStorage.setItem('tableHistory', 'invalid json');
            });

            expect(() => render(<HistoryList />)).not.toThrow();
        });

        it('должен корректно обрабатывать отсутствующие данные элемента', () => {
            const incompleteItem = {
                highlights: {},
                fileName: 'first-file-data.csv',
            } as HistoryItemType;

            act(() => {
                addToHistory(incompleteItem);
            });

            expect(() => render(<HistoryList />)).not.toThrow();
        });
    });
});
