import { isDepartmentChairTitle, matchDepartmentFromTitles } from "./department-chair";

describe("isDepartmentChairTitle", () => {
  it("nhận Chủ tịch bộ phận", () => {
    expect(isDepartmentChairTitle("Chủ tịch")).toBe(true);
    expect(isDepartmentChairTitle("Chủ tịch Công đoàn bộ phận")).toBe(true);
    expect(isDepartmentChairTitle("CHỦ TỊCH CĐBP")).toBe(true);
    expect(isDepartmentChairTitle("CT CĐBP")).toBe(true);
    expect(isDepartmentChairTitle("Tổ trưởng")).toBe(true);
    expect(isDepartmentChairTitle("Chủ tịch CĐBP Khoa Điện - Điện tử")).toBe(true);
  });

  it("ghép chức vụ với tên bộ phận", () => {
    const departments = [
      { id: "ck", name: "CĐBP Khoa Cơ khí" },
      { id: "dt", name: "CĐBP Khoa Điện - Điện tử" }
    ];
    expect(matchDepartmentFromTitles(departments, ["Chủ tịch CĐBP Khoa Điện - Điện tử"])?.id).toBe("dt");
  });

  it("loại Phó Chủ tịch", () => {
    expect(isDepartmentChairTitle("Phó Chủ tịch")).toBe(false);
    expect(isDepartmentChairTitle("Phó chủ tịch Công đoàn bộ phận")).toBe(false);
    expect(isDepartmentChairTitle("PCT CĐBP")).toBe(false);
    expect(isDepartmentChairTitle("Tổ phó")).toBe(false);
  });

  it("loại chức vụ khác", () => {
    expect(isDepartmentChairTitle("Ủy viên")).toBe(false);
    expect(isDepartmentChairTitle("")).toBe(false);
    expect(isDepartmentChairTitle(null)).toBe(false);
  });
});
