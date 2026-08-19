import { Skeleton } from "../ui/skeleton";

/** Trạng thái loading dùng chung cho các trang danh sách/form trong lúc chờ dữ liệu đầu tiên. */
export function PageLoading() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
