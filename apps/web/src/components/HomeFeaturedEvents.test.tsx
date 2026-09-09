import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { PublicLegalCampaignListItemDto } from "@congdoan/types";
import { HomeFeaturedEvents } from "./HomeFeaturedEvents";

function campaign(overrides: Partial<PublicLegalCampaignListItemDto> = {}): PublicLegalCampaignListItemDto {
  return {
    id: "1",
    slug: "q3",
    title: "Phổ biến pháp luật quý III",
    summary: null,
    periodLabel: "Quý III/2026",
    materialCount: 1,
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

function renderBanner(items: PublicLegalCampaignListItemDto[]) {
  return render(
    <MemoryRouter>
      <HomeFeaturedEvents campaigns={items} />
    </MemoryRouter>
  );
}

describe("HomeFeaturedEvents", () => {
  it("hiện Waiting và đếm ngược khi chưa tới giờ thi", () => {
    renderBanner([
      campaign({
        examEnabled: true,
        examStartAt: "2099-01-01T00:00:00.000Z",
        examEndAt: "2099-01-10T00:00:00.000Z"
      })
    ]);

    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getByText(/Bắt đầu sau/)).toBeInTheDocument();
    expect(screen.getByText("Xem chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Sắp diễn ra")).toBeInTheDocument();
    expect(screen.queryByText("Live")).not.toBeInTheDocument();
  });

  it("giữ LIVE khi cửa sổ thi đang mở", () => {
    renderBanner([campaign({ examIsOpen: true, examEnabled: true })]);

    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Thi ngay")).toBeInTheDocument();
    expect(screen.getByText("Đang diễn ra")).toBeInTheDocument();
    expect(screen.queryByText("Waiting")).not.toBeInTheDocument();
  });
});
