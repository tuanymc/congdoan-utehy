import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const state = location.state as LocationState | null;
    return <Navigate to={state?.from?.pathname ?? "/cong-doan-vien"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/cong-doan-vien", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Đăng nhập cổng đoàn viên</CardTitle>
          <CardDescription>
            Dành cho cán bộ, giảng viên, người lao động là đoàn viên Công đoàn UTEHY. Đăng nhập bằng email
            hoặc mã cán bộ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium">
                Email hoặc mã cán bộ
              </label>
              <input
                id="login-email"
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                placeholder="ten@utehy.edu.vn hoặc mã cán bộ"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-medium">
                Mật khẩu
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Chưa có tài khoản hoặc quên mật khẩu? Liên hệ Văn phòng Công đoàn trường tại{" "}
        <Link to="/lien-he" className="text-primary hover:underline">
          trang Liên hệ
        </Link>
        .
      </p>
    </div>
  );
}
