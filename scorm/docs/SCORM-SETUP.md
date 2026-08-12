# SCORM Package Setup & Deployment

How to configure, build, and deploy SCORM zip packages for LMS integration.

> For how the Hupo Sales AI app behaves differently in SCORM mode (auth, UI, scoring, completion flow, code paths), see [SCORM-INTEGRATION.md](./SCORM-INTEGRATION.md).

## Package Files

These files are zipped together to create a SCORM package:

| File | Description |
|---|---|
| `index.html` | Entry point loaded by LMS, creates iframe with media permissions |
| `app.js` | Main wrapper logic: builds iframe URL, handles postMessage, calls SCORM API |
| `scorm-api.js` | SCORM 1.2 API discovery with cross-origin fallbacks (Seismic-compatible) |
| `config.js` | Per-package configuration (baseUrl, modules, passingScore) |
| `imsmanifest.xml` | SCORM manifest with course metadata and mastery score |
| `styles.css` | Wrapper page styling |

## Configuration

### `config.js`

```javascript
window.SCORM_CONFIG = {
  // Guest auth route for the target company
  baseUrl: 'guest/grab/auth',

  // Package name for identification
  packageName: 'grab-basics',

  // Module whitelist - comma-separated friendlyIds
  // Leave empty to show all modules
  modules: 'pitching-basics,product-knowledge',

  // Pass/fail threshold (0-100). Must match <adlcp:masteryscore> in imsmanifest.xml
  passingScore: 80,
};
```

### `imsmanifest.xml`

Update these fields to match your package:

```xml
<title>Grab Sales Training - Basics</title>
...
<adlcp:masteryscore>80</adlcp:masteryscore>
```

The `masteryscore` value **must match** `passingScore` in `config.js`. The LMS uses this for its own pass/fail tracking, while the app uses `config.js` for the in-app popup.

### Module Whitelisting

Controls which training modules are shown to the user:

- **All modules**: `modules: ''` (empty string)
- **Specific modules**: `modules: 'pitching-basics,product-knowledge,objection-handling'`

Values are `friendlyId` strings from the modules database.

### App URL / Environment

The SCORM wrapper resolves the full app URL from `baseUrl`:

- **Production**: `https://train.hupo.co/<baseUrl>`
- **Override**: `?app_url=https://your-domain.com` query param on the SCORM package URL (overrides config)

Allowed origins (configurable in `app.js`):
- `https://train.hupo.co`
- `https://staging.train.hupo.co`
- `http://localhost:5361`

### URL Parameters Passed to App

The wrapper automatically appends these to the iframe URL:

- `scorm=true` — Enables SCORM mode in the app
- `modules` — Module whitelist from config
- `passingScore` — Pass/fail threshold from config
- `student_id` — Student identifier from LMS (via SCORM API)
- `student_name` — Student name from LMS (via SCORM API)
- `lesson_mode` — Learning mode (normal/browse/review)

## Creating a SCORM Package

1. Edit `config.js` with the target company, modules, and passing score
2. Update `imsmanifest.xml` title and `<adlcp:masteryscore>` to match
3. Create the zip from the `scorm/` root directory:
   ```bash
   cd scorm
   zip -r packages/scorm-<name>.zip index.html config.js app.js scorm-api.js styles.css imsmanifest.xml
   ```
4. Upload the zip to your LMS

### Naming Convention

`scorm-<company>-<variant>-<passingScore>.zip`

Examples:
- `scorm-grab-mex-only-5.zip` — Grab MEX modules only, pass at 5
- `scorm-great-eastern-10.zip` — Great Eastern, all modules, pass at 10

## Pre-built Packages

Located in `packages/`:

| Package | Description |
|---|---|
| `scorm-seismic-compatible.zip` | Recommended for Seismic Learning and enterprise LMS |
| `scorm.zip` | Basic package for standard LMS |
| `scorm-grab.zip` | Grab company |
| `scorm-hupo.zip` | Hupo company |
| `scorm-grab-mex-only-*.zip` | Grab MEX modules only, various passing scores |
| `scorm-great-eastern-*.zip` | Great Eastern, all modules, various passing scores |

## LMS Deployment

### Seismic Learning
- Use `scorm-seismic-compatible.zip` or any package built from current source
- Handles cross-origin domain restrictions via postMessage fallback
- Look for "Seismic API found at location X" in console

### SCORM Cloud
- Full media permissions support
- Use built-in debugging tools for testing

### Generic LMS
- Test with your specific LMS first
- Ensure iframe media permissions are allowed

## PostMessage API

The SCORM wrapper (`app.js`) and the Hupo app (inside the iframe) communicate via `postMessage`.

### SCORM Wrapper -> App

| Message Type | Description |
|---|---|
| `scorm-ready` | SCORM initialization complete |
| `scorm-completion-success` | Completion recorded to LMS successfully |
| `scorm-completion-error` | Failed to record completion |
| `auth-window-closed` | Auth popup was closed |
| `media-permissions-granted` | Microphone/camera access granted |
| `media-permissions-denied` | Microphone/camera access denied |

### App -> SCORM Wrapper

| Message Type | Description |
|---|---|
| `app-ready` | App initialized |
| `session-progress` | Progress update (location bookmark) |
| `scorm-completion-ready` | Session complete with final score (triggers LMS recording) |
| `score-updated` | Score update during session |
| `auth-redirect` | Open auth in new window |
| `request-media-permissions` | Request microphone/camera access |

The primary completion message is `scorm-completion-ready`, sent by the `useScormCompletion` hook after the backend sets `scormCompletionReady: true`. See [SCORM-INTEGRATION.md](./SCORM-INTEGRATION.md) for the full end-to-end flow.

## Troubleshooting

### Cross-Origin SecurityError (Seismic Learning)
```
SecurityError: Failed to read a named property 'API' from 'Window': Blocked a frame
```
- **Cause**: Cross-domain iframe restrictions
- **Fix**: The package includes enhanced API discovery with postMessage fallback

### SCORM API Not Found
```
TypeError: Cannot read properties of undefined (reading 'initialize')
```
- Package includes multiple API discovery methods
- Mock API automatically created when LMS API is unavailable
- Check console logs for API discovery attempts

### Microphone Access Denied
```
NotAllowedError: Permission denied
```
- Ensure `allow="microphone"` is on the iframe (included in `index.html`)
- Check browser microphone permissions
- Verify LMS allows media permissions in iframes

### App Not Loading
- Verify `baseUrl` in `config.js` is correct
- Check network connectivity and CORS settings
- Ensure allowed origins in `app.js` include your domain

### Completion Not Tracking
- Check that `passingScore` in `config.js` matches `<adlcp:masteryscore>` in `imsmanifest.xml`
- Verify SCORM API initialization in console
- See [SCORM-INTEGRATION.md](./SCORM-INTEGRATION.md) for the completion flow and common gotchas

### Debug Logging

The wrapper provides detailed console logging:
- API discovery attempts and results
- Cross-origin error handling
- Media permission status
- PostMessage communication events
