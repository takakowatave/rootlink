import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Search from '../../pages/Search';
import { MemoryRouter } from 'react-router-dom';

test('検索欄がある', () => {
render(
    <MemoryRouter>
    <Search />
    </MemoryRouter>
);

expect(screen.getByPlaceholderText("検索ワードを入力")).toBeInTheDocument();
});

test('検索で単語カードが表示される', async () => {
const inputWord = 'move';

render(
    <MemoryRouter>
    <Search />
    </MemoryRouter>
);

const input = screen.getByPlaceholderText("検索ワードを入力") as HTMLInputElement;
    fireEvent.change(input, { target: { value: inputWord } });
    fireEvent.submit(input.closest('form')!);
    
    const cards = await screen.findAllByTestId("word-card");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0]).toHaveTextContent("move");
});

test('保存ボタンを押せる', async () => {
    const inputWord = 'move';
    
    render(
        <MemoryRouter>
        <Search />
        </MemoryRouter>
    );
    
    const input = screen.getByPlaceholderText("検索ワードを入力") as HTMLInputElement;
    fireEvent.change(input, { target: { value: inputWord } });
    fireEvent.submit(input.closest('form')!);
    
    const cards = await screen.findAllByTestId("word-card");
    const saveButton = within(cards[0]).getByRole("button", { name: "save" })
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton!);
});

test('保存した単語を削除できる', async () => {
    const inputWord = 'move';
    
    render(
        <MemoryRouter>
        <Search />
        </MemoryRouter>
    );
    
    const input = screen.getByPlaceholderText("検索ワードを入力") as HTMLInputElement;
    fireEvent.change(input, { target: { value: inputWord } });
    fireEvent.submit(input.closest('form')!);

    const cards = await screen.findAllByTestId("word-card");
    const saveButton = within(cards[0]).getByRole("button", { name: "save" })
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton!);
    fireEvent.click(saveButton!);
    await waitFor(() => {
    expect(within(saveButton).queryByTestId("bookmark-fill")).toBeNull();
    });
});




