import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface NavDropdownItem {
  to: string;
  label: string;
}

/**
 * Menu dropdown cấp 1 cho Header desktop — thay thế dần các mục menu phẳng bằng cấu trúc phân cấp
 * giống web cũ (vd "Giới thiệu" có 4 mục con, "Tin hoạt động" liệt kê động theo Category thật...).
 * Tự viết bằng React state + click-ngoài-để-đóng thay vì thêm thư viện (@radix-ui/react-dropdown-menu
 * hay navigation-menu) — chỉ cần hành vi mở/đóng cơ bản, giữ bundle nhẹ giống cách làm của HomeSlider.
 * Mở khi hover HOẶC click (không chỉ hover) để vẫn dùng được trên màn hình cảm ứng/kể cả khi JS focus
 * bằng bàn phím (Tab + Enter).
 */
export function NavDropdown({
  label,
  homeTo,
  items
}: {
  label: string;
  /** Nhấn vào chữ "Giới thiệu"/"Tin hoạt động" (không phải mũi tên) đi thẳng tới trang này. */
  homeTo: string;
  items: NavDropdownItem[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isActive = location.pathname === homeTo || location.pathname.startsWith(`${homeTo}/`);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-0.5">
        <Link
          to={homeTo}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            isActive ? "text-primary" : "text-foreground/80"
          )}
        >
          {label}
        </Link>
        <button
          type="button"
          aria-label={`Mở menu con ${label}`}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="rounded p-0.5 text-foreground/60 hover:text-primary"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", open ? "rotate-180" : "")} />
        </button>
      </div>

      {open ? (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border bg-popover p-1.5 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
