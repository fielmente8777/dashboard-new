# Instructions for AI agents (Claude Code, ChatGPT/Codex, Cursor …)

Read this before writing or changing any code in the dashboard. The backends have the full
server rules in `gian/SERVER-SAFETY.md` and `gian-new/SERVER-SAFETY.md`; read them too when a
change adds or changes API calls.

## No browser pop-ups

Never use `window.alert`, `window.confirm` or `window.prompt` (they block the page, look
foreign, and can't be styled). Use the dashboard's own:

- ask before an action (delete, discard, send, leave): `const { confirm } = useConfirm();`
  then `if (!(await confirm("…", { title: "Delete report", confirmText: "Delete" }))) return;`
  (context/ConfirmContext.jsx; `variant: "primary"` for non-destructive actions);
- tell the result (saved, failed, check a field): `const { showToast } = useToast();`
  `showToast({ message: "Saved", type: "success" | "error" | "warning" | "info" })`
  (context/ToastContext.jsx);
- anything with fields: a `Dialog` (components/ui/Dialog.jsx).

## Never flood the server

- A button that sends or saves shows `loading` and is disabled while its request runs, so a
  double click sends once. The server must also guard it (see SERVER-SAFETY.md).
- No polling faster than every 30 s; stop polling when the page is hidden or the job is done.
- No loops of requests from the browser (one request per row, per lead, per recipient). Ask the
  backend for a bulk endpoint instead.
- Long jobs (reports, campaigns, imports): start them, then show progress. Show the server's
  message on 409 / 429 ("busy, try again in a minute") instead of retrying.
- RTK Query: use `skip` until the needed ids exist; don't refetch on every render.

## Layout

- The AI assistant button sits at the bottom right (components/chatbot/ChatbotWidget.jsx).
  The dashboard frame leaves empty room under every page for it; full-screen pages are listed
  in components/chatbot/fullScreenPages.js. Don't put a fixed element in that corner.
- Check every screen at phone width (375 px) and desktop.
