import { uploadImageToServer } from "../../redux/api/uploadApi";

// Turns an .html file from the user's computer into a template that can be emailed.
//
// Templates exported from design tools usually carry their pictures inside the
// file as base64 ("data:image/png;base64,..."), which makes them several MB:
// mail apps clip or block such emails. Each embedded picture is uploaded to our
// image store once and the file then links to it instead.
//
//   const { html, name, subject, hostedImages, sizeKb } = await htmlTemplateImporter.read(file, pictures);
// throws an Error with a message to show.
//
// Pictures that point at the user's computer ("images/hero.jpg") can't be seen
// by guests. When those picture files are picked too (with the .html, or later
// with linkLocalImages), they are uploaded and the design links to them.
// mobileCheck() lists what will look wrong on a phone.
export class HtmlTemplateImporter {
  static MAX_FILE_BYTES = 30 * 1024 * 1024; // what we are willing to read at all
  static MAX_HTML_BYTES = 2 * 1024 * 1024; // what is left once pictures are links
  static CLIP_BYTES = 102 * 1024; // Gmail shows "[Message clipped]" past this

  // data:image/...;base64,... inside src="", url(...) or srcset
  static DATA_URI = /data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp);base64,([A-Za-z0-9+/=\s]+)/gi;

  // The <title> is HTML: "Hôtel &amp; Thalasso", "H&ocirc;tel". A subject is plain text, so the
  // codes become the characters they stand for (guests saw "&amp;" in their inbox before).
  // The browser's own parser does it; tags inside the title are dropped.
  static plainText(value) {
    if (!value) return "";
    const text = new DOMParser().parseFromString(`<body>${value}</body>`, "text/html").body.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  async read(file, pictures = []) {
    if (!file) throw new Error("Choose a file.");
    if (!/\.html?$/i.test(file.name) && file.type !== "text/html") throw new Error("Choose an .html file.");
    if (file.size > HtmlTemplateImporter.MAX_FILE_BYTES) throw new Error("That file is over 30 MB.");

    let html = (await file.text()).trim();
    if (!/<[a-z][\s\S]*>/i.test(html)) throw new Error("That file has no HTML in it.");

    const { html: linked, count } = await this.hostEmbeddedImages(html);
    html = linked;
    let fromComputer = 0;
    if (pictures.length) {
      const result = await this.linkLocalImages(html, pictures);
      html = result.html;
      fromComputer = result.linked;
    }

    const bytes = new Blob([html]).size;
    if (bytes > HtmlTemplateImporter.MAX_HTML_BYTES) {
      throw new Error(`Even without its pictures the HTML is ${Math.round(bytes / 1024)} KB. Keep it under 2 MB.`);
    }

    const title = HtmlTemplateImporter.plainText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    return {
      html,
      name: file.name.replace(/\.html?$/i, ""),
      subject: title || "",
      hostedImages: count + fromComputer,
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

  // every picture reference: <img src>, background="", CSS url(...)
  static PICTURE_REFS = [
    /<img[^>]+src\s*=\s*["']([^"']+)["']/gi,
    /\sbackground\s*=\s*["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+?)["']?\s*\)/gi,
  ];

  isLocal(src) {
    const value = String(src || "").trim();
    return Boolean(value) && !/^(https?:|cid:|data:|mailto:|#)/i.test(value) && !value.startsWith("//") && !value.startsWith("{{");
  }

  // pictures pointing at the user's own computer: guests can't see them
  localImagePaths(html) {
    const paths = [];
    for (const pattern of HtmlTemplateImporter.PICTURE_REFS) {
      for (const match of html.matchAll(pattern)) {
        const src = match[1].trim();
        if (this.isLocal(src) && /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(src)) paths.push(src);
      }
    }
    return [...new Set(paths)];
  }

  // "images/Hero%20Photo.JPG?v=2" -> "hero photo.jpg"
  baseName(path) {
    let name = String(path || "").split(/[?#]/)[0].split(/[\\/]/).pop() || "";
    try {
      name = decodeURIComponent(name);
    } catch {
      // keep it as written
    }
    return name.trim().toLowerCase();
  }

  // uploads the picked picture files that the design points to (matched by
  // file name) and swaps each local path for its link
  async linkLocalImages(html, files) {
    const paths = this.localImagePaths(html);
    const byName = new Map();
    for (const file of files) {
      if (/^image\//.test(file.type) || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(file.name)) byName.set(this.baseName(file.name), file);
    }
    const wanted = paths.filter((p) => byName.has(this.baseName(p)));
    if (!wanted.length) return { html, linked: 0, missing: paths };

    const urls = new Map(); // file name -> hosted link
    let number = 0;
    const queue = [...new Set(wanted.map((p) => this.baseName(p)))];
    const worker = async () => {
      while (queue.length) {
        const name = queue.shift();
        number += 1;
        const file = await this.uploadable(byName.get(name));
        urls.set(name, await this.upload(file, number));
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, queue.length) }, worker));

    let out = html;
    for (const path of wanted) {
      const url = urls.get(this.baseName(path));
      if (url) out = out.split(path).join(url);
    }
    return { html: out, linked: urls.size, missing: this.localImagePaths(out) };
  }

  // what will look wrong on a phone; [] = looks fine (the send-time fix still runs)
  mobileCheck(html) {
    const issues = [];
    const widths = [
      ...[...html.matchAll(/\swidth\s*=\s*["']?(\d{3,4})/gi)].map((m) => Number(m[1])),
      ...[...html.matchAll(/(?:^|[;"'\s])(?:min-)?width\s*:\s*(\d{3,4})px/gi)].map((m) => Number(m[1])),
    ];
    const widest = Math.max(0, ...widths);
    if (widest > 700) issues.push(`It is laid out ${widest}px wide, built for a computer screen (emails are 600px).`);
    if (/display\s*:\s*(flex|grid)|position\s*:\s*(absolute|fixed)/i.test(html)) {
      issues.push("It uses website layout (flex / grid / positioned boxes) that most mail apps ignore.");
    }
    if (/<link[^>]+rel\s*=\s*["']?stylesheet/i.test(html)) issues.push("Its styling comes from a separate file that mail apps won't load.");
    if (/<script[\s>]/i.test(html)) issues.push("It has scripts, which mail apps remove.");
    if (!/<meta[^>]+name\s*=\s*["']?viewport/i.test(html) && !/@media/i.test(html)) {
      issues.push("It has no phone layout (no viewport or @media rules).");
    }
    return issues;
  }
}

export const htmlTemplateImporter = new HtmlTemplateImporter();
