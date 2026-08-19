/**
 * DataProvider cho @refinedev/core, ánh xạ 3 resource của trang quản trị sang đúng endpoint của
 * apps/api (xem hợp đồng API trong tài liệu thiết kế):
 *  - "posts"      -> /admin/posts
 *  - "categories" -> GET danh sách/1 bản ghi dùng endpoint public /categories (trả về mảng thuần,
 *                     không phân trang); tạo/sửa/xoá dùng /admin/categories
 *  - "users"      -> /users (chỉ ADMIN được phép, do apps/api tự kiểm tra)
 *
 * Chỉ implement getList, getOne, create, update, deleteOne — đủ dùng cho toàn bộ UI CRUD hiện tại.
 */
import type { BaseRecord, CrudFilters, DataProvider } from "@refinedev/core";
import type { CategoryDto, PaginatedResult } from "@congdoan/types";
import { API_BASE_URL, apiFetch } from "../lib/api-client";

type ResourceName = "posts" | "categories" | "users";

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

    // Resource "categories" dùng endpoint public không hỗ trợ phân trang/lọc -> luôn trả về toàn bộ.
    if (resource === "categories") {
      const items = await apiFetch<CategoryDto[]>(paths.list);
      return { data: items as unknown as TData[], total: items.length };
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
