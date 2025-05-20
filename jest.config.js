import { createDefaultPreset } from 'ts-jest'

const preset = createDefaultPreset();

/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  transform: {
    ...preset.transform,
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
};
