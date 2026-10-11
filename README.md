# HITAM Meet Smart

HITAM Meet Smart is a React single-page demo for a college meeting interface. It currently demonstrates screens and browser-local interactions; it is **not a production meeting or authentication service**.

## Technology

- React 18, TypeScript, Vite 5
- React Router, TanStack Query
- Tailwind CSS, shadcn/ui components, Radix UI
- Browser APIs for local camera, microphone, screen capture, and fullscreen

There is no backend, database, signaling server, WebRTC peer connection, or external application API configured in this repository. `index.html` does load `https://cdn.gpteng.co/gptengineer.js` as a third-party script; it is not used by the meeting workflows and requires a network connection. No environment variables are required to run the frontend.

## Requirements

- Node.js and npm

The checked-in `package-lock.json` is the npm lockfile. Install dependencies and start the development server from the project directory:

```sh
npm ci
npm run dev
```

Vite serves the app at `http://localhost:8080` by default.

## Available checks and commands

```sh
npm run lint
npm exec -- tsc --noEmit -p tsconfig.app.json --pretty false
npm run build
npm run preview
```

There is currently no automated test script or test suite.

## Demo behavior and limitations

- Login and signup are simulated in browser storage. Any syntactically valid `@hitam.org` address is accepted, and the displayed demo verification code is `123456`. This does not send email or verify ownership; users can choose the host role themselves. Do not use this for real accounts or authorization.
- The dashboard's meeting list and created meetings exist only in component state and are lost on reload. A demo meeting is pre-populated.
- Meeting participant cards are fixed demo entries. Chat messages, participant removal, attendance CSV data, and assignments are local to the current page/session; no other user can join the same room.
- Camera, microphone, and screen capture use local browser media APIs only. They do not transmit audio, video, or screen content to other participants.
- The meeting controls explicitly indicate local demo status. Attendance CSV export is local; email delivery and assignment submission are unavailable. Assignment files and metadata are held in page memory and are not shared or persisted.
- The controls dialog and meeting view adapt to small screens. Browser media permissions are still required to test the local camera, microphone, and screen-capture previews.
- Browser permissions and fullscreen support are required to try the local media/fullscreen controls. Use localhost or HTTPS for browser media APIs.

To make these workflows real, the project needs a trusted backend for account verification, authorization, meeting persistence, and attendance, plus a signaling/media service for multi-user conferencing. No service endpoints or credentials are supplied here.

## Repository notes

- Keep real credentials and local environment files out of version control. `.env` files are ignored; `.env.example` may be committed with placeholders only.
- `bun.lockb` is also present, but npm is the documented package manager because `package-lock.json` is checked in.
- The standalone `code.txt` file is not referenced by the application entry points; review it before publishing to confirm it is intentionally included.
