import Image from "@tiptap/extension-image";

export function clampImagePercent(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 100;
  return Math.min(100, Math.max(10, Math.round(n)));
}

function parseWidthPercent(element: HTMLElement): number {
  const data = element.getAttribute("data-width-percent");
  if (data) return clampImagePercent(data);
  const pct = element.style.width.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) return clampImagePercent(pct[1]);
  return 100;
}

function imageDisplayStyle(percent: number): string {
  const pct = clampImagePercent(percent);
  return `width: ${pct}%; height: auto; max-width: 100%; display: block; margin-left: auto; margin-right: auto;`;
}

/** Ảnh nội dung: bề rộng theo % khung soạn thảo, luôn căn giữa khi lưu HTML. */
export const ContentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      widthPercent: {
        default: 100,
        parseHTML: parseWidthPercent,
        renderHTML: (attributes) => {
          const pct = clampImagePercent(attributes.widthPercent);
          return {
            "data-width-percent": String(pct),
            style: imageDisplayStyle(pct)
          };
        }
      }
    };
  }
});
