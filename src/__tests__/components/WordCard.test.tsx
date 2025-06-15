import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Search from '../../pages/Search';
import { MemoryRouter } from 'react-router-dom';

test('move のカードが正しく表示される', async () => {
    render(
        <MemoryRouter>
        <Search />
        </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("検索ワードを入力") as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'move' } });
    fireEvent.submit(input.closest('form')!);

    const cards = await screen.findAllByTestId("word-card");
    const mainCard = cards[0];

    expect(mainCard).toHaveTextContent("move");
    expect(mainCard).toHaveTextContent("動詞");
    expect(mainCard).toHaveTextContent("動く、移動する");
    expect(mainCard).toHaveTextContent("/muːv/");
});
