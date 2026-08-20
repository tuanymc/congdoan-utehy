/**
 * DataProvider cho @refinedev/core, ánh xạ resource của trang quản trị sang đúng endpoint của
 * apps/api (xem hợp đồng API trong tài liệu thiết kế):
 *  - "posts"            -> /admin/posts
 *  - "categories"        -> GET danh sách/1 bản ghi dùng endpoint public /categories (trả về mảng
 *                            thuần, không phân trang); tạo/sửa/xoá dùng /admin/categories
 *  - "users"             -> /users (chỉ ADMIN được phép, do apps/api tự kiểm tra)
 *  - "document-types"    -> /admin/document-types (trả về mảng thuần, không phân trang — số lượng
 *                            loại công văn nhỏ, xem document-types.service.ts)
 *  - "official-documents" -> /admin/official-documents (có phân trang) — cả 2 resource công văn chỉ
 *                            ADMIN/UNION_CLERK truy cập được (permission "document:*"/"documenttype:*")
 *  - "home-slides"        -> /admin/home-slides (không phân trang — danh sách banner nhỏ)
 *  - "union-departments"  -> /admin/union-departments (không phân trang — danh sách bộ phận nhỏ)
 *  - "union-members"      -> /admin/union-members (có phân trang, lọc theo departmentId)
 *  - "contact-messages"   -> /admin/contact-messages (có phân trang, lọc theo isRead) — không có trang
 *                            "create" riêng (tin nhắn chỉ tạo qua form công khai apps/web), chỉ
 *                            list + update (đánh dấu đã đọc) + delete.
 *  - "events"              -> /admin/events (không phân trang ở UI — EventList tải pageSize lớn; danh
 *                            sách người đăng ký của 1 hoạt động gọi trực tiếp apiFetch trong
 *                            EventRegistrantsPage.tsx, không qua dataProvider vì không phải resource CRUD).
 *  - "ai-tools"            -> /admin/ai-tools (không phân trang — danh sách công cụ nhỏ)
 *  - "surveys"             -> /admin/surveys (không phân trang — chỉ metadata khảo sát; câu hỏi/kết
 *                            quả là tài nguyên con, gọi thẳng apiFetch trong SurveyQuestionsPage.tsx/
 *                            SurveyResultsPage.tsx, không qua dataProvider).
 *  - "public-service-procedures"       -> /admin/public-service-procedures (không phân trang)
 *  - "public-service-links"            -> /admin/public-service-links (không phân trang)
 *  - "public-service-notices"          -> /admin/public-service-notices (không phân trang)
 *  - "public-service-support-requests" -> /admin/public-service-support-requests (không phân trang —
 *                            trang quản trị chỉ list + xem chi tiết + update (đổi status/phân công/ghi
 *                            chú), KHÔNG có create/deleteOne thật ở BE — UI (PublicServiceSupportRequestList.tsx)
 *                            chỉ dùng useList/useOne/useUpdate, không bao giờ gọi useCreate/useDelete
 *                            cho resource này, xem PublicServiceSupportRequestsController).
 *
 * Chỉ implement getList, getOne, create, update, deleteOne — đủ dùng cho toàn bộ UI CRUD hiện tại.
 */
import type { BaseRecord, CrudFilters, DataProvider } from "@refinedev/core";
import type { PaginatedResult } from "@congdoan/types";
import { API_BASE_URL, apiFetch } from "../lib/api-client";

type ResourceName =
  | "posts"
  | "categories"
  | "users"
  | "document-types"
  | "official-documents"
  | "home-slides"
  | "union-departments"
  | "union-members"
  | "contact-messages"
  | "menu-items"
  | "events"
  | "ai-tools"
  | "surveys"
  | "public-service-procedures"
  | "public-service-links"
  | "public-service-notices"
  | "public-service-support-requests";

/** Resource nhỏ, không phân trang ở BE — getList trả về toàn bộ mảng (giống "categories"/"document-types"). */
const UNPAGINATED_RESOURCES: ResourceName[] = [
  "categories",
  "document-types",
  "home-slides",
  "union-departments",
  "menu-items",
  "ai-tools",
  "surveys",
  "public-service-procedures",
  "public-service-links",
  "public-service-notices",
  "public-service-support-requests"
];

interface ResourcePaths {
  /** Đường dẫn dùng cho getList. */
  list: string;
  /** Đường dẫn dùng cho getOne, theo id. */
  one: (id: string) => string;
  /** Đường dẫn dùng cho create. */
  create: string;
  /** Đường dẫn dùng cho update, theo id. */
  update: (id: string) => string;
  /** Đường dẫn dùng cho deleteOne, theo id. */
  remove: (id: string) => string;
}

