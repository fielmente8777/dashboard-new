import { LOGO_ON_LIGHT_URL } from "../../config/assets";

// The print card is always light, whatever the dashboard theme, so its
// colours are fixed here rather than taken from the theme.
export const CARD_COLORS = {
  navy: "#1e2d52",
  accent: "#f0692b",
  text: "#566175",
  faint: "#8a96aa",
  rule: "#e5e7eb",
};

const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';
const WIDTH = 1200;
const HEIGHT = 1700;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

// Writes `text` centred at y, shrinking it (then cutting it short) to fit maxWidth.
const fillFitted = (ctx, text, y, { weight, size, minSize, maxWidth }) => {
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

  ctx.fillText(fitted, WIDTH / 2, y);
};

// Draws the printable card (hotel name, headline, QR code, Eazotel footer)
// and returns it as a PNG data URL. `qrCanvas` is a rendered QR code.
export const renderPrintCard = async ({
  qrCanvas,
  hotelName,
  headline,
  caption,
}) => {
  await Promise.all(
    ["500", "700"].map((weight) => document.fonts?.load(`${weight} 40px ${FONT}`)),
  ).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // header band with the hotel name
  ctx.fillStyle = CARD_COLORS.navy;
  ctx.fillRect(0, 0, WIDTH, 300);
  ctx.fillStyle = CARD_COLORS.accent;
  ctx.fillRect(0, 300, WIDTH, 10);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 38px ${FONT}`;
  ctx.fillText("Welcome to", WIDTH / 2, 120);
  ctx.fillStyle = "#ffffff";
  fillFitted(ctx, hotelName, 210, {
    weight: 700,
    size: 76,
    minSize: 44,
    maxWidth: WIDTH - 160,
  });

  ctx.fillStyle = CARD_COLORS.navy;
  fillFitted(ctx, headline, 440, {
    weight: 700,
    size: 64,
    minSize: 40,
    maxWidth: WIDTH - 160,
  });
  ctx.fillStyle = CARD_COLORS.text;
  fillFitted(ctx, caption, 505, {
    weight: 500,
    size: 36,
    minSize: 26,
    maxWidth: WIDTH - 200,
  });

  // QR code in an accent frame
  ctx.strokeStyle = CARD_COLORS.accent;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(220, 570, 760, 760, 48);
  ctx.stroke();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrCanvas, 250, 600, 700, 700);
  ctx.imageSmoothingEnabled = true;

  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText("Point your phone camera at the code", WIDTH / 2, 1420);

  ctx.fillStyle = CARD_COLORS.rule;
  ctx.fillRect(120, 1500, WIDTH - 240, 2);

  // "Powered by [logo]", centred as one line
  const label = "Powered by";
  ctx.font = `500 30px ${FONT}`;
  const labelWidth = ctx.measureText(label).width;
  const logo = await loadImage(LOGO_ON_LIGHT_URL).catch(() => null);
  const logoHeight = 44;
  const logoWidth = logo ? (logo.width / logo.height) * logoHeight : 0;
  const gap = logo ? 18 : 0;
  const startX = (WIDTH - (labelWidth + gap + logoWidth)) / 2;

  ctx.textAlign = "left";
  ctx.fillStyle = CARD_COLORS.faint;
  ctx.fillText(label, startX, 1612);
  if (logo) {
    ctx.drawImage(logo, startX + labelWidth + gap, 1612 - 36, logoWidth, logoHeight);
  }

  return canvas.toDataURL("image/png");
};
