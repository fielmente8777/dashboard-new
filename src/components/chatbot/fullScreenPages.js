// Pages that fill the screen and don't scroll (the live chat inboxes: WhatsApp, Instagram,
// Facebook, Eazbot). Their message box and send button sit at the bottom right, so the AI
// assistant button docks as a slim tab on the right edge there, and the dashboard frame adds
// no empty room under them.
const FULL_SCREEN = [/\/channel\/[^/]+\/chat(\/|$)/];

export const isFullScreenPage = (pathname = "") => FULL_SCREEN.some((pattern) => pattern.test(pathname));
