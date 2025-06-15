import { createDefaultPreset } from 'ts-jest';

const preset = createDefaultPreset();

/** @type {import('jest').Config} */
export default {
  ...preset,
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-fixed-jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    ...preset.transform,
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        astTransformers: {
          before: [
            {
              path: 'ts-jest-mock-import-meta',
              options: {
                metaObjectReplacement: {
                  env: {
                    VITE_GEMINI_API_KEY: 'dummy'
                  }
                }
              }
            }
          ]
        }
      }
    ]
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.app.json'
    }
  }
};
