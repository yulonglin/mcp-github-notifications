# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-02-03

### Added
- **Test Coverage**: Comprehensive test suite with 42 tests (up from 4)
  - API utility tests covering all HTTP methods and error handling
  - Schema validation tests with security attack vector coverage
  - Response helper tests with integration scenarios
- **Security Validations**: Enhanced input validation in Zod schemas
  - Path traversal protection (including URL-encoded attacks)
  - Null byte injection prevention
  - Directory separator filtering (Unix and Windows)
  - Hidden file prefix detection
  - GitHub-specific constraints (username max 39 chars, repo max 100 chars)
  - ISO 8601 timestamp validation with timezone support
  - Thread ID format validation (numeric, max 20 characters)
- **Response Helpers**: `successResponse()` and `errorResponse()` utilities
  - Reduces ~100 lines of duplicated response formatting
  - Consistent error handling across all 11 tools

### Changed
- **Migration to Bun**: Switched from npm to bun for faster builds and testing
  - Updated all package scripts to use bun commands
  - Generated bun.lock for dependency management
  - Updated README.md with bun installation instructions
- **Type Safety Improvements**: Eliminated 87% of `any` types
  - API utilities now use `ParamValue` type for parameters
  - Generic defaults changed from `any` to `unknown`
  - All tool registration functions use proper `McpServer` type
  - Error handling uses `unknown` instead of `any`
- **Centralized Schemas**: Extracted shared Zod schemas to reduce duplication
  - `paginationSchema` for consistent pagination (1-100 pages, 1-100 items)
  - `repoIdentifierSchema` with security validations
  - `threadIdSchema` for thread ID validation
  - `timestampSchema` for ISO 8601 timestamp validation
  - `notificationFilterSchema` combining common filters
  - Reduced schema duplication by 80% (5 copies → 1 shared)

### Fixed
- Version mismatch between server.ts (1.0.0) and package.json (now both 1.1.0)
- Removed duplicate GITHUB_TOKEN validation from api.ts (already in index.ts)

### Removed
- Unused `options` parameter from manage-repo-subscription tool
- ~13 lines of dead code and obvious comments

### Technical Details

**Code Quality Metrics:**
- Lines of code: +1,140 net (1,474 additions, 334 deletions)
- Test coverage: 950% increase (4 → 42 tests)
- Type safety: 87% reduction in `any` types (15 → 2)
- Boilerplate: 90% reduction in response formatting (~200 lines → 2 functions)

**Security Enhancements:**
- All repository identifiers validated against path traversal attacks
- Both raw and URL-encoded attack vectors blocked
- Comprehensive regex validation for GitHub naming conventions
- Pagination bounds enforced (prevents abuse)

**Performance:**
- Faster test execution with Bun's native test runner
- Faster builds with Bun's compiler

## [1.0.0] - 2024-01-XX

### Added
- Initial release of GitHub Notifications MCP Server
- 11 notification management tools
- Repository subscription management
- Thread subscription controls
- Basic notification filtering and pagination

---

[1.1.0]: https://github.com/yourusername/mcp-github-notifications/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourusername/mcp-github-notifications/releases/tag/v1.0.0
