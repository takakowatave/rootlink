import { createDefaultPreset } from 'ts-jest'

const preset = createDefaultPreset();

/** @type {import('jest').Config} */
export default {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-fixed-jsdom',
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


