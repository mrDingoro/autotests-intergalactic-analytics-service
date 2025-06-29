import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Modal } from '../Modal';

describe('Интеграционные тесты Modal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Рендеринг и видимость', () => {
        it('должен отображать модальное окно, когда isOpen = true', () => {
            render(
                <Modal isOpen={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>
            );

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });

        it('не должен отображать модальное окно, когда isOpen = false', () => {
            render(
                <Modal isOpen={false} onClose={mockOnClose}>
                    <div data-testid="modal-content">Modal Content</div>
                </Modal>
            );

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
            expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument();
        });

        it('должен отображать кнопку закрытия, когда onClose предоставлен', () => {
            render(
                <Modal isOpen={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Modal>
            );

            expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
        });

        it('не должен отображать кнопку закрытия, когда onClose не предоставлен', () => {
            render(
                <Modal isOpen={true}>
                    <div>Content</div>
                </Modal>
            );

            expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument();
        });
    });

    describe('Функциональность кнопки закрытия', () => {
        it('должен вызывать onClose при клике на кнопку закрытия', async () => {
            const user = userEvent.setup();

            render(
                <Modal isOpen={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Modal>
            );

            const closeButton = screen.getByTestId('modal-close-button');
            await user.click(closeButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Функциональность клика по фону', () => {
        it('должен вызывать onClose при клике по фону', () => {
            render(
                <Modal isOpen={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Modal>
            );

            const backdrop = screen.getByTestId('modal-backdrop');
            expect(backdrop).toBeInTheDocument();

            fireEvent.click(backdrop!);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('не должен вызывать onClose при клике по фону, если onClose не предоставлен', () => {
            render(
                <Modal isOpen={true}>
                    <div>Content</div>
                </Modal>
            );

            const backdrop = screen.getByTestId('modal-backdrop');
            fireEvent.click(backdrop!);

            expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument();
        });
    });

    describe('Распространение событий', () => {
        it('не должен вызывать onClose при клике по содержимому модального окна', () => {
            render(
                <Modal isOpen={true} onClose={mockOnClose}>
                    <div data-testid="modal-content">Content</div>
                </Modal>
            );

            const modalContent = screen.getByTestId('modal-content');
            fireEvent.click(modalContent);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('не должен вызывать onClose при клике внутри области модального окна', () => {
            render(
                <Modal isOpen={true} onClose={mockOnClose}>
                    <div>
                        <button data-testid="inside-modal-button">Inside Modal Button</button>
                        <input data-testid="inside-modal-input" placeholder="Inside Modal Input" />
                    </div>
                </Modal>
            );

            fireEvent.click(screen.getByTestId('inside-modal-button'));
            fireEvent.click(screen.getByTestId('inside-modal-input'));

            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Интеграция с Portal', () => {
        it('должен отображать модальное окно вне дерева компонентов через portal', () => {
            render(
                <div data-testid="app-root">
                    <Modal isOpen={true} onClose={mockOnClose}>
                        <div data-testid="modal-content">Portal Content</div>
                    </Modal>
                </div>
            );

            const appRoot = screen.getByTestId('app-root');
            const modalContent = screen.getByTestId('modal-content');

            expect(appRoot).not.toContainElement(modalContent);

            expect(modalContent).toBeInTheDocument();
        });
    });
});
