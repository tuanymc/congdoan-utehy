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
import { RequireDocumentAccess } from "./components/common/RequireDocumentAccess";
import { Toaster } from "./components/common/Toaster";

import { LoginPage } from "./pages/login/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { PostList } from "./pages/posts/PostList";
import { PostForm } from "./pages/posts/PostForm";
import { CategoryList } from "./pages/categories/CategoryList";
import { CategoryForm } from "./pages/categories/CategoryForm";
import { UserList } from "./pages/users/UserList";
import { UserForm } from "./pages/users/UserForm";
import { DocumentTypeList } from "./pages/document-types/DocumentTypeList";
import { DocumentTypeForm } from "./pages/document-types/DocumentTypeForm";
import { OfficialDocumentList } from "./pages/official-documents/OfficialDocumentList";
import { OfficialDocumentForm } from "./pages/official-documents/OfficialDocumentForm";
import { HomeSlideList } from "./pages/home-slides/HomeSlideList";
import { HomeSlideForm } from "./pages/home-slides/HomeSlideForm";
import { UnionDepartmentList } from "./pages/union-departments/UnionDepartmentList";
import { UnionDepartmentForm } from "./pages/union-departments/UnionDepartmentForm";
import { UnionMemberList } from "./pages/union-members/UnionMemberList";
import { UnionMemberForm } from "./pages/union-members/UnionMemberForm";
import { ContactMessageList } from "./pages/contact-messages/ContactMessageList";

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
          },
          {
            name: "document-types",
            list: "/document-types",
            create: "/document-types/create",
            edit: "/document-types/edit/:id",
            meta: { label: "Loại công văn" }
          },
          {
            name: "official-documents",
            list: "/official-documents",
            create: "/official-documents/create",
            edit: "/official-documents/edit/:id",
            meta: { label: "Công văn" }
          },
          {
            name: "home-slides",
            list: "/home-slides",
            create: "/home-slides/create",
            edit: "/home-slides/edit/:id",
            meta: { label: "Banner trang chủ" }
          },
          {
            name: "union-departments",
            list: "/union-departments",
            create: "/union-departments/create",
            edit: "/union-departments/edit/:id",
            meta: { label: "Công đoàn bộ phận" }
          },
          {
            name: "union-members",
            list: "/union-members",
            create: "/union-members/create",
            edit: "/union-members/edit/:id",
            meta: { label: "Công đoàn viên" }
          },
          {
            name: "contact-messages",
            list: "/contact-messages",
            meta: { label: "Liên hệ" }
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

            <Route
              path="/document-types"
              element={
                <RequireDocumentAccess>
                  <Outlet />
                </RequireDocumentAccess>
              }
            >
              <Route index element={<DocumentTypeList />} />
              <Route path="create" element={<DocumentTypeForm mode="create" />} />
              <Route path="edit/:id" element={<DocumentTypeForm mode="edit" />} />
            </Route>

            <Route
              path="/official-documents"
              element={
                <RequireDocumentAccess>
                  <Outlet />
                </RequireDocumentAccess>
              }
            >
              <Route index element={<OfficialDocumentList />} />
              <Route path="create" element={<OfficialDocumentForm mode="create" />} />
              <Route path="edit/:id" element={<OfficialDocumentForm mode="edit" />} />
            </Route>

            <Route
              path="/home-slides"
              element={
                <RequireDocumentAccess>
                  <Outlet />
                </RequireDocumentAccess>
              }
            >
              <Route index element={<HomeSlideList />} />
              <Route path="create" element={<HomeSlideForm mode="create" />} />
              <Route path="edit/:id" element={<HomeSlideForm mode="edit" />} />
            </Route>

            <Route
              path="/union-departments"
              element={
                <RequireDocumentAccess>
                  <Outlet />
                </RequireDocumentAccess>
              }
            >
              <Route index element={<UnionDepartmentList />} />
              <Route path="create" element={<UnionDepartmentForm mode="create" />} />
              <Route path="edit/:id" element={<UnionDepartmentForm mode="edit" />} />
            </Route>

            <Route
              path="/union-members"
              element={
                <RequireDocumentAccess>
                  <Outlet />
                </RequireDocumentAccess>
              }
            >
              <Route index element={<UnionMemberList />} />
              <Route path="create" element={<UnionMemberForm mode="create" />} />
              <Route path="edit/:id" element={<UnionMemberForm mode="edit" />} />
            </Route>

            <Route
              path="/contact-messages"
              element={
                <RequireDocumentAccess>
                  <Outlet />
                </RequireDocumentAccess>
              }
            >
              <Route index element={<ContactMessageList />} />
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
