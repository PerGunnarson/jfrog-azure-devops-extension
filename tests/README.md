# Test Documentation

This project contains a comprehensive test suite for the proxy support implementation in the JFrog Azure DevOps Extension.

## Test Structure

```
tests/
├── unit/                          # Unit tests
│   ├── utils.test.js             # Tests for utils.js proxy functionality
│   └── tasks/
│       └── jfrogCliRun.test.js   # Tests for jfrogCliRun.js async functionality
├── integration/                   # Integration tests
│   └── proxy-integration.test.js # End-to-end proxy tests
├── testUtils.js                   # Existing integration test utilities
├── tests.ts                       # Existing integration tests
└── package.json                   # Test dependencies and scripts
```

## Running Tests

### All new unit tests
```bash
cd tests
npm run test:unit
```

### All new integration tests
```bash
cd tests
npm run test:integration
```

### Proxy-related tests only
```bash
cd tests
npm run test:proxy
```

### All new tests (unit + integration)
```bash
cd tests
npm run test:all
```

### Watch mode for development
```bash
cd tests
npm run test:watch
```

### Coverage report
```bash
cd tests
npm run test:coverage
```

## Test Dependencies

- **mocha**: Test framework
- **sinon**: Mocking and stubbing
- **proxyquire**: Module dependency mocking
- **nock**: HTTP request mocking for integration tests
- **@types/sinon**: TypeScript types

## Test Coverage

### utils.test.js
- ✅ `existsAsync()` - Async file system operations
- ✅ `executeCliCommandAsync()` - Async CLI command execution
- ✅ `fetchAzureOidcToken()` - Proxy-aware HTTP requests
- ✅ `configureDefaultJfrogServer()` - Async server configuration
- ✅ Proxy environment variable detection and prioritization

### jfrogCliRun.test.js
- ✅ Async task execution flow
- ✅ Working directory validation
- ✅ Error handling and cleanup
- ✅ CLI command parsing and validation
- ✅ Server ID configuration (env vs flag)

### proxy-integration.test.js
- ✅ End-to-end HTTP requests with and without proxy
- ✅ Proxy environment variable scenarios
- ✅ Network timeout handling
- ✅ Error response handling
- ✅ Concurrent request handling
- ✅ Performance tests

## Proxy Test Scenarios

The tests cover the following proxy scenarios:

1. **No proxy** - Normal HTTP requests
2. **HTTP_PROXY** - HTTP proxy for HTTP requests
3. **HTTPS_PROXY** - HTTPS proxy for HTTPS requests
4. **Environment variable priority** - HTTPS_PROXY > https_proxy, HTTP_PROXY > http_proxy
5. **Proxy authentication** - user:password@proxy-url format
6. **Proxy connection failures** - Graceful error handling
7. **Timeout scenarios** - Request timeout handling

## Mock Strategy

- **Unit tests**: Fully mocked dependencies for isolation
- **Integration tests**: Real HTTP calls with nock for endpoint mocking
- **Proxy behavior**: Testable through environment variables

## Test Data

The tests use mock Azure DevOps environment variables:
- System.CollectionUri: `https://dev.azure.com/myorg/`
- System.TeamProjectId: `project-123`
- System.AccessToken: `system-token-123`

## Troubleshooting

### Timeout errors
Increase timeout in test scripts if tests run on slow environments.

### Proxy connection errors
Integration tests may fail if network blocks proxy requests.

### Module resolution errors
Ensure all dependencies are installed: `npm install`

## Contributing

When adding new features that affect proxy handling:

1. Add unit tests in `unit/utils.test.js`
2. Add integration tests in `integration/proxy-integration.test.js`
3. Run `npm run test:all` to ensure everything works
4. Update this documentation as needed