import { isDepartmentChairTitle } from "./department-chair";

describe("isDepartmentChairTitle", () => {
  it("nhận Chủ tịch bộ phận", () => {
    expect(isDepartmentChairTitle("Chủ tịch")).toBe(true);
    expect(isDepartmentChairTitle("Chủ tịch Công đoàn bộ phận")).toBe(true);
    expect(isDepartmentChairTitle("CHỦ TỊCH CĐBP")).toBe(true);
  });

  it("loại Phó Chủ tịch", () => {
    expect(isDepartmentChairTitle("Phó Chủ tịch")).toBe(false);
    expect(isDepartmentChairTitle("Phó chủ tịch Công đoàn bộ phận")).toBe(false);
  });

  it("loại chức vụ khác", () => {
    expect(isDepartmentChairTitle("Ủy viên")).toBe(false);
    expect(isDepartmentChairTitle("")).toBe(false);
    expect(isDepartmentChairTitle(null)).toBe(false);
  });
});
