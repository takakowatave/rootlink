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

