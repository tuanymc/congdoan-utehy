import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FUNCTIONS = [
  "Đại diện, chăm lo và bảo vệ quyền, lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động.",
  "Tham gia quản lý nhà trường, giám sát thực hiện chế độ, chính sách đối với người lao động.",
  "Tổ chức phong trào thi đua yêu nước, các hoạt động văn hoá, văn nghệ, thể dục thể thao.",
  "Tuyên truyền, vận động đoàn viên chấp hành chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước."
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Giới thiệu Công đoàn Trường</h1>
      <p className="mt-2 text-muted-foreground">
        Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Chức năng, nhiệm vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {FUNCTIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lịch sử hình thành và phát triển</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            [Nội dung giới thiệu chi tiết về lịch sử hình thành, các mốc phát triển của Công đoàn
            trường sẽ được Công đoàn trường cung cấp và cập nhật.]
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tổ chức bộ máy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            [Sơ đồ tổ chức, danh sách Ban Chấp hành, các tổ Công đoàn bộ phận sẽ được bổ sung khi
            có dữ liệu chính thức và API tương ứng (dự kiến Phase 2). Hiện tại chưa có endpoint
            cung cấp dữ liệu này nên trang chỉ hiển thị khung placeholder.]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
