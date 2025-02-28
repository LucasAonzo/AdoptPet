# Testing in AdoptMe

This document provides information about the testing setup in the AdoptMe project and instructions on how to run the tests.

## Testing Setup

The AdoptMe project uses Jest as its testing framework. The testing setup includes:

- **Jest Configuration**: Located in `jest.config.js`, it configures Jest to work with Expo and React Native.
- **Babel Configuration**: Located in `babel.config.js`, it ensures proper transpilation of JSX and modern JavaScript features.
- **Jest Setup File**: Located in `jest.setup.js`, it includes mock implementations for various modules and global settings.

## Test Structure

Tests are organized in the `__tests__` directory, which mirrors the structure of the `src` directory:

- `__tests__/services`: Tests for service modules (e.g., authentication, animal services)
- `__tests__/utils`: Tests for utility functions

## Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- --testPathPattern=path/to/test/file
```

For example, to run only the authentication service tests:

```bash
npm test -- --testPathPattern=__tests__/services/authService.test.js
```

## Test Coverage

The test configuration includes coverage reporting. To view the coverage report, run:

```bash
npm test -- --coverage
```

This will generate a detailed report showing which parts of the codebase are covered by tests.

## Mocking

The tests use Jest's mocking capabilities to mock external dependencies:

- **Supabase Client**: Mocked to simulate database operations without making actual API calls.
- **AsyncStorage**: Mocked to simulate local storage operations.
- **Expo Modules**: Various Expo modules are mocked in the Jest setup file.

## Writing New Tests

When writing new tests:

1. Create a new test file in the appropriate directory within `__tests__`.
2. Import the module you want to test.
3. Mock any dependencies using Jest's mocking functions.
4. Write test cases using Jest's `describe`, `test`, and `expect` functions.
5. Run the tests to ensure they pass.

## Troubleshooting

If you encounter issues with the tests:

- Make sure all dependencies are installed: `npm install`
- Check that the Jest configuration is correct
- Verify that the mocks are properly set up
- Check for syntax errors in the test files

## Continuous Integration

The tests are configured to run in a CI/CD pipeline. Make sure all tests pass before submitting a pull request. 