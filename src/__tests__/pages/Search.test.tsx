import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../../components/Header';

test('仮テスト', () => {
    render(<Header />);
    expect(screen.getByAltText('logo')).toBeInTheDocument();
});
