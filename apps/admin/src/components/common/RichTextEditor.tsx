import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2
} from "lucide-react";
import type { UploadImageResponseDto } from "@congdoan/types";
import { apiFetchUpload, ApiError } from "../../lib/api-client";
import { cn } from "../ui/utils";
import { pushToast } from "../common/toast-store";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** id gắn vào vùng soạn thảo để Label htmlFor trỏ vào. */
  id?: string;
  placeholder?: string;
  /** Đánh dấu HTML5 required — form submit vẫn kiểm tra content rỗng phía PostForm. */
  required?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-foreground transition-colors",
        "hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/10 text-primary"
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({
  editor,
  onUploadImage,
  isUploading
}: {
  editor: Editor;
  onUploadImage: () => void;
  isUploading: boolean;
}) {
  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL liên kết:", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
      <ToolbarButton
        title="In đậm"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="In nghiêng"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Gạch chân"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Gạch ngang"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        title="Tiêu đề cấp 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Tiêu đề cấp 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        title="Danh sách"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Danh sách số"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Trích dẫn"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        title="Căn trái"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Căn giữa"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Căn phải"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton title="Chèn liên kết" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Chèn ảnh từ máy" disabled={isUploading} onClick={onUploadImage}>
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton title="Hoàn tác" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Làm lại" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}

/**
 * TipTap rich text editor — lưu HTML vào content bài viết (apps/web render bằng dangerouslySetInnerHTML).
 * Nút ảnh gọi POST /admin/uploads/images rồi chèn <img src="/upload/images/..."> vào nội dung.
 */
export function RichTextEditor({
  value,
  onChange,
  id,
  placeholder = "Soạn nội dung bài viết..."
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  /** Tránh vòng lặp onUpdate → setState parent → setContent khi chính editor vừa phát sinh thay đổi. */
  const lastEmittedHtml = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" }
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "max-w-full rounded-lg" }
      }),
      Placeholder.configure({ placeholder })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        id: id ?? "rich-text-editor",
        class: [
          "min-h-[280px] max-h-[560px] overflow-y-auto px-4 py-3 outline-none",
          "text-base leading-relaxed text-foreground",
          "[&_p]:my-3",
          "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold",
          "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold",
          "[&_a]:text-primary [&_a]:underline",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg",
          "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_.is-empty:first-child::before]:pointer-events-none [&_.is-empty:first-child::before]:float-left [&_.is-empty:first-child::before]:h-0 [&_.is-empty:first-child::before]:text-muted-foreground [&_.is-empty:first-child::before]:content-[attr(data-placeholder)]"
        ].join(" ")
      }
    },
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      lastEmittedHtml.current = html;
      onChange(html === "<p></p>" ? "" : html);
    }
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedHtml.current) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
    lastEmittedHtml.current = value;
  }, [editor, value]);

  const handleUploadImage = useCallback(async (file: File) => {
    if (!editor) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiFetchUpload<UploadImageResponseDto>("/admin/uploads/images", formData);
      editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      pushToast({ variant: "success", message: "Đã chèn ảnh vào nội dung." });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Tải ảnh lên thất bại.";
      pushToast({ variant: "error", message });
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-md border border-input bg-input-background text-sm text-muted-foreground">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-input bg-input-background shadow-xs">
      <EditorToolbar
        editor={editor}
        isUploading={isUploading}
        onUploadImage={() => fileInputRef.current?.click()}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleUploadImage(file);
        }}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
