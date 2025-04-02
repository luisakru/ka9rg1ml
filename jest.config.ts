import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!pg|kysely)',
    ],
    testMatch: [
        '**/src/**/*.test.ts',
    ],
};

export default config;
