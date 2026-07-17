# TRAP Room Railway Lock + JSON BOM Repair V25.2

V25.1 regenerated the dependency tree successfully, and its local `npm ci`
simulation passed. The later Vite failure was caused by PowerShell writing
`package.json` with a UTF-8 byte-order mark (BOM).

Vite searches for PostCSS configuration while processing `src/index.css`.
During that search, its config loader parses `package.json`. The BOM becomes
an unexpected character for that JSON parser, producing:

```text
Failed to load PostCSS config
Unexpected token ... is not valid JSON
```

V25.2:

- writes `package.json` and `railway.json` as UTF-8 without BOM;
- regenerates `package-lock.json`;
- validates the lock with a clean `npm ci`;
- validates all deployment JSON files byte-by-byte;
- runs the backend syntax build;
- runs the Vercel frontend production build;
- keeps Railway on Node 22.x and `npm run build:backend`.

The local Node 24 `EBADENGINE` message is a warning because the project
intentionally pins Railway to Node 22.x. It is not the build failure.
