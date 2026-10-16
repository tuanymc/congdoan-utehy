import { createReadStream, statSync } from "node:fs";
import type { Request, Response } from "express";
import { contentDispositionHeader } from "./attachment-path";

const CHUNK_BYTES = 256 * 1024;

export interface ByteRange {
  start: number;
  end: number;
}

/** Một khoảng `Range: bytes=...`. Nhiều khoảng thì trả null để gửi cả file. */
export function parseSingleByteRange(header: string, size: number): ByteRange | null {
  if (size <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const startRaw = match[1] ?? "";
  const endRaw = match[2] ?? "";
  if (startRaw === "" && endRaw === "") return null;

  let start: number;
  let end: number;
  if (startRaw === "") {
    const suffix = Number(endRaw);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(startRaw);
    end = endRaw === "" ? size - 1 : Number(endRaw);
  }

  if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
  if (start < 0 || start >= size || end < start) return null;
  if (end >= size) end = size - 1;
  return { start, end };
}

function isClientAbort(err: NodeJS.ErrnoException): boolean {
  return err.code === "ERR_STREAM_PREMATURE_CLOSE" || err.code === "ECONNRESET" || err.code === "EPIPE";
}

/**
 * Gửi file từ đĩa với Content-Length và Range (206). Trình duyệt xem PDF chỉ kéo từng đoạn
 * thay vì chờ cả file; IIS/ARR cũng không phải buffer đến hết vì đã biết độ dài.
 * Client hủy giữa chừng thì đóng stream, không ném lỗi Premature close ra log PM2.
 */
export function streamLocalFile(
  req: Request,
  res: Response,
  physicalPath: string,
  options: { fileName: string; disposition: "inline" | "attachment"; contentType: string }
): void {
  const size = statSync(physicalPath).size;
  const rangeHeader = typeof req.headers.range === "string" ? req.headers.range : undefined;
  let start = 0;
  let end = Math.max(size - 1, 0);

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", options.contentType);
  res.setHeader("Content-Disposition", contentDispositionHeader(options.fileName, options.disposition));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", options.disposition === "inline" ? "private, max-age=86400" : "private, max-age=600");

  if (rangeHeader) {
    const range = parseSingleByteRange(rangeHeader, size);
    if (!range) {
      res.status(416);
      res.setHeader("Content-Range", `bytes */${size}`);
      res.end();
      return;
    }
    start = range.start;
    end = range.end;
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
  }

  const length = size === 0 ? 0 : end - start + 1;
  res.setHeader("Content-Length", String(length));
  if (req.method === "HEAD" || length === 0) {
    res.end();
    return;
  }

  const stream = createReadStream(physicalPath, { start, end, highWaterMark: CHUNK_BYTES });
  const stop = () => {
    if (!stream.destroyed) stream.destroy();
  };
  res.on("close", stop);
  stream.on("error", (err: NodeJS.ErrnoException) => {
    if (isClientAbort(err) || res.destroyed) return;
    if (!res.headersSent) {
      res.status(500).end();
      return;
    }
    res.destroy();
  });
  stream.pipe(res);
}
