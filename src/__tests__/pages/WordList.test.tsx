import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../../components/Header';
import { MemoryRouter } from 'react-router-dom';

test('仮テスト', () => {
    render(
        <MemoryRouter>
        <Header />
        </MemoryRouter>
    );
    const logos = screen.getAllByAltText('logo');
    expect(logos[0]).toBeInTheDocument();
});
