import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "ul", "ol", "li", "br", "p", "div"];

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}

export function htmlToText(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Les descripcions antigues són text pla: en conservem els salts de línia.
export function toDisplayHtml(description: string) {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(description);
  const html = looksLikeHtml
    ? description
    : escapeHtml(description).replace(/\n/g, "<br>");
  return sanitizeHtml(html);
}
