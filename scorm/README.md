# SCORM

SCORM 1.2 packages for integrating Hupo Sales AI with Learning Management Systems.

## Directory Structure

```
scorm/
├── index.html          # Entry point loaded by LMS
├── app.js              # Main wrapper logic (iframe, postMessage, SCORM API calls)
├── scorm-api.js        # SCORM 1.2 API discovery with cross-origin fallbacks
├── config.js           # Per-package config (baseUrl, modules, passingScore)
├── imsmanifest.xml     # SCORM manifest (course metadata, mastery score)
├── styles.css          # Wrapper page styling
├── redirect-page.html  # Auth redirect helper
├── packages/           # Pre-built zip files ready to upload to LMS
└── docs/
    ├── SCORM-SETUP.md        # Package configuration, deployment, and troubleshooting
    └── SCORM-INTEGRATION.md  # How the app behaves differently in SCORM vs normal mode
```

## Quick Start

1. Edit `config.js` with the target company and modules
2. Update `<adlcp:masteryscore>` in `imsmanifest.xml` to match `passingScore`
3. Zip the package files: `zip -r packages/scorm-<name>.zip index.html config.js app.js scorm-api.js styles.css imsmanifest.xml`
4. Upload the zip to your LMS

## Documentation

- **[SCORM-SETUP.md](docs/SCORM-SETUP.md)** — How to configure, build, deploy, and troubleshoot SCORM packages
- **[SCORM-INTEGRATION.md](docs/SCORM-INTEGRATION.md)** — How the Hupo Sales AI app behaves differently in SCORM mode (auth, UI, scoring, completion flow) — for engineers working on SCORM-related code
