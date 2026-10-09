# oxzoo-sveltekit

Deployed with [ox](https://deploywithox.com): deploy a repo to your own server with one command, no Docker. [Docs](https://deploywithox.com/docs) · [Guide for this stack](https://deploywithox.com/docs/guides/sveltekit)

An [ox](https://deploywithox.com) deploy example: a server-rendered SvelteKit app with adapter-node, deployed to your own Ubuntu server. ox installs Node and pnpm, builds the app, runs `node build` under systemd, and puts Caddy in front with HTTPS. The page proves two kinds of environment variables at once: `GREETING_TAG` read at request time from private runtime env, and `PUBLIC_GREETING_TAG` baked into the client bundle at build time.

## Stack

| Piece | Version |
|---|---|
| SvelteKit | 2.70.3 |
| Svelte | 5.57.0 |
| @sveltejs/adapter-node | 5.5.7 |
| Vite | 5.4.21 |
| Package manager | pnpm 9.15.9 (from `packageManager` in `package.json`) |
| Runtime | Node.js 24, the ox default |

## ox.toml

```toml
# SvelteKit with adapter-node: pnpm and its version come from detection.

[app]
start  = "node build"
health = "/health"
```

ox detects pnpm from `pnpm-lock.yaml` and runs `pnpm install --frozen-lockfile` and `pnpm run build`, so the manifest only names the start command and the health path. Without an `ox.toml` at all, ox would still detect `node build` from `svelte.config.js`.

## Environment flow

- **Run time (private, SSR):** `GREETING_TAG` is read at request time in `src/routes/+page.server.ts` via `$env/dynamic/private`. It never enters the bundle. The page sets `prerender = false` and `ssr = true`, so every request is rendered on the server.
- **Build time (public, client bundle):** `PUBLIC_GREETING_TAG` is baked into the client bundle by `pnpm run build`. The page imports it from `$env/static/public`, so a missing variable fails the build loudly.
- Set **both** variables before the first deploy, with the same value. The duplicate is intentional: SvelteKit only bakes `PUBLIC_`-prefixed variables into client code. Changing either with `ox vars set` redeploys, which rebuilds the bundle.

## Deploy with ox

```sh
curl -fsSL https://deploywithox.com/install.sh | sh
ox login
ox new https://github.com/saurav-codes/oxzoo-sveltekit
printf 'GREETING_TAG=demo\nPUBLIC_GREETING_TAG=demo\n' | ox review oxzoo-sveltekit --from-file - --wait
```

The plan, offline:

```console
$ ox check .
ox check . (manifest: ox.toml)

  app.start                  node build                                           declared
  app.health                 /health                                              declared
  build.install              pnpm install --frozen-lockfile                       detected:pnpm-lock.yaml
  build.commands[0]          pnpm run build                                       detected:package.json
  tools.node                 24                                                   default
  tools.pnpm                 9.15.9                                               detected:package.json

  Provided by ox: PORT, HOST, OX_ENV, OX_PROJECT, OX_RELEASE, OX_DATA_DIR, PUBLIC_URL, PUBLIC_HOST
  Set on the dashboard before the first deploy: GREETING_TAG, PUBLIC_GREETING_TAG

Ready to deploy.
```

## Expected output

```
backend: hello world oxzoo-sveltekit_<GREETING_TAG>
frontend: hello world oxzoo-sveltekit_<PUBLIC_GREETING_TAG>
```

`GET /health` returns `ok` with HTTP 200.

## Local development

```sh
GREETING_TAG=dev PUBLIC_GREETING_TAG=dev npx -y pnpm@9 run build
GREETING_TAG=dev PUBLIC_GREETING_TAG=dev PORT=19996 node build
```
