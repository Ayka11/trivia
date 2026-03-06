# Localhost High-Value Checks

## Prerequisites
- `serviceAccountKey.json` present in project root.
- `GOOGLE_APPLICATION_CREDENTIALS` set to that file.

## 1) CLI check
Run against latest session for a user:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\User\Desktop\triviaAI\serviceAccountKey.json"
npm run checks:high-value -- USER_UID
```

Run against a specific session:

```powershell
npm run checks:high-value -- USER_UID SESSION_ID
```

## 2) Localhost server
Start server:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\User\Desktop\triviaAI\serviceAccountKey.json"
npm run checks:serve
```

URLs:
- Health: `http://localhost:8787/health`
- Check latest session: `http://localhost:8787/check?uid=USER_UID`
- Check specific session: `http://localhost:8787/check?uid=USER_UID&sessionId=SESSION_ID`

HTTP 200 = all checks passed.
HTTP 409 = check failures found.
