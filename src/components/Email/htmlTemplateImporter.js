import { uploadImageToServer } from "../../redux/api/uploadApi";

// Turns an .html file from the user's computer into a template that can be emailed.
//
// Templates exported from design tools usually carry their pictures inside the
// file as base64 ("data:image/png;base64,..."), which makes them several MB:
// mail apps clip or block such emails. Each embedded picture is uploaded to our
// image store once and the file then links to it instead.
//
//   const { html, name, subject, hostedImages, sizeKb } = await htmlTemplateImporter.read(file);
// throws an Error with a message to show.
export class HtmlTemplateImporter {
  static MAX_FILE_BYTES = 30 * 1024 * 1024; // what we are willing to read at all
  static MAX_HTML_BYTES = 2 * 1024 * 1024; // what is left once pictures are links
  static CLIP_BYTES = 102 * 1024; // Gmail shows "[Message clipped]" past this

  // data:image/...;base64,... inside src="", url(...) or srcset
  static DATA_URI = /data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp);base64,([A-Za-z0-9+/=\s]+)/gi;

  async read(file) {
    if (!file) throw new Error("Choose a file.");
    if (!/\.html?$/i.test(file.name) && file.type !== "text/html") throw new Error("Choose an .html file.");
    if (file.size > HtmlTemplateImporter.MAX_FILE_BYTES) throw new Error("That file is over 30 MB.");

    let html = (await file.text()).trim();
    if (!/<[a-z][\s\S]*>/i.test(html)) throw new Error("That file has no HTML in it.");

    const { html: linked, count } = await this.hostEmbeddedImages(html);
    html = linked;

    const bytes = new Blob([html]).size;
    if (bytes > HtmlTemplateImporter.MAX_HTML_BYTES) {
      throw new Error(`Even without its pictures the HTML is ${Math.round(bytes / 1024)} KB. Keep it under 2 MB.`);
    }

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
    return {
      html,
      name: file.name.replace(/\.html?$/i, ""),
      subject: title || "",
      hostedImages: count,
      sizeKb: Math.round(bytes / 1024),
      tooLongForGmail: bytes > HtmlTemplateImporter.CLIP_BYTES,
      localImages: this.localImagePaths(html),
    };
  }

  // uploads every distinct embedded picture once, then swaps it for its link
  async hostEmbeddedImages(html) {
    const found = new Map(); // full data uri -> { type, base64 }
    for (const match of html.matchAll(HtmlTemplateImporter.DATA_URI)) {
      if (!found.has(match[0])) found.set(match[0], { type: match[1].toLowerCase(), base64: match[2] });
    }
    if (!found.size) return { html, count: 0 };

    let index = 0;
    const links = new Map();
    // a few at a time, so a template with many pictures doesn't flood the server
    const queue = [...found.entries()];
    const worker = async () => {
      while (queue.length) {
        const [uri, { type, base64 }] = queue.shift();
        index += 1;
        const number = index;
        const file = await this.uploadable(this.toFile(type, base64, number));
        const url = await this.upload(file, number);
        links.set(uri, url);
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, queue.length) }, worker));

    let out = html;
    for (const [uri, url] of links) out = out.split(uri).join(url);
    return { html: out, count: links.size };
  }

  toFile(type, base64, index) {
    const binary = atob(base64.replace(/\s+/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const mime = type === "jpg" ? "image/jpeg" : `image/${type}`;
    const ext = type === "svg+xml" ? "svg" : type === "jpeg" ? "jpg" : type;
    return new File([bytes], `email-image-${index}.${ext}`, { type: mime });
  }

  // gian's image store takes only JPG / PNG under 5 MB (and resizes to 1200px wide
  // anyway), so WebP / GIF / SVG / BMP and big pictures are redrawn first:
  // PNG when the picture may be transparent, JPG otherwise.
  static UPLOAD_TYPES = new Set(["image/jpeg", "image/png"]);
  static MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
  static MAX_WIDTH = 1200;

  async uploadable(file) {
    if (HtmlTemplateImporter.UPLOAD_TYPES.has(file.type) && file.size <= HtmlTemplateImporter.MAX_UPLOAD_BYTES) return file;

    const image = await this.decode(file);
    const scale = Math.min(1, HtmlTemplateImporter.MAX_WIDTH / (image.width || 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((image.width || 600) * scale));
    canvas.height = Math.max(1, Math.round((image.height || 300) * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

    const mayBeTransparent = file.type !== "image/jpeg" && file.type !== "image/bmp";
    let blob = await this.canvasBlob(canvas, mayBeTransparent ? "image/png" : "image/jpeg", 0.85);
    // a big transparent picture can still be heavy as PNG: JPG it is then
    if (blob.size > HtmlTemplateImporter.MAX_UPLOAD_BYTES) blob = await this.canvasBlob(canvas, "image/jpeg", 0.8);
    const ext = blob.type === "image/png" ? "png" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: blob.type });
  }

  decode(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`One of the pictures inside the file (${file.name}) is damaged or in an unsupported format.`));
      };
      image.src = url;
    });
  }

  canvasBlob(canvas, type, quality) {
    return new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't prepare a picture for upload."))), type, quality),
    );
  }

  async upload(file, number) {
    let response;
    try {
      response = await uploadImageToServer(file);
    } catch (error) {
      response = error?.data || null;
    }
    const url = response?.result?.doc?.imageUrl;
    if (!response?.success || !url) {
      const reason = response?.message || response?.error || "the server didn't answer";
      throw new Error(`Couldn't upload picture ${number} from the file (${reason}). Please try again.`);
    }
    return url;
  }

  // pictures pointing at the user's own computer: guests can't see them
  localImagePaths(html) {
    const paths = [];
    for (const match of html.matchAll(/<img[^>]+src\s*=\s*["']([^"']+)["']/gi)) {
      const src = match[1].trim();
      if (!/^(https?:|cid:|data:)/i.test(src) && !src.startsWith("//") && !src.startsWith("{{")) paths.push(src);
    }
    return [...new Set(paths)];
  }
}

export const htmlTemplateImporter = new HtmlTemplateImporter();
