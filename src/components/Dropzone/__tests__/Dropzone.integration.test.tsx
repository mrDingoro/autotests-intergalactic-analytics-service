import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Dropzone } from '../Dropzone';

describe('Интеграционные тесты Dropzone', () => {
    const mockOnFileSelect = vi.fn();
    const mockOnClear = vi.fn();

    const createMockCsvFile = (name = 'test.csv') => {
        return new File(['col1,col2\nval1,val2'], name, { type: 'text/csv' });
    };

    const createMockTextFile = (name = 'test.txt') => {
        return new File(['some text content'], name, { type: 'text/plain' });
    };

    const createDragEvent = (files: File[]) => {
        return {
            dataTransfer: {
                files: files,
                items: files.map((file) => ({
                    kind: 'file',
                    type: file.type,
                    getAsFile: () => file,
                })),
                types: ['Files'],
            },
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        } as unknown as React.DragEvent;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Начальное состояние и базовый рендер', () => {
        it('должен отображать пустую dropzone с кнопкой загрузки и текстом по умолчанию', () => {
            render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            expect(screen.getByRole('button', { name: 'Загрузить файл' })).toBeInTheDocument();
            expect(screen.getByText('или перетащите сюда .csv файл')).toBeInTheDocument();
        });

        it('должен отображать выбранный файл', () => {
            const mockFile = createMockCsvFile('my-data.csv');

            render(
                <Dropzone
                    file={mockFile}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            expect(screen.getByText('my-data.csv')).toBeInTheDocument();
            expect(screen.getByText('файл загружен!')).toBeInTheDocument();
            // clear button when we already have file
            expect(screen.getByTestId('clear-file-button')).toBeInTheDocument();
        });
    });

    describe('Выбор файла через клик', () => {
        it('должен корректно обрабатывать выбор валидного CSV файла', async () => {
            const user = userEvent.setup();
            const mockFile = createMockCsvFile();

            render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const uploadButton = screen.getByRole('button', { name: 'Загрузить файл' });

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
                writable: false,
            });

            await user.click(uploadButton);
            fireEvent.change(fileInput);

            expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
        });

        it('должен отклонять не-CSV файлы и показывать ошибку валидации', async () => {
            const user = userEvent.setup();
            const mockFile = createMockTextFile('document.txt');

            render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const uploadButton = screen.getByRole('button', { name: 'Загрузить файл' });

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
                writable: false,
            });

            await user.click(uploadButton);
            fireEvent.change(fileInput);

            expect(mockOnFileSelect).not.toHaveBeenCalled();
            expect(screen.getByText('Можно загружать только *.csv файлы')).toBeInTheDocument();
        });
    });

    describe('Функциональность drag-and-drop', () => {
        it('должен обрабатывать drag enter и показывать активное состояние', () => {
            render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.dragEnter(dropzone, createDragEvent([]));

            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('Отпустите для загрузки');
        });

        it('должен обрабатывать drop валидного CSV файла', () => {
            const mockFile = createMockCsvFile('dropped.csv');

            render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.dragEnter(dropzone, createDragEvent([mockFile]));

            fireEvent.drop(dropzone, createDragEvent([mockFile]));

            expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
        });

        it('должен отклонять drop не-CSV файла и показывать ошибку валидации', () => {
            const mockFile = createMockTextFile('invalid.txt');

            render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.drop(dropzone, createDragEvent([mockFile]));

            expect(mockOnFileSelect).not.toHaveBeenCalled();

            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('Можно загружать только *.csv файлы');
        });

        it('должен обрабатывать drag leave и возвращаться к обычному состоянию', () => {
            render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.dragEnter(dropzone, createDragEvent([]));
            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('Отпустите для загрузки');

            fireEvent.dragLeave(dropzone, createDragEvent([]));
            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('или перетащите сюда .csv файл');
        });
    });

    describe('Состояния статуса анализа', () => {
        it('должен показывать загрузчик и текст обработки когда статус processing', () => {
            const mockFile = createMockCsvFile();

            render(
                <Dropzone
                    file={mockFile}
                    status="processing"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('идёт парсинг файла');
        });

        it('должен показывать завершенное состояние', () => {
            const mockFile = createMockCsvFile();

            render(
                <Dropzone
                    file={mockFile}
                    status="completed"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('готово!');
        });

        it('должен показывать сообщение об ошибке когда предоставлен error prop', () => {
            const mockFile = createMockCsvFile();
            const errorMessage = 'Ошибка обработки файла';

            render(
                <Dropzone
                    file={mockFile}
                    status="error"
                    error={errorMessage}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            expect(screen.getByTestId('dropzone-status')).toHaveTextContent(errorMessage);
        });
    });

    describe('Функциональность очистки файла', () => {
        it('должен вызывать onClear когда нажата кнопка очистки', async () => {
            const user = userEvent.setup();
            const mockFile = createMockCsvFile();

            render(
                <Dropzone
                    file={mockFile}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const clearButton = screen.getByTestId('clear-file-button');
            await user.click(clearButton);

            expect(mockOnClear).toHaveBeenCalledTimes(1);
        });

        it('должен отключать кнопку очистки во время обработки', () => {
            const mockFile = createMockCsvFile();

            render(
                <Dropzone
                    file={mockFile}
                    status="processing"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('идёт парсинг файла');
            expect(screen.queryByTestId('clear-file-button')).not.toBeInTheDocument();
        });
    });

    describe('Предотвращение взаимодействий во время обработки', () => {
        it('должен предотвращать drag взаимодействия во время обработки', () => {
            const mockFile = createMockCsvFile();

            render(
                <Dropzone
                    file={mockFile}
                    status="processing"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.dragEnter(dropzone, createDragEvent([]));

            expect(screen.queryByTestId('dropzone-status')).not.toHaveTextContent('Отпустите для загрузки');
            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('идёт парсинг файла');
        });

        it('должен предотвращать новые drop файлов во время обработки', () => {
            const mockFile = createMockCsvFile();
            const newFile = createMockCsvFile('new-file.csv');

            render(
                <Dropzone
                    file={mockFile}
                    status="processing"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.drop(dropzone, createDragEvent([newFile]));

            expect(mockOnFileSelect).not.toHaveBeenCalled();
        });
    });

    describe('Восстановление после ошибок', () => {
        it('должен очищать ошибку валидации когда выбран новый валидный файл', async () => {
            const invalidFile = createMockTextFile();
            const validFile = createMockCsvFile();

            const { rerender } = render(
                <Dropzone
                    file={null}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            const dropzone = screen.getByTestId('dropzone');

            fireEvent.drop(dropzone, createDragEvent([invalidFile]));
            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('Можно загружать только *.csv файлы');

            fireEvent.drop(dropzone, createDragEvent([validFile]));

            expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);

            rerender(
                <Dropzone
                    file={validFile}
                    status="idle"
                    error={null}
                    onFileSelect={mockOnFileSelect}
                    onClear={mockOnClear}
                />
            );

            expect(screen.queryByTestId('dropzone-status')).not.toHaveTextContent('Можно загружать только *.csv файлы');
            expect(screen.getByTestId('dropzone-status')).toHaveTextContent('файл загружен!');
        });
    });
});