const RESOURCE_PATHS: Record<ResourceName, ResourcePaths> = {
  posts: {
    list: "/admin/posts",
    one: (id) => `/admin/posts/${id}`,
    create: "/admin/posts",
    update: (id) => `/admin/posts/${id}`,
    remove: (id) => `/admin/posts/${id}`
  },
  categories: {
    // GET /categories là endpoint public, trả về CategoryDto[] không phân trang.
    list: "/categories",
    one: (id) => `/categories/${id}`,
    create: "/admin/categories",
    update: (id) => `/admin/categories/${id}`,
    remove: (id) => `/admin/categories/${id}`
  },
  users: {
    list: "/users",
    one: (id) => `/users/${id}`,
    create: "/users",
    update: (id) => `/users/${id}`,
    remove: (id) => `/users/${id}`
  },
  "document-types": {
    list: "/admin/document-types",
    one: (id) => `/admin/document-types/${id}`,
    create: "/admin/document-types",
    update: (id) => `/admin/document-types/${id}`,
    remove: (id) => `/admin/document-types/${id}`
  },
  "official-documents": {
    list: "/admin/official-documents",
    one: (id) => `/admin/official-documents/${id}`,
    create: "/admin/official-documents",
    update: (id) => `/admin/official-documents/${id}`,
    remove: (id) => `/admin/official-documents/${id}`
  },
  "home-slides": {
    list: "/admin/home-slides",
    one: (id) => `/admin/home-slides/${id}`,
    create: "/admin/home-slides",
    update: (id) => `/admin/home-slides/${id}`,
    remove: (id) => `/admin/home-slides/${id}`
  },
  "union-departments": {
    list: "/admin/union-departments",
    one: (id) => `/admin/union-departments/${id}`,
    create: "/admin/union-departments",
    update: (id) => `/admin/union-departments/${id}`,
    remove: (id) => `/admin/union-departments/${id}`
  },
  "union-members": {
    list: "/admin/union-members",
    one: (id) => `/admin/union-members/${id}`,
    create: "/admin/union-members",
    update: (id) => `/admin/union-members/${id}`,
    remove: (id) => `/admin/union-members/${id}`
  },
  "contact-messages": {
    list: "/admin/contact-messages",
    one: (id) => `/admin/contact-messages/${id}`,
    create: "/admin/contact-messages",
    update: (id) => `/admin/contact-messages/${id}`,
    remove: (id) => `/admin/contact-messages/${id}`
  },
  "menu-items": {
    list: "/admin/menu-items",
    one: (id) => `/admin/menu-items/${id}`,
    create: "/admin/menu-items",
    update: (id) => `/admin/menu-items/${id}`,
    remove: (id) => `/admin/menu-items/${id}`
  },
  events: {
    list: "/admin/events",
    one: (id) => `/admin/events/${id}`,
    create: "/admin/events",
    update: (id) => `/admin/events/${id}`,
    remove: (id) => `/admin/events/${id}`
  },
  "ai-tools": {
    list: "/admin/ai-tools",
    one: (id) => `/admin/ai-tools/${id}`,
    create: "/admin/ai-tools",
    update: (id) => `/admin/ai-tools/${id}`,
    remove: (id) => `/admin/ai-tools/${id}`
  },
  surveys: {
    list: "/admin/surveys",
    one: (id) => `/admin/surveys/${id}`,
    create: "/admin/surveys",
    update: (id) => `/admin/surveys/${id}`,
    remove: (id) => `/admin/surveys/${id}`
  },
  "public-service-procedures": {
    list: "/admin/public-service-procedures",
    one: (id) => `/admin/public-service-procedures/${id}`,
    create: "/admin/public-service-procedures",
    update: (id) => `/admin/public-service-procedures/${id}`,
    remove: (id) => `/admin/public-service-procedures/${id}`
  },
  "public-service-links": {
    list: "/admin/public-service-links",
    one: (id) => `/admin/public-service-links/${id}`,
    create: "/admin/public-service-links",
    update: (id) => `/admin/public-service-links/${id}`,
    remove: (id) => `/admin/public-service-links/${id}`
  },
  "public-service-notices": {
    list: "/admin/public-service-notices",
    one: (id) => `/admin/public-service-notices/${id}`,
    create: "/admin/public-service-notices",
    update: (id) => `/admin/public-service-notices/${id}`,
    remove: (id) => `/admin/public-service-notices/${id}`
  },
  "public-service-support-requests": {
    list: "/admin/public-service-support-requests",
    one: (id) => `/admin/public-service-support-requests/${id}`,
    // Không có endpoint create/delete thật ở BE (xem ghi chú đầu file) — 2 path dưới đây KHÔNG BAO GIỜ
    // được gọi tới trong UI, chỉ khai để thoả kiểu ResourcePaths.
    create: "/admin/public-service-support-requests",
    update: (id) => `/admin/public-service-support-requests/${id}`,
    remove: (id) => `/admin/public-service-support-requests/${id}`
  }
};

