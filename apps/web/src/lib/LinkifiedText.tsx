import { splitTextWithUrls } from "./split-text-with-urls";

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

/** Hiện URL http(s) thành liên kết mở tab mới — dùng cho hướng dẫn dịch vụ công / thông báo. */
export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = splitTextWithUrls(text);
  return (
    <p className={className}>
      {parts.map((part, index) =>
        part.href ? (
          <a
            key={`${part.href}-${index}`}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {part.text}
          </a>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </p>
  );
}
