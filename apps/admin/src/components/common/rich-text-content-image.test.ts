import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { clampImagePercent, ContentImage } from "./rich-text-content-image";

function createEditor(html: string): Editor {
  return new Editor({
    extensions: [StarterKit, ContentImage],
    content: html
  });
}

describe("ContentImage", () => {
  it("clamp phần trăm trong khoảng 10–100", () => {
    expect(clampImagePercent(50)).toBe(50);
    expect(clampImagePercent(1)).toBe(10);
    expect(clampImagePercent(250)).toBe(100);
    expect(clampImagePercent("60")).toBe(60);
  });

  it("xuất HTML căn giữa với width theo %", () => {
    const editor = createEditor("");
    editor.commands.insertContent({
      type: "image",
      attrs: { src: "/upload/images/a.jpg", alt: "demo", widthPercent: 50 }
    });
    const html = editor.getHTML();
    expect(html).toContain('src="/upload/images/a.jpg"');
    expect(html).toContain('data-width-percent="50"');
    expect(html).toContain("width: 50%");
    expect(html).toContain("margin-left: auto");
    expect(html).toContain("margin-right: auto");
    editor.destroy();
  });

  it("đọc lại % từ HTML đã lưu", () => {
    const html =
      '<img src="/upload/images/a.jpg" data-width-percent="75" style="width: 75%; height: auto; max-width: 100%; display: block; margin-left: auto; margin-right: auto;">';
    const editor = createEditor(html);
    expect(editor.getAttributes("image").widthPercent).toBe(75);
    editor.destroy();
  });
});
