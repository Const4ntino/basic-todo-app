# CLAUDE.md

Static, client-side-only Spanish to-do app. No backend, build step, package manager, or tests. State lives in `localStorage`. You can add comments and name the variables in English.

## Layout

- `index.html`: markup, inline SVG icon sprite (`<symbol>`s), dialogs, popover.
- `build/css/app.css`: all styles.
- `build/js/main.js`: entry point; calls `loadDOM()` on `DOMContentLoaded`.
- `build/js/modules/DOM.js`: all DOM wiring and rendering.
- `build/js/modules/task.js`: task CRUD (`localStorage.tasks`).
- `build/js/modules/filters.js`: filter get/set (`localStorage.filters`).
- `build/js/modules/data.js`: raw `localStorage` readers.
- `Dockerfile`: `nginx:alpine` serving the repo; `.dockerignore` excludes non-runtime files.

`build/` is hand-written source, not compiled output.

## Running

- Serve the folder over HTTP (ES modules), or open `index.html` directly.
- Docker: `docker build -t todo-app . && docker run -p 8080:80 todo-app` → http://localhost:8080.

## Data model

- Task: `{ id (uuid), titulo, descripcion, categoria: 'normal'|'urgente', estado: 'pendiente'|'procesando'|'completada', fecha (ms epoch, set on create, kept on edit) }`.
- Filters: `{ categoria: 'all'|'urgente'|'normal', estado: 'all'|'pendiente'|'procesando'|'completada', fecha: 'descendente'|'ascendente' }`.
- Don't rename task fields; saved data depends on them.