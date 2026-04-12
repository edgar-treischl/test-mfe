# Copilot instructions for this repository

## Build, lint, and local run commands

- Use `yarn`, not `npm`. The repo checks in `yarn.lock`, and the GitHub Actions workflow installs and caches Yarn dependencies.
- `yarn dev` starts the Vite dev server. In this repo it serves on port `5176`.
- `yarn build` creates the production bundle in `dist/`.
- `yarn lint` runs ESLint across the repo.
- `yarn serve:federated` builds first, then serves the built remote with `vite preview --host 0.0.0.0 --port 5176`.
- There is no test runner or `test` script configured yet, so there is no supported full-suite or single-test command in the current codebase.

## High-level architecture

- This is a React + Vite micro-frontend remote, not a full standalone product shell.
- `vite.config.ts` uses `@originjs/vite-plugin-federation` to expose `./HRApp` from `./src/App.tsx`, producing `remoteEntry.js` for a host shell to consume.
- `src/App.tsx` is the actual remote surface. `src/main.tsx` only bootstraps that same component into `#root` for standalone local development.
- `react` and `react-dom` are configured as shared singletons in the federation config. Preserve that unless the host integration changes deliberately.
- The Vite `base` is set to `/test-mfe/` because the deploy workflow publishes the built `dist/` directory to GitHub Pages. Do not change the base path casually; it is tied to deployment.
- Both `server.port` and `preview.port` are pinned to `5176`, so local development and preview match the expected remote port.

## Key conventions

- Follow the README's core product rule: build the remote as content inside an existing shell, not as a second app shell. Avoid adding duplicate global chrome such as another sidebar, top nav, or page-level workspace frame.
- Design for constrained host layout. The remote should fill the container it is mounted into, degrade cleanly in smaller spaces, and avoid page-level spacing assumptions that fight the host shell.
- Keep styles isolated from the host. The README explicitly calls out avoiding CSS leakage into the shell and avoiding assumptions beyond a shared baseline.
- Prefer fast, self-contained surfaces: a clear header, focused KPIs/list/detail content, and obvious empty/loading/error states are a better fit here than a dense full-screen dashboard.
- Changes to `src/App.tsx` affect both standalone local rendering and the federated export, so treat it as the shared entrypoint for both modes.
- The current TypeScript setup uses bundler-mode resolution and allows importing TypeScript files with their extension; existing imports such as `./App.tsx` follow that pattern.
- Workspace-scoped MCP config for local Copilot/VS Code clients lives in `.vscode/mcp.json`; use the committed Playwright server rather than inventing a separate browser automation setup unless there is a clear reason.
