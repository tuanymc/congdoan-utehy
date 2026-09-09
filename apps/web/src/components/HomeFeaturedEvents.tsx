import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, PencilLine } from "lucide-react";
import { LEGAL_EDUCATION_PATH, type PublicLegalCampaignListItemDto } from "@congdoan/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { featuredEventStatus, formatCountdown, type FeaturedStatus } from "@/components/featured-event-status";

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-70" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      Live
    </span>
  );
}

function WaitingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
      <Clock className="size-3" />
      Waiting
    </span>
  );
}

type FeaturedCard = {
  campaign: PublicLegalCampaignListItemDto;
  status: Exclude<FeaturedStatus, { kind: "hidden" }>;
};

function sectionKicker(items: FeaturedCard[]): string {
  const hasLive = items.some((item) => item.status.kind === "live");
  const hasWaiting = items.some((item) => item.status.kind === "waiting");
  if (hasLive && hasWaiting) return "Đang / sắp diễn ra";
  if (hasWaiting) return "Sắp diễn ra";
  return "Đang diễn ra";
}

function FeaturedEventCard({ item, now }: { item: FeaturedCard; now: Date }) {
  const { campaign, status } = item;
  const isOfficial = status.mode === "official";
  const isWaiting = status.kind === "waiting";
  const href = isWaiting
    ? `${LEGAL_EDUCATION_PATH}/${campaign.slug}`
    : `${LEGAL_EDUCATION_PATH}/${campaign.slug}/${isOfficial ? "thi" : "thi-thu"}`;
  const endLabel = formatDateTime(isOfficial ? campaign.examEndAt : campaign.examPracticeEndAt);
  const startLabel = isWaiting ? formatDateTime(status.startAt) : null;
  const remainingMs = isWaiting ? new Date(status.startAt).getTime() - now.getTime() : 0;

  return (
    <Link
      to={href}
      className={cn(
        "group relative block overflow-hidden rounded-xl text-primary-foreground shadow-sm ring-1 transition hover:shadow-md",
        isWaiting
          ? "bg-gradient-to-br from-[#1e3a5f] to-[#0f2a6b] ring-amber-400/35"
          : "bg-gradient-to-br from-primary to-[#0f2a6b] ring-primary/20"
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 right-10 size-32 rounded-full bg-secondary/20" />
      <div className="relative flex min-h-[9.5rem] flex-col justify-between gap-4 p-5 sm:min-h-[11rem] sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {isWaiting ? <WaitingBadge /> : <LiveBadge />}
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
          {isWaiting ? (
            <>
              <p className="mt-3 font-mono text-lg font-semibold tabular-nums tracking-wide sm:text-xl">
                Bắt đầu sau {formatCountdown(remainingMs)}
              </p>
              {startLabel ? (
                <p className="mt-1 text-xs text-primary-foreground/75">Mở lúc {startLabel}</p>
              ) : null}
            </>
          ) : endLabel ? (
            <p className="mt-2 text-xs text-primary-foreground/75">Kết thúc lúc {endLabel}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition group-hover:brightness-110",
            isWaiting ? "bg-amber-400 text-slate-900" : "bg-secondary text-secondary-foreground"
          )}
        >
          {isWaiting ? <Clock className="size-4" /> : <PencilLine className="size-4" />}
          {isWaiting ? "Xem chi tiết" : isOfficial ? "Thi ngay" : "Thi thử ngay"}
        </span>
      </div>
    </Link>
  );
}

/**
 * Banner sự kiện nổi bật ngay dưới slider trang chủ — cuộc thi đang LIVE hoặc Waiting (đếm ngược).
 */
export function HomeFeaturedEvents({ campaigns }: { campaigns: PublicLegalCampaignListItemDto[] | null }) {
  const [now, setNow] = useState(() => new Date());

  const featured = useMemo((): FeaturedCard[] => {
    if (!campaigns) return [];
    return campaigns.flatMap((campaign) => {
      const status = featuredEventStatus(campaign, now);
      if (status.kind === "hidden") return [];
      return [{ campaign, status }];
    });
  }, [campaigns, now]);

  const hasWaiting = featured.some((item) => item.status.kind === "waiting");

  useEffect(() => {
    if (!hasWaiting) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [hasWaiting]);

  if (campaigns === null || featured.length === 0) return null;

  return (
    <section className="bg-muted/50 py-5 sm:py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{sectionKicker(featured)}</p>
            <h2 className="text-xl font-bold sm:text-2xl">Sự kiện nổi bật</h2>
          </div>
          <Button asChild variant="link" className="h-auto shrink-0 p-0">
            <Link to={LEGAL_EDUCATION_PATH}>Tất cả cuộc thi →</Link>
          </Button>
        </div>

        <div className={cn("grid gap-4", featured.length > 1 ? "lg:grid-cols-2" : "")}>
          {featured.map((item) => (
            <FeaturedEventCard key={item.campaign.id} item={item} now={now} />
          ))}
        </div>
      </div>
    </section>
  );
}
