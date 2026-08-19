import { Authenticated, Refine } from "@refinedev/core";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier
} from "@refinedev/react-router-v6";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { authProvider } from "./providers/auth-provider";
import { dataProvider } from "./providers/data-provider";
import { notificationProvider } from "./providers/notification-provider";

import { AdminLayout } from "./components/layout/AdminLayout";
import { RequireAdmin } from "./components/common/RequireAdmin";
import { Toaster } from "./components/common/Toaster";

import { LoginPage } from "./pages/login/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { PostList } from "./pages/posts/PostList";
import { PostForm } from "./pages/posts/PostForm";
import { CategoryList } from "./pages/categories/CategoryList";
import { CategoryForm } from "./pages/categories/CategoryForm";
import { UserList } from "./pages/users/UserList";
import { UserForm } from "./pages/users/UserForm";

// Deploy làm sub-application "/admin" trên cùng domain với trang công khai (xem
// deploy/HUONG_DAN_CHAY_THU_SQLSERVER_IIS_PM2.md) — router phải biết trước "/admin" để các link nội
// bộ (Link, navigate...) không bị cụt mất tiền tố. Chỉ áp dụng ở bản build production; lúc "pnpm dev"
// app vẫn chạy ở gốc "/" như bình thường (khớp với apps/admin/vite.config.ts).
const ROUTER_BASENAME = import.meta.env.PROD ? "/admin" : "/";

export function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <Refine
        authProvider={authProvider}
        dataProvider={dataProvider}
        notificationProvider={notificationProvider}
        routerProvider={routerBindings}
        resources={[
          {
            name: "dashboard",
            list: "/dashboard",
            meta: { label: "Dashboard" }
          },
          {
            name: "posts",
            list: "/posts",
            create: "/posts/create",
            edit: "/posts/edit/:id",
            meta: { label: "Bài viết" }
          },
          {
            name: "categories",
            list: "/categories",
            create: "/categories/create",
            edit: "/categories/edit/:id",
            meta: { label: "Chuyên mục" }
          },
          {
            name: "users",
            list: "/users",
            create: "/users/create",
            edit: "/users/edit/:id",
            meta: { label: "Người dùng" }
          }
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          disableTelemetry: true,
          useNewQueryKeys: true
        }}
      >
        <Routes>
          <Route
            element={
              <Authenticated key="authenticated-layout" fallback={<CatchAllNavigate to="/login" />}>
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              </Authenticated>
            }
          >
            <Route index element={<NavigateToResource resource="dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/posts">
              <Route index element={<PostList />} />
              <Route path="create" element={<PostForm mode="create" />} />
              <Route path="edit/:id" element={<PostForm mode="edit" />} />
            </Route>

            <Route path="/categories">
              <Route index element={<CategoryList />} />
              <Route path="create" element={<CategoryForm mode="create" />} />
              <Route path="edit/:id" element={<CategoryForm mode="edit" />} />
            </Route>

            <Route
              path="/users"
              element={
                <RequireAdmin>
                  <Outlet />
                </RequireAdmin>
              }
            >
              <Route index element={<UserList />} />
              <Route path="create" element={<UserForm mode="create" />} />
              <Route path="edit/:id" element={<UserForm mode="edit" />} />
            </Route>
          </Route>

          <Route
            element={
              <Authenticated key="authenticated-auth-pages" fallback={<Outlet />}>
                <NavigateToResource resource="dashboard" />
              </Authenticated>
            }
          >
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route path="*" element={<CatchAllNavigate to="/login" />} />
        </Routes>

        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
        <Toaster />
      </Refine>
    </BrowserRouter>
  );
}
