import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../../components/Header';

test('ヘッダーにアプリロゴが表示される', () => {
    render(<Header />);
    expect(screen.getByAltText('logo')).toBeInTheDocument();
});
