// setupTests.ts
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

process.env.VITE_SUPABASE_URL = 'https://dummy.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'dummy-key';


// IntersectionObserver の簡易モック（型付き）
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve(): void {}

  constructor() {}
}

global.IntersectionObserver = MockIntersectionObserver;


// fetchをモック
const mockResponse = {
  main: {
    word: "move",
    meaning: "動く、移動する",
    pos: "動詞",
    pronunciation: "/muːv/",
    example: "He moved to a new house.",
    translation: "彼は新しい家に引っ越した。"
  },
  synonyms: {
    word: "shift",
    meaning: "移す",
    pos: "動詞",
    pronunciation: "/ʃɪft/",
    example: "He shifted the table.",
    translation: "彼はテーブルを移動した。"
  },
  antonyms: {
    word: "stay",
    meaning: "とどまる",
    pos: "動詞",
    pronunciation: "/steɪ/",
    example: "She stayed at home.",
    translation: "彼女は家にとどまった。"
  }

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
                text: `\`\`\`json\n${JSON.stringify(mockResponse)}\n\`\`\``
              }
            ]
          }
        }
      ]
    })
  })
) as jest.Mock;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
