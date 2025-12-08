import sanitizeHtml from "sanitize-html";

export function sanitizeHtmlContent(content: string) {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "img": ["src", "srcset", "alt", "title", "width", "height", "loading"],
      "*": ["style", "class"],
    },
  });
}
