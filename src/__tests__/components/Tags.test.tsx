import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Search from '../../pages/Search';
import { MemoryRouter } from 'react-router-dom';

test('カード内にタグが表示される', async () => {
  render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>
  );

  const input = screen.getByPlaceholderText("検索ワードを入力");
  fireEvent.change(input, {
    target: { value: 'test' }
  });
  fireEvent.submit(input.closest('form')!);

  const cards = await screen.findAllByTestId("word-card");
  expect(cards.length).toBeGreaterThan(1);
  expect(within(cards[1]).getByTestId("tag-synonym")).toBeInTheDocument();
});
