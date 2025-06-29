import { HistoryItemType } from '@app-types/history';
import { HistoryModal } from '@components/HistoryModal';
import { useHistoryStore } from '@store/historyStore';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Интеграционный тест для компонента HistoryModal
 *
 * Тестирует интеграцию модального окна с Zustand store:
 * - Видимость модального окна в зависимости от состояния store
 * - Отображение выбранного элемента и преобразование данных
 * - Функциональность закрытия модального окна
 * - Синхронизация состояния store
 * - Отрисовка карточек highlights
 */
describe('Интеграционные тесты HistoryModal', () => {
    const mockHistoryItem: HistoryItemType = {
        id: 'test-id-123',
        fileName: 'test-data.csv',
        timestamp: Date.now(),
        highlights: {
            total_spend_galactic: 1000,
            rows_affected: 100,
            less_spent_at: 1,
            big_spent_at: 365,
            less_spent_value: 10,
            big_spent_value: 500,
            average_spend_galactic: 50,
            big_spent_civ: 'aliens',
            less_spent_civ: 'humans',
        },
    };

    beforeEach(() => {
        localStorage.clear();

        act(() => {
            const store = useHistoryStore.getState();
            store.hideModal();
            store.resetSelectedItem();
            store.clearHistory();
        });

        document.body.innerHTML = '';
    });

    describe('Видимость модального окна', () => {
        it('не должен отображать модальное окно, если isOpenModal = false', () => {
            render(<HistoryModal />);

            expect(screen.queryByTestId('history-modal-content')).not.toBeInTheDocument();
        });

        it('не должен отображать модальное окно, если не выбран элемент', () => {
            act(() => {
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            expect(screen.queryByTestId('history-modal-content')).not.toBeInTheDocument();
        });

        it('должен отображать модальное окно, если isOpenModal = true и выбран элемент', () => {
            act(() => {
                useHistoryStore.getState().setSelectedItem(mockHistoryItem);
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            expect(screen.getByTestId('history-modal-content')).toBeInTheDocument();
        });
    });

    describe('Интеграция с store', () => {
        it('должен корректно отображать данные выбранного элемента', () => {
            act(() => {
                useHistoryStore.getState().setSelectedItem(mockHistoryItem);
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            expect(screen.getByText('1000')).toBeInTheDocument();
            expect(screen.getByText('Общие расходы')).toBeInTheDocument();
            expect(screen.getByText('aliens')).toBeInTheDocument();
            expect(screen.getByText('humans')).toBeInTheDocument();
        });

        it('должен вызывать hideModal при закрытии модального окна', async () => {
            const user = userEvent.setup();

            act(() => {
                useHistoryStore.getState().setSelectedItem(mockHistoryItem);
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            expect(useHistoryStore.getState().isOpenModal).toBe(true);

            const closeButton = screen.getByTestId('modal-close-button');
            await user.click(closeButton);

            expect(useHistoryStore.getState().isOpenModal).toBe(false);
        });

        it('должен корректно преобразовывать данные через convertHighlightsToArray', () => {
            const itemWithHighlights = {
                ...mockHistoryItem,
                highlights: {
                    total_spend_galactic: 2500,
                    average_spend_galactic: 125,
                    big_spent_civ: 'robots',
                    less_spent_civ: 'elves',
                    rows_affected: 200,
                    less_spent_at: 5,
                    big_spent_at: 350,
                    less_spent_value: 25,
                    big_spent_value: 800,
                },
            };

            act(() => {
                useHistoryStore.getState().setSelectedItem(itemWithHighlights);
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            expect(screen.getByText('2500')).toBeInTheDocument();
            expect(screen.getByText('125')).toBeInTheDocument();
            expect(screen.getByText('robots')).toBeInTheDocument();
            expect(screen.getByText('elves')).toBeInTheDocument();
        });
    });

    describe('Отображение карточек highlights', () => {
        it('должен корректно отображать карточки highlights', () => {
            act(() => {
                useHistoryStore.getState().setSelectedItem(mockHistoryItem);
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            const descriptions = [
                'Общие расходы',
                'День min расходов',
                'День max расходов',
                'Min расходы в день',
                'Max расходы в день',
                'Средние расходы',
                'Цивилизация max расходов',
                'Цивилизация min расходов',
            ];

            descriptions.forEach((description) => {
                expect(screen.getByText(description)).toBeInTheDocument();
            });
        });

        it('должен корректно обрабатывать пустые highlights', () => {
            const itemWithoutHighlights = {
                ...mockHistoryItem,
                highlights: undefined,
            };

            act(() => {
                useHistoryStore.getState().setSelectedItem(itemWithoutHighlights);
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            expect(screen.queryByTestId('history-modal-content')).not.toBeInTheDocument();
        });

        it('должен отображать числовые значения как строки', () => {
            const itemWithNumbers = {
                ...mockHistoryItem,
                highlights: {
                    ...mockHistoryItem.highlights!,
                    total_spend_galactic: 1234.56,
                    average_spend_galactic: 67.89,
                },
            };

            act(() => {
                useHistoryStore.getState().setSelectedItem(itemWithNumbers);
                useHistoryStore.getState().showModal();
            });

            render(<HistoryModal />);

            // Должен округлять и отображать как строки
            expect(screen.getByText('1235')).toBeInTheDocument();
            expect(screen.getByText('68')).toBeInTheDocument();
        });
    });
});
