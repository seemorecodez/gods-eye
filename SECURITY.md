# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.9.x   | ✅ Active |

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Please report security issues by emailing the maintainer directly via GitHub's private vulnerability reporting:  
👉 **[Report a Security Vulnerability](https://github.com/seemorecodez/gods-eye/security/advisories/new)**

Or, if you prefer email, use the contact address listed on the GitHub profile of the repository owner.

### What to Include

- Type of issue (e.g., XSS, injection, insecure API key exposure, CORS misconfiguration)
- Full paths of source file(s) related to the issue
- Location of affected code (branch / commit / direct URL)
- Steps to reproduce the issue
- Proof-of-concept or exploit code if available
- Potential impact and how an attacker might exploit it

### Scope

This policy covers the God's Eye geospatial intelligence platform and all code in this repository, including:

- Data fetching modules (`src/lib/`)
- API integration layers
- Authentication/session handling (`src/hooks/use-auth.ts`)
- Plugin system (`src/plugins/`)
- Role-based access control (`src/lib/roles.ts`)
- AI analysis modules that process or relay intelligence data

### Response Timeline

| Stage | Target |
|-------|--------|
| Acknowledgement | 72 hours |
| Initial assessment | 7 days |
| Patch / mitigation | 30 days (critical), 90 days (moderate) |
| Public disclosure | After patch is released |

### Important Notes

- This platform fetches data from public APIs (OpenSky Network, USGS, NASA FIRMS, etc.).  
  Credentials for these services **must not** be committed to the repository.  
  Use `.env` environment variables (`VITE_*`) for all API keys.
- The `window.spark.llm()` AI integration operates within GitHub Spark's security sandbox.  
  Prompt injection attacks against the AI analysis features are in scope.
- Sensitive intelligence annotations stored via `useKV` are scoped to the authenticated  
  GitHub Spark session — cross-user data leakage is in scope.
