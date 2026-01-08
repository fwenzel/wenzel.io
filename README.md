# wenzel.io

Single-page canvas site with modular animations. Source lives in `src/` and the deployable build is copied into `docs/`.

Structure
- `src/index.html` loads the module entrypoint at `src/js/main.js`.
- `src/js/engine.js` contains the animation engine.
- `src/js/overlays/labelOverlay.js` renders the glitching label overlay.
- `src/js/animations/` holds each animation module (`mystify`, `pretzels`).
- `docs/` is the build output, suitable for GitHub Pages.

Build
```sh
npm install
npm run build
```
This copies everything from `src/` into `docs/`.

Serve locally
```sh
npm run build
npm run serve
```
Then open http://localhost:5173.

Develop
```sh
npm run dev
```
This serves `src/` directly at http://localhost:5173.
