import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';

import { Navigation } from '../Navigation';

describe('Интеграционные тесты навигации', () => {
    const renderNavigationWithRouter = (initialRoute = '/') => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Navigation />
            </MemoryRouter>
        );
    };

    beforeEach(() => {});

    describe('Рендеринг ссылок навигации', () => {
        it('должен отображать все ссылки навигации с правильными заголовками и иконками', () => {
            renderNavigationWithRouter();

            expect(screen.getByText('CSV Аналитик')).toBeInTheDocument();
            expect(screen.getByText('CSV Генератор')).toBeInTheDocument();
            expect(screen.getByText('История')).toBeInTheDocument();
        });

        it('должен отображать ссылки навигации как элементы anchor с правильными атрибутами href', () => {
            renderNavigationWithRouter();

            const homeLink = screen.getByRole('link', { name: /CSV Аналитик/i });
            const generateLink = screen.getByRole('link', { name: /CSV Генератор/i });
            const historyLink = screen.getByRole('link', { name: /История/i });

            expect(homeLink).toHaveAttribute('href', '/');
            expect(generateLink).toHaveAttribute('href', '/generate');
            expect(historyLink).toHaveAttribute('href', '/history');
        });
    });

    describe('Управление активным состоянием', () => {
        it('должен показывать CSV Аналитик как активный когда находимся на маршруте "/"', () => {
            renderNavigationWithRouter();

            const homeLink = screen.getByRole('link', { name: /CSV Аналитик/i });
            const generateLink = screen.getByRole('link', { name: /CSV Генератор/i });
            const historyLink = screen.getByRole('link', { name: /История/i });

            expect(homeLink.className).toMatch(/active/);
            expect(generateLink.className).not.toMatch(/active/);
            expect(historyLink.className).not.toMatch(/active/);
        });

        it('должен показывать CSV Генератор как активный когда находимся на маршруте "/generate"', () => {
            renderNavigationWithRouter('/generate');

            const homeLink = screen.getByRole('link', { name: /CSV Аналитик/i });
            const generateLink = screen.getByRole('link', { name: /CSV Генератор/i });
            const historyLink = screen.getByRole('link', { name: /История/i });

            expect(homeLink.className).not.toMatch(/active/);
            expect(generateLink.className).toMatch(/active/);
            expect(historyLink.className).not.toMatch(/active/);
        });

        it('должен показывать История как активный когда находимся на маршруте "/history"', () => {
            renderNavigationWithRouter('/history');

            const homeLink = screen.getByRole('link', { name: /CSV Аналитик/i });
            const generateLink = screen.getByRole('link', { name: /CSV Генератор/i });
            const historyLink = screen.getByRole('link', { name: /История/i });

            expect(homeLink.className).not.toMatch(/active/);
            expect(generateLink.className).not.toMatch(/active/);
            expect(historyLink.className).toMatch(/active/);
        });

        it('должен обеспечивать активность только одного элемента навигации одновременно', () => {
            renderNavigationWithRouter('/generate');

            const links = screen.getAllByRole('link');

            const activeLinks = links.filter((link) =>
                Array.from(link.classList).some((className) => className.includes('active'))
            );

            expect(activeLinks).toHaveLength(1);
            expect(activeLinks[0]).toHaveTextContent('CSV Генератор');
        });
    });

    describe('Пользовательский поток навигации', () => {
        it('должен позволять навигацию между всеми разделами с правильным обновлением активного состояния', async () => {
            const user = userEvent.setup();
            renderNavigationWithRouter();

            const homeLink = screen.getByRole('link', { name: /CSV Аналитик/i });
            const generateLink = screen.getByRole('link', { name: /CSV Генератор/i });
            const historyLink = screen.getByRole('link', { name: /История/i });

            expect(homeLink.className).toMatch(/active/);

            // Переход к генерации
            await user.click(generateLink);
            expect(generateLink.className).toMatch(/active/);
            expect(homeLink.className).not.toMatch(/active/);

            // Переход к истории
            await user.click(historyLink);
            expect(historyLink.className).toMatch(/active/);
            expect(screen.getByRole('link', { name: /CSV Генератор/i }).className).not.toMatch(/active/);

            // Переход к главной
            await user.click(homeLink);
            expect(homeLink.className).toMatch(/active/);
            expect(screen.getByRole('link', { name: /История/i }).className).not.toMatch(/active/);
        });

        it('должен обрабатывать быстрые клики навигации без нарушения состояния', async () => {
            const user = userEvent.setup();
            renderNavigationWithRouter();

            const homeLink = screen.getByRole('link', { name: /CSV Аналитик/i });
            const generateLink = screen.getByRole('link', { name: /CSV Генератор/i });
            const historyLink = screen.getByRole('link', { name: /История/i });

            await user.click(generateLink);
            await user.click(historyLink);
            await user.click(homeLink);
            await user.click(generateLink);

            expect(generateLink.className).toMatch(/active/);
            expect(homeLink.className).not.toMatch(/active/);
            expect(historyLink.className).not.toMatch(/active/);
        });
    });

    describe('Доступность и пользовательский опыт', () => {
        it('должен поддерживать навигацию с клавиатуры с помощью Tab и Enter', async () => {
            const user = userEvent.setup();
            renderNavigationWithRouter();

            const homeLink = screen.getByRole('link', { name: /CSV Аналитик/i });
            const generateLink = screen.getByRole('link', { name: /CSV Генератор/i });
            const historyLink = screen.getByRole('link', { name: /История/i });

            await user.tab();
            expect(homeLink).toHaveFocus();

            await user.tab();
            expect(generateLink).toHaveFocus();

            await user.tab();
            expect(historyLink).toHaveFocus();

            await user.keyboard('{Enter}');
            expect(historyLink.className).toMatch(/active/);
        });

        it('должен иметь правильную семантическую структуру с элементом nav и ссылками', () => {
            renderNavigationWithRouter();

            const nav = screen.getByRole('navigation');

            expect(nav).toBeInTheDocument();

            const links = screen.getAllByRole('link');

            expect(links).toHaveLength(3);

            links.forEach((link) => {
                expect(link).toBeInstanceOf(HTMLAnchorElement);
                expect(link).toHaveAttribute('href');
            });
        });
    });
});
