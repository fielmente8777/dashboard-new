// "Paste cURL": turns a cURL command (as copied from Postman, browser
// devtools or API docs) into the request parts of an API action. Runs only in
// the browser; nothing is sent anywhere. Secrets found in it (Authorization,
// API keys) are returned separately so the form can store them as secrets.

// Splits a shell command into words: handles 'single', "double" and $'ansi'
// quotes, backslash escapes and line continuations.
export const shellWords = (input) => {
  const text = String(input || "").replace(/\\\r?\n/g, " ");
  const words = [];
  let word = "";
  let quote = null;
  let started = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) { quote = null; continue; }
      if (ch === "\\" && quote === '"' && i + 1 < text.length && '"\\$`'.includes(text[i + 1])) { word += text[++i]; continue; }
      word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; started = true; continue; }
    if (ch === "$" && text[i + 1] === "'") { quote = "'"; started = true; i++; continue; }
    if (ch === "\\" && i + 1 < text.length) { word += text[++i]; started = true; continue; }
    if (/\s/.test(ch)) {
      if (started) { words.push(word); word = ""; started = false; }
      continue;
    }
    word += ch;
    started = true;
  }
  if (started) words.push(word);
  return words;
};

const SECRET_HEADER = /^(authorization|x-api-key|api-key|apikey|x-auth-token|x-access-token|x-secret|x-token)$/i;
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

// -> { method, url, headers: [{ name, value, secret }], body, auth: { type, headerName, token } } or { error }
export const parseCurl = (input) => {
  const words = shellWords(input);
  if (!words.length || words[0].toLowerCase() !== "curl") return { error: "Paste a command that starts with curl." };
  let method = "";
  let url = "";
  const headers = [];
  const data = [];
  let auth = { type: "none", headerName: "", token: "" };
  let forceGet = false;

  for (let i = 1; i < words.length; i++) {
    const w = words[i];
    const next = () => words[++i] ?? "";
    if (w === "-X" || w === "--request") method = next().toUpperCase();
    else if (w.startsWith("-X") && w.length > 2) method = w.slice(2).toUpperCase();
    else if (w === "-H" || w === "--header") {
      const raw = next();
      const at = raw.indexOf(":");
      if (at > 0) headers.push({ name: raw.slice(0, at).trim(), value: raw.slice(at + 1).trim() });
    } else if (["-d", "--data", "--data-raw", "--data-binary", "--data-ascii", "--json"].includes(w)) {
      data.push(next());
      if (w === "--json") headers.push({ name: "Content-Type", value: "application/json" });
    } else if (w === "--data-urlencode") data.push(next());
    else if (w === "-G" || w === "--get") forceGet = true;
    else if (w === "-u" || w === "--user") {
      next(); // basic auth is not supported: dropped on purpose, never put in the URL
    } else if (w === "--url") url = next();
    else if (["-A", "--user-agent", "-e", "--referer", "-b", "--cookie", "-o", "--output", "-m", "--max-time", "--connect-timeout", "-w", "--write-out"].includes(w)) next();
    else if (w.startsWith("-")) continue; // -s, -L, --compressed, -k, ...
    else if (!url) url = w;
  }

  if (!/^https?:\/\//i.test(url)) return { error: "No http(s) URL was found in that command." };
  let body = data.join("&");
  if (forceGet && body) {
    url += (url.includes("?") ? "&" : "?") + body;
    body = "";
  }
  if (!method) method = body ? "POST" : "GET";
  if (!METHODS.includes(method)) return { error: `${method} requests are not supported. Use GET, POST, PUT, PATCH or DELETE.` };

  // Authorization: Bearer x -> the Auth tab; other secret-looking headers stay headers, marked secret
  const kept = [];
  for (const header of headers) {
    const bearer = /^authorization$/i.test(header.name) && header.value.match(/^bearer\s+(.+)$/i);
    if (bearer && auth.type === "none") auth = { type: "bearer", headerName: "", token: bearer[1].trim() };
    else if (/^content-length$|^host$|^cookie$/i.test(header.name)) continue;
    else kept.push({ name: header.name, value: header.value, secret: SECRET_HEADER.test(header.name) });
  }

  // pretty-print JSON bodies so they are easy to edit
  if (body) {
    try {
      body = JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      // not JSON: kept as it is
    }
  }
  return { method, url, headers: kept, body, auth };
};

// --- query parameters <-> URL ("Params" tab) ------------------------------

// "https://x.com/a?b=1&c={{input.c}}" -> { base: "https://x.com/a", params: [{ key: "b", value: "1" }, ...] }
// Placeholders are kept as typed (not URL-encoded) so {{input.x}} stays readable.
export const splitUrl = (url) => {
  const text = String(url || "");
  const at = text.indexOf("?");
  if (at < 0) return { base: text, params: [] };
  const params = text.slice(at + 1).split("&").filter(Boolean).map((pair) => {
    const eq = pair.indexOf("=");
    const decode = (v) => { try { return decodeURIComponent(v.replace(/\+/g, " ")); } catch { return v; } };
    return eq < 0 ? { key: decode(pair), value: "" } : { key: decode(pair.slice(0, eq)), value: decode(pair.slice(eq + 1)) };
  });
  return { base: text.slice(0, at), params };
};

const encodePart = (value) => String(value).split(/(\{\{[^}]*\}\})/).map((part) => (part.startsWith("{{") ? part : encodeURIComponent(part))).join("");

export const joinUrl = (base, params) => {
  const query = params.filter((p) => p.key.trim()).map((p) => `${encodePart(p.key.trim())}=${encodePart(p.value)}`).join("&");
  return query ? `${base}?${query}` : base;
};
