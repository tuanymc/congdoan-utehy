import { afterEach, describe, expect, it, vi } from "vitest";
import { dataProvider } from "./data-provider";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = init;
  const response = {
    ok,
    status,
    text: async () => JSON.stringify(body)
  } as unknown as Response;
  global.fetch = vi.fn().mockResolvedValue(response) as unknown as typeof fetch;
  return global.fetch as unknown as ReturnType<typeof vi.fn>;
}

describe("dataProvider.getList", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("map PaginatedResult<T> (items/total) sang {data, total} cho resource phân trang (posts)", async () => {
    const paginated = {
      items: [
        { id: "1", title: "Thông báo nghỉ lễ 2/9" },
        { id: "2", title: "Kế hoạch hoạt động quý III" }
      ],
      total: 42,
      page: 2,
      pageSize: 20,
      totalPages: 3
    };
    const fetchMock = mockFetchOnce(paginated);

    const result = await dataProvider.getList!({
      resource: "posts",
      pagination: { current: 2, pageSize: 20, mode: "server" }
    });

    expect(result.total).toBe(42);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ id: "1", title: "Thông báo nghỉ lễ 2/9" });

    // Phải gọi đúng endpoint /admin/posts kèm page/pageSize, không phải endpoint public /posts.
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain("/admin/posts?");
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("pageSize=20");
  });

  it("đưa filter 'search' và 'status' vào query string cho resource posts", async () => {
    const fetchMock = mockFetchOnce({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });

    await dataProvider.getList!({
      resource: "posts",
      pagination: { current: 1, pageSize: 20, mode: "server" },
      filters: [
        { field: "search", operator: "contains", value: "công đoàn" },
        { field: "status", operator: "eq", value: "PUBLISHED" }
      ]
    });

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    const searchParams = new URL(calledUrl).searchParams;
    expect(searchParams.get("search")).toBe("công đoàn");
    expect(searchParams.get("status")).toBe("PUBLISHED");
  });

  it("map mảng CategoryDto[] không phân trang sang {data, total} cho resource categories", async () => {
    const categories = [
      { id: "a", slug: "thong-bao", name: "Thông báo", sortOrder: 1 },
      { id: "b", slug: "hoat-dong", name: "Hoạt động", sortOrder: 2 }
    ];
    const fetchMock = mockFetchOnce(categories);

    const result = await dataProvider.getList!({
      resource: "categories",
      pagination: { current: 1, pageSize: 20, mode: "server" }
    });

    expect(result.total).toBe(2);
    expect(result.data).toEqual(categories);

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    // Danh mục dùng endpoint public /categories, không phải /admin/categories.
    expect(calledUrl.endsWith("/categories")).toBe(true);
  });
});

describe("dataProvider.deleteOne", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("xử lý response 200 rỗng (không có JSON body) mà không ném lỗi", async () => {
    // DELETE /admin/posts/:id trả về 200 với body rỗng (không phải JSON) theo hợp đồng API.
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "" }) as unknown as typeof fetch;

    await expect(
      dataProvider.deleteOne!({ resource: "posts", id: "1" })
    ).resolves.toEqual({ data: { id: "1" } });
  });
});
