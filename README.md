# oxzoo-sveltekit

A reference SvelteKit app that shows how to deploy an SSR app with [ox](https://github.com/saurav-codes/vpsctl): one Ubuntu VPS, systemd, and nginx, all described by a single `ox.toml` at the repo root. The page proves two kinds of environment variables at once, `GREETING_TAG` read at request time from private runtime env, and `PUBLIC_GREETING_TAG` baked into the client bundle at build time.

## Stack

| Piece | Version |
|---|---|
| SvelteKit | 2.70.3 |
| Svelte | 5.57.0 |
| @sveltejs/adapter-node | 5.5.7 |
| Vite | 5.4.21 |
| @sveltejs/vite-plugin-svelte | 4.0.4 |
| Package manager | pnpm 9 via corepack |
| Runtime | Node.js 22, installed from the NodeSource apt source declared in `ox.toml` |
| ox port | 9104 |

## Environment flow

- **Runtime env (private, SSR):** `GREETING_TAG` is read at request time in `src/routes/+page.server.ts` via `$env/dynamic/private`. It never enters the bundle, so a change in the ox Environment editor shows up after a restart with no rebuild. The page sets `prerender = false` and `ssr = true`, so every request is rendered on the server.
- **Build-time env (public, client bundle):** `PUBLIC_GREETING_TAG` is baked into the client bundle when `pnpm run build` runs. The page imports the variable from `$env/static/public` (it labels the page title), so a missing variable fails the build loudly, and the proof line reads the same variable via `import.meta.env`, which vite inlines as a literal string.
- Set **both** variables in the ox Environment editor before the first deploy, with the same value. The duplicate is intentional: SvelteKit only bakes `PUBLIC_`-prefixed vars into client code at build time, and private runtime vars stay invisible to the browser.

## Deploy with ox

1. Create the project in the ox dashboard with this clone URL: `https://github.com/saurav-codes/oxzoo-sveltekit.git`
2. In the Environment editor, set the runtime env:
   ```ini
   GREETING_TAG=your-tag
   PUBLIC_GREETING_TAG=your-tag
   ```
   Use your own value for `your-tag`; the two variables should hold the same value.
3. Press Deploy. ox reads `ox.toml` and does the rest: installs Node.js 22 from the NodeSource apt source, runs `corepack pnpm install --frozen-lockfile` and `corepack pnpm run build`, starts `node build` on port 9104, waits for `/health` to answer, and fronts the process with nginx at `sveltekit.oxzoo.sorv.dev`.

## Expected output

Open the deployed site with your tag in place of `your-tag`:

```
backend: hello world oxzoo-sveltekit_your-tag
frontend: hello world oxzoo-sveltekit_your-tag
```

`GET /health` returns `ok` with HTTP 200.

Local check, same flow ox runs on the server:

```sh
GREETING_TAG=localtest PUBLIC_GREETING_TAG=localtest npx -y pnpm@9 run build
GREETING_TAG=localtest PUBLIC_GREETING_TAG=localtest PORT=19996 node build
```
