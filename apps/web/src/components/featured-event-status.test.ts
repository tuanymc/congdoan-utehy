import { describe, expect, it } from "vitest";
import type { PublicLegalCampaignListItemDto } from "@congdoan/types";
import { featuredEventStatus, formatCountdown, type FeaturedStatus } from "./featured-event-status";

function base(overrides: Partial<PublicLegalCampaignListItemDto> = {}): PublicLegalCampaignListItemDto {
  return {
    id: "1",
    slug: "q3",
    title: "Thi quý III",
    summary: null,
    periodLabel: null,
    materialCount: 0,
    examIsOpen: false,
    examPracticeIsOpen: false,
    examEnabled: false,
    examStartAt: null,
    examEndAt: null,
    examPracticeStartAt: null,
    examPracticeEndAt: null,
    ...overrides
  };
}

describe("featuredEventStatus", () => {
  const now = new Date("2026-09-09T10:00:00.000Z");

  it("LIVE khi cửa sổ thi chính thức đang mở", () => {
    expect(featuredEventStatus(base({ examIsOpen: true, examEnabled: true }), now)).toEqual({
      kind: "live",
      mode: "official"
    } satisfies FeaturedStatus);
  });

  it("Waiting khi đã bật thi nhưng chưa tới giờ bắt đầu", () => {
    expect(
      featuredEventStatus(
        base({
          examEnabled: true,
          examStartAt: "2026-09-10T08:00:00.000Z",
          examEndAt: "2026-09-20T08:00:00.000Z"
        }),
        now
      )
    ).toEqual({
      kind: "waiting",
      mode: "official",
      startAt: "2026-09-10T08:00:00.000Z"
    });
  });

  it("chuyển LIVE khi đồng hồ máy đã qua giờ bắt đầu (API chưa refetch)", () => {
    expect(
      featuredEventStatus(
        base({
          examEnabled: true,
          examStartAt: "2026-09-09T09:00:00.000Z",
          examEndAt: "2026-09-20T08:00:00.000Z"
        }),
        now
      )
    ).toEqual({ kind: "live", mode: "official" });
  });

  it("ẩn khi chưa bật thi", () => {
    expect(
      featuredEventStatus(base({ examStartAt: "2026-09-10T08:00:00.000Z", examEnabled: false }), now)
    ).toEqual({ kind: "hidden" });
  });

  it("Waiting thi thử khi chưa tới giờ bắt đầu", () => {
    expect(
      featuredEventStatus(
        base({
          examPracticeStartAt: "2026-09-09T12:00:00.000Z",
          examPracticeEndAt: "2026-09-20T08:00:00.000Z"
        }),
        now
      )
    ).toEqual({
      kind: "waiting",
      mode: "practice",
      startAt: "2026-09-09T12:00:00.000Z"
    });
  });
});

describe("formatCountdown", () => {
  it("hiện ngày khi còn hơn 24 giờ", () => {
    expect(formatCountdown(2 * 86400_000 + 3 * 3600_000 + 4 * 60_000 + 5_000)).toBe("2 ngày 03:04:05");
  });

  it("chỉ hiện giờ khi dưới 1 ngày", () => {
    expect(formatCountdown(3 * 3600_000 + 4 * 60_000 + 5_000)).toBe("03:04:05");
  });
});
