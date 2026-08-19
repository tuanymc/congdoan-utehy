import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeSlideDto } from "@congdoan/types";
import { cn } from "@/components/ui/utils";

const AUTO_ADVANCE_MS = 5000;

/**
 * Slider ảnh đầu trang chủ — thay tblSlide/uc_Slide.ascx web cũ (xem HomeSlide trong
 * prisma/schema.prisma). Tự triển khai bằng CSS transform + setInterval thay vì thêm thư viện
 * carousel ngoài — chỉ cần hiệu ứng trượt cơ bản, không cần tính năng nâng cao (kéo chạm, lazy-load
 * nhiều slide...).
 */
export function HomeSlider({ slides }: { slides: HomeSlideDto[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  return (
    <section className="relative w-full overflow-hidden bg-muted">
      <div className="relative aspect-[21/9] w-full sm:aspect-[3/1]">
        {slides.map((slide, slideIndex) => {
          const content = (
            <img
              src={slide.imageUrl}
              alt={slide.name}
              className="size-full object-cover"
              loading={slideIndex === 0 ? "eager" : "lazy"}
            />
          );
          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                slideIndex === index ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
            >
              {slide.linkUrl ? (
                <a href={slide.linkUrl} className="block size-full">
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Ảnh tiếp theo"
              className="absolute right-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((slide, dotIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Xem ảnh ${dotIndex + 1}`}
                  onClick={() => goTo(dotIndex)}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    dotIndex === index ? "bg-primary" : "bg-background/70"
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
