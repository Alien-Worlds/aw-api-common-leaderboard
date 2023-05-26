/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: './jest/coverage',
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/__tests__/**/*.unit.test.ts'],
  collectCoverageFrom: [
    '**/src/**/*.ts',
    '!**/src/**/index.ts',
    '!**/src/**/ioc.config.ts',
    '!**/src/**/*.error.ts',
    '!**/src/**/*.enum.ts',
    '!**/src/**/*.enums.ts',
    '!**/src/**/*.dto.ts',
    '!**/src/**/*.dtos.ts',
    '!**/src/**/*.mongo.source.ts',
    '!**/repository.ts',
    '!**/service.ts',
  ],
};
