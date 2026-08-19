import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage({
  message = "Trang bạn tìm không tồn tại hoặc đã được di chuyển."
}: {
  message?: string;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Không tìm thấy nội dung</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}