function resolveResource(resource: string): ResourcePaths {
  const config = RESOURCE_PATHS[resource as ResourceName];
  if (!config) {
    throw new Error(`Resource "${resource}" chưa được cấu hình trong data-provider.ts`);
  }
  return config;
}

function extractFilterValue(filters: CrudFilters | undefined, field: string): string | undefined {
  if (!filters) return undefined;
  for (const filter of filters) {
    if ("field" in filter && filter.field === field && filter.value !== undefined && filter.value !== "") {
      return String(filter.value);
    }
  }
  return undefined;
}

export const dataProvider: DataProvider = {
  getApiUrl: () => API_BASE_URL,

  getList: async <TData extends BaseRecord = BaseRecord>({ resource, pagination, filters }: Parameters<DataProvider["getList"]>[0]) => {
    const paths = resolveResource(resource);

    // Danh sách nhỏ, không hỗ trợ phân trang/lọc ở BE (xem UNPAGINATED_RESOURCES) -> trả về toàn bộ.
    if (UNPAGINATED_RESOURCES.includes(resource as ResourceName)) {
      const items = await apiFetch<unknown[]>(paths.list);
      return { data: items as TData[], total: items.length };
    }

    const page = pagination?.current ?? 1;
    const pageSize = pagination?.pageSize ?? 20;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const search = extractFilterValue(filters, "search");
    if (search) params.set("search", search);

    if (resource === "posts") {
      const status = extractFilterValue(filters, "status");
      if (status) params.set("status", status);
      const categorySlug = extractFilterValue(filters, "categorySlug");
      if (categorySlug) params.set("categorySlug", categorySlug);
    }

    if (resource === "official-documents") {
      const direction = extractFilterValue(filters, "direction");
      if (direction) params.set("direction", direction);
      const status = extractFilterValue(filters, "status");
      if (status) params.set("status", status);
      const documentTypeId = extractFilterValue(filters, "documentTypeId");
      if (documentTypeId) params.set("documentTypeId", documentTypeId);
    }

    if (resource === "union-members") {
      const departmentId = extractFilterValue(filters, "departmentId");
      if (departmentId) params.set("departmentId", departmentId);
    }

    if (resource === "contact-messages") {
      const isRead = extractFilterValue(filters, "isRead");
      if (isRead) params.set("isRead", isRead);
    }

    const result = await apiFetch<PaginatedResult<unknown>>(`${paths.list}?${params.toString()}`);
    return { data: result.items as unknown as TData[], total: result.total };
  },

  getOne: async <TData extends BaseRecord = BaseRecord>({ resource, id }: Parameters<DataProvider["getOne"]>[0]) => {
    const paths = resolveResource(resource);
    const data = await apiFetch<TData>(paths.one(String(id)));
    return { data };
  },

  create: async <TData extends BaseRecord = BaseRecord, TVariables = object>({
    resource,
    variables
  }: Parameters<DataProvider["create"]>[0] & { variables?: TVariables }) => {
    const paths = resolveResource(resource);
    const data = await apiFetch<TData>(paths.create, { method: "POST", body: variables });
    return { data };
  },

  update: async <TData extends BaseRecord = BaseRecord, TVariables = object>({
    resource,
    id,
    variables
  }: Parameters<DataProvider["update"]>[0] & { variables?: TVariables }) => {
    const paths = resolveResource(resource);
    const data = await apiFetch<TData>(paths.update(String(id)), { method: "PATCH", body: variables });
    return { data };
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord>({ resource, id }: Parameters<DataProvider["deleteOne"]>[0]) => {
    const paths = resolveResource(resource);
    await apiFetch(paths.remove(String(id)), { method: "DELETE" });
    return { data: { id } as unknown as TData };
  }
};
