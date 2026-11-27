import { LOGO_ON_LIGHT_URL, LOGO_URL } from "../../config/assets";

// The print card is always light (or a solid colour), whatever the dashboard
// theme, so its colours are fixed here rather than taken from the theme.
export const CARD_COLORS = {
  navy: "#1e2d52",
  accent: "#f0692b",
  text: "#566175",
  faint: "#8a96aa",
  rule: "#e5e7eb",
};

// colour pairs to pick from: `primary` is also the QR code's colour, so every
// one is dark enough for phones to read the code
export const CARD_PALETTES = [
  { key: "eazotel", label: "Eazotel", primary: "#1e2d52", accent: "#f0692b" },
  { key: "forest", label: "Forest", primary: "#14532d", accent: "#ca8a04" },
  { key: "royal", label: "Royal", primary: "#1e3a8a", accent: "#0ea5e9" },
  { key: "maroon", label: "Maroon", primary: "#7f1d1d", accent: "#d4a017" },
  { key: "charcoal", label: "Charcoal", primary: "#1f2937", accent: "#14b8a6" },
];

export const CARD_DESIGNS = [
  { key: "classic", label: "Classic", description: "Coloured header, framed code" },
  { key: "minimal", label: "Minimal", description: "Clean white, soft panel" },
  { key: "bold", label: "Bold", description: "Full colour, white card" },
];

const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';
const WIDTH = 1200;
const HEIGHT = 1700;
const CENTER = WIDTH / 2;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

// logos are fetched once
const logos = {};
const logo = (src) => {
  logos[src] ??= loadImage(src).catch(() => null);
  return logos[src];
};

// Writes `text` centred at y, shrinking it (then cutting it short) to fit maxWidth.
const fillFitted = (ctx, text, y, { weight, size, minSize, maxWidth = WIDTH - 160 }) => {
  if (!text) return;
  let fontSize = size;
  ctx.font = `${weight} ${fontSize}px ${FONT}`;
  while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
    fontSize -= 2;
    ctx.font = `${weight} ${fontSize}px ${FONT}`;
  }
  let fitted = text;
  while (ctx.measureText(fitted).width > maxWidth && fitted.length > 1) {
    fitted = fitted.slice(0, -1);
  }
  if (fitted !== text) fitted = `${fitted.slice(0, -1)}…`;
  ctx.fillText(fitted, CENTER, y);
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const drawQr = (ctx, qrCanvas, x, y, size) => {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrCanvas, x, y, size, size);
  ctx.imageSmoothingEnabled = true;
};

// "Powered by [logo]" centred on one line
const drawPoweredBy = async (ctx, y, { light }) => {
  const label = "Powered by";
  ctx.textAlign = "left";
  ctx.font = `500 30px ${FONT}`;
  const labelWidth = ctx.measureText(label).width;
  const image = await logo(light ? LOGO_URL : LOGO_ON_LIGHT_URL);
  const logoHeight = 44;
  const logoWidth = image ? (image.width / image.height) * logoHeight : 0;
  const gap = image ? 18 : 0;
  const startX = (WIDTH - (labelWidth + gap + logoWidth)) / 2;
  ctx.fillStyle = light ? "rgba(255,255,255,0.7)" : CARD_COLORS.faint;
  ctx.fillText(label, startX, y);
  if (image) ctx.drawImage(image, startX + labelWidth + gap, y - 36, logoWidth, logoHeight);
  ctx.textAlign = "center";
};

// --- the three designs: each draws the whole 1200 x 1700 card ---

const classic = async (ctx, { qrCanvas, content, palette }) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = palette.primary;
  ctx.fillRect(0, 0, WIDTH, 300);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(0, 300, WIDTH, 10);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  fillFitted(ctx, content.eyebrow, 120, { weight: 500, size: 38, minSize: 26 });
  ctx.fillStyle = "#ffffff";
  fillFitted(ctx, content.title, content.eyebrow ? 210 : 175, { weight: 700, size: 76, minSize: 44 });

  ctx.fillStyle = palette.primary;
  fillFitted(ctx, content.headline, 440, { weight: 700, size: 64, minSize: 40 });
  ctx.fillStyle = CARD_COLORS.text;
  fillFitted(ctx, content.caption, 505, { weight: 500, size: 36, minSize: 26, maxWidth: WIDTH - 200 });

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 8;
  roundRect(ctx, 220, 570, 760, 760, 48);
  ctx.stroke();
  drawQr(ctx, qrCanvas, 250, 600, 700);

  ctx.fillStyle = CARD_COLORS.text;
  fillFitted(ctx, content.footnote, 1420, { weight: 500, size: 34, minSize: 24 });

  if (content.poweredBy) {
    ctx.fillStyle = CARD_COLORS.rule;
    ctx.fillRect(120, 1500, WIDTH - 240, 2);
    await drawPoweredBy(ctx, 1612, { light: false });
  }
};

