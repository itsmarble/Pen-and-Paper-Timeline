export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(.*)\\.js$': '$1'
  }
};
