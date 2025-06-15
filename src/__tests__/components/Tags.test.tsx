import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Search from '../../pages/Search';
import { MemoryRouter } from 'react-router-dom';

// fetchをモック
beforeAll(() => {
  const mockResponse = {
    main: {
      word: "test",
      meaning: "テストの意味",
      pos: "noun",
      pronunciation: "tɛst",
      example: "This is a test.",
      translation: "これはテストです"
    },
    synonyms: {
      word: "exam",
      meaning: "試験",
      pos: "noun",
      pronunciation: "ɪɡˈzæm",
      example: "The exam was hard.",
      translation: "試験は難しかった"
    },
    antonyms: null
  };

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(mockResponse)
                }
              ]
            }
          }
        ]
      })
    })
  ) as jest.Mock;
});

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