const minimal = async (ctx, { qrCanvas, content, palette }) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // a thin accent edge round the card
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 6;
  roundRect(ctx, 30, 30, WIDTH - 60, HEIGHT - 60, 56);
  ctx.stroke();

  // the eyebrow as a small pill
  if (content.eyebrow) {
    ctx.font = `600 32px ${FONT}`;
    const w = Math.min(ctx.measureText(content.eyebrow).width + 64, WIDTH - 200);
    ctx.fillStyle = `${palette.accent}22`;
    roundRect(ctx, CENTER - w / 2, 110, w, 64, 32);
    ctx.fill();
    ctx.fillStyle = palette.accent;
    fillFitted(ctx, content.eyebrow, 153, { weight: 600, size: 32, minSize: 22, maxWidth: w - 40 });
  }
  ctx.fillStyle = palette.primary;
  fillFitted(ctx, content.title, 280, { weight: 800, size: 84, minSize: 46 });
  ctx.fillStyle = palette.accent;
  roundRect(ctx, CENTER - 60, 318, 120, 8, 4);
  ctx.fill();

  // the code on a soft rounded panel
  ctx.fillStyle = "#f3f4f6";
  roundRect(ctx, 200, 390, 800, 800, 64);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 250, 440, 700, 700, 36);
  ctx.fill();
  drawQr(ctx, qrCanvas, 275, 465, 650);

  ctx.fillStyle = palette.primary;
  fillFitted(ctx, content.headline, 1290, { weight: 700, size: 60, minSize: 38 });
  ctx.fillStyle = CARD_COLORS.text;
  fillFitted(ctx, content.caption, 1352, { weight: 500, size: 34, minSize: 24, maxWidth: WIDTH - 220 });
  ctx.fillStyle = CARD_COLORS.faint;
  fillFitted(ctx, content.footnote, 1440, { weight: 500, size: 30, minSize: 22 });

  if (content.poweredBy) await drawPoweredBy(ctx, 1590, { light: false });
};

const bold = async (ctx, { qrCanvas, content, palette }) => {
  ctx.fillStyle = palette.primary;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // two soft accent circles for depth
  ctx.fillStyle = `${palette.accent}26`;
  ctx.beginPath();
  ctx.arc(WIDTH - 80, 120, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(60, HEIGHT - 140, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.accent;
  fillFitted(ctx, content.eyebrow?.toUpperCase(), 140, { weight: 700, size: 34, minSize: 24 });
  ctx.fillStyle = "#ffffff";
  fillFitted(ctx, content.title, 235, { weight: 800, size: 80, minSize: 44 });

  // the white card
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 130, 310, WIDTH - 260, 1110, 64);
  ctx.fill();
  ctx.fillStyle = palette.primary;
  fillFitted(ctx, content.headline, 420, { weight: 700, size: 60, minSize: 38, maxWidth: WIDTH - 340 });
  ctx.fillStyle = CARD_COLORS.text;
  fillFitted(ctx, content.caption, 482, { weight: 500, size: 34, minSize: 24, maxWidth: WIDTH - 360 });
  drawQr(ctx, qrCanvas, 240, 540, 720);
  ctx.fillStyle = palette.accent;
  roundRect(ctx, CENTER - 50, 1300, 100, 8, 4);
  ctx.fill();
  ctx.fillStyle = CARD_COLORS.text;
  fillFitted(ctx, content.footnote, 1370, { weight: 500, size: 30, minSize: 22, maxWidth: WIDTH - 340 });

  if (content.poweredBy) await drawPoweredBy(ctx, 1560, { light: true });
};

const DRAW = { classic, minimal, bold };

// Draws the printable card in one of CARD_DESIGNS and returns a PNG data URL.
// `qrCanvas` is a rendered QR code; `content` = { eyebrow, title, headline,
// caption, footnote, poweredBy }; `palette` one of CARD_PALETTES; `scale`
// below 1 makes a smaller image (the on-screen previews).
export const renderPrintCard = async ({
  qrCanvas,
  content,
  palette = CARD_PALETTES[0],
  design = "classic",
  scale = 1,
}) => {
  await Promise.all(
    ["500", "600", "700", "800"].map((weight) => document.fonts?.load(`${weight} 40px ${FONT}`)),
  ).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(WIDTH * scale);
  canvas.height = Math.round(HEIGHT * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.textAlign = "center";
  await (DRAW[design] || classic)(ctx, { qrCanvas, content, palette });
  return canvas.toDataURL("image/png");
};
