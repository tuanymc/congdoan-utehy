import type { PublicLegalCampaignListItemDto } from "@congdoan/types";

export type FeaturedMode = "official" | "practice";

export type FeaturedStatus =
  | { kind: "live"; mode: FeaturedMode }
  | { kind: "waiting"; mode: FeaturedMode; startAt: string }
  | { kind: "hidden" };

function notEnded(endAt: string | null, now: Date): boolean {
  return !endAt || now <= new Date(endAt);
}

/** Trạng thái banner trang chủ: LIVE / Waiting (đếm ngược) / ẩn. */
export function featuredEventStatus(item: PublicLegalCampaignListItemDto, now: Date): FeaturedStatus {
  const officialStart = item.examStartAt ? new Date(item.examStartAt) : null;
  if (item.examIsOpen) return { kind: "live", mode: "official" };
  if (item.examEnabled && officialStart && now < officialStart && notEnded(item.examEndAt, now)) {
    return { kind: "waiting", mode: "official", startAt: item.examStartAt as string };
  }
  if (item.examEnabled && officialStart && now >= officialStart && notEnded(item.examEndAt, now)) {
    return { kind: "live", mode: "official" };
  }

  const practiceStart = item.examPracticeStartAt ? new Date(item.examPracticeStartAt) : null;
  if (item.examPracticeIsOpen) return { kind: "live", mode: "practice" };
  if (practiceStart && item.examPracticeEndAt && now < practiceStart && notEnded(item.examPracticeEndAt, now)) {
    return { kind: "waiting", mode: "practice", startAt: item.examPracticeStartAt as string };
  }
  if (practiceStart && item.examPracticeEndAt && now >= practiceStart && notEnded(item.examPracticeEndAt, now)) {
    return { kind: "live", mode: "practice" };
  }

  return { kind: "hidden" };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Chuỗi đếm ngược tiếng Việt, ví dụ "2 ngày 03:04:05" hoặc "03:04:05". */
export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const clock = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  return days > 0 ? `${days} ngày ${clock}` : clock;
}
