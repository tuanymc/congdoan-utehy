import { isAbsolute } from "node:path";

/** Đường dẫn thật trên VPS (IIS + PM2). .env.example dùng "./..." — copy sang production sẽ 404 khi tải file. */
export const PRODUCTION_DIRS = {
  DOCUMENT_FILES_DIR: "C:\\inetpub\\congdoan2026\\document-files",
  UPLOAD_IMAGES_DIR: "C:\\inetpub\\congdoan2026\\web\\upload\\images",
  PUBLIC_WEB_DIR: "C:\\inetpub\\congdoan2026\\web",
  UPLOAD_LEGAL_FILES_DIR: "C:\\inetpub\\congdoan2026\\web\\upload\\legal-education"
} as const;

export type ProductionDirName = keyof typeof PRODUCTION_DIRS;

export function envDir(name: string, fallback: string): string {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  return raw.replace(/^["']|["']$/g, "");
}

/** Production: thiếu biến hoặc còn "./document-files" thì dùng path inetpub. Dev: giữ fallback tương đối. */
export function envDirOrProduction(name: ProductionDirName, devFallback: string): string {
  const fromEnv = envDir(name, "");
  if (process.env.NODE_ENV === "production") {
    if (!fromEnv || !isAbsolute(fromEnv)) return PRODUCTION_DIRS[name];
    return fromEnv;
  }
  return fromEnv || devFallback;
}
