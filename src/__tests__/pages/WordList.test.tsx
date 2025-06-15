import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WordList from '../../pages/WordList';
import { MemoryRouter } from 'react-router-dom';

const word = {
  id: 1,
  word: "move",
  meaning: "動く、移動する",
  pos: "動詞",
  pronunciation: "/muːv/",
  example: "He moved the table.",
  translation: "彼はテーブルを移動した。",
  label: "main"
};

jest.mock('../../lib/supabaseApi', () => ({
  fetchWordlists: jest.fn(() => Promise.resolve([word])),
  toggleSaveStatus: jest.fn(() => Promise.resolve({ success: true, word })),
}));

test('保存した単語を削除できる', async () => {
  render(
    <MemoryRouter>
      <WordList />
    </MemoryRouter>
  );

  const cards = await screen.findAllByTestId("word-card");
  const saveButton = within(cards[0]).getByRole("button", { name: "save" });
  expect(saveButton).toBeInTheDocument();

  fireEvent.click(saveButton); // 保存解除

  await waitFor(() => {
    expect(screen.queryAllByTestId("saved-word").length).toBe(0);
  });
});
