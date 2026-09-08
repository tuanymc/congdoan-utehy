import { Link } from "react-router-dom";
import { PencilLine } from "lucide-react";
import { LEGAL_EDUCATION_PATH, type PublicLegalCampaignListItemDto } from "@congdoan/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

function formatEndAt(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function LiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-70" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      {label}
    </span>
  );
}

/**
 * Banner sự kiện nổi bật ngay dưới slider trang chủ — cuộc thi phổ biến pháp luật đang mở
 * (chính thức hoặc thi thử), bấm vào để vào thi ngay.
 */
export function HomeFeaturedEvents({ campaigns }: { campaigns: PublicLegalCampaignListItemDto[] | null }) {
  if (campaigns === null) return null;

  const live = campaigns.filter((item) => item.examIsOpen || item.examPracticeIsOpen);
  if (live.length === 0) return null;

  return (
    <section className="bg-muted/50 py-5 sm:py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Đang diễn ra</p>
            <h2 className="text-xl font-bold sm:text-2xl">Sự kiện nổi bật</h2>
          </div>
          <Button asChild variant="link" className="h-auto shrink-0 p-0">
            <Link to={LEGAL_EDUCATION_PATH}>Tất cả cuộc thi →</Link>
          </Button>
        </div>

        <div className={cn("grid gap-4", live.length > 1 ? "lg:grid-cols-2" : "")}>
          {live.map((campaign) => {
            const isOfficial = campaign.examIsOpen;
            const href = `${LEGAL_EDUCATION_PATH}/${campaign.slug}/${isOfficial ? "thi" : "thi-thu"}`;
            const endLabel = formatEndAt(isOfficial ? campaign.examEndAt : campaign.examPracticeEndAt);

            return (
              <Link
                key={campaign.id}
                to={href}
                className="group relative block overflow-hidden rounded-xl bg-gradient-to-br from-primary to-[#0f2a6b] text-primary-foreground shadow-sm ring-1 ring-primary/20 transition hover:shadow-md"
              >
                <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-12 right-10 size-32 rounded-full bg-secondary/20" />
                <div className="relative flex min-h-[9.5rem] flex-col justify-between gap-4 p-5 sm:min-h-[11rem] sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <LiveBadge label="Live" />
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                      {isOfficial ? "Thi chính thức" : "Thi thử"}
                    </span>
                    {campaign.periodLabel ? (
                      <span className="text-xs text-primary-foreground/80">{campaign.periodLabel}</span>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug sm:text-xl">{campaign.title}</h3>
                    {campaign.summary ? (
                      <p className="mt-1 line-clamp-2 text-sm text-primary-foreground/85">{campaign.summary}</p>
                    ) : null}
                    {endLabel ? (
                      <p className="mt-2 text-xs text-primary-foreground/75">Kết thúc lúc {endLabel}</p>
                    ) : null}
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground transition group-hover:brightness-110">
                    <PencilLine className="size-4" />
                    {isOfficial ? "Thi ngay" : "Thi thử ngay"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
