import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../../components/Header';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

test('ボタンが / にリンクしている', async () => {
    render(
    <MemoryRouter>
        <Header />
    </MemoryRouter>
    );
    // /を引数にNavigatorが呼び出されること
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/');
});

test('ヘッダーにアプリロゴが表示される', () => {
    render(
    <MemoryRouter>
        <Header />
    </MemoryRouter>
    );
    const logos = screen.getAllByAltText('logo');
    expect(logos[0]).toBeInTheDocument();
});
