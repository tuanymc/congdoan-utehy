import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { NewsListPage } from "./pages/NewsListPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { UnionMembersPage } from "./pages/UnionMembersPage";
import { LoginPage } from "./pages/LoginPage";
import { MemberPortalPage } from "./pages/MemberPortalPage";
import { DigitalUtilitiesPage } from "./pages/DigitalUtilitiesPage";
import { DigitalFormsPage } from "./pages/DigitalFormsPage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { AiToolsPage } from "./pages/AiToolsPage";
import { SurveysPage } from "./pages/SurveysPage";
import { SurveyDetailPage } from "./pages/SurveyDetailPage";
import { PublicServiceHubPage } from "./pages/public-service/PublicServiceHubPage";
import { PublicServiceProceduresPage } from "./pages/public-service/PublicServiceProceduresPage";
import { PublicServiceProcedureDetailPage } from "./pages/public-service/PublicServiceProcedureDetailPage";
import { PublicServiceLinksPage } from "./pages/public-service/PublicServiceLinksPage";
import { PublicServiceSupportPage } from "./pages/public-service/PublicServiceSupportPage";
import { PublicServiceNoticesPage } from "./pages/public-service/PublicServiceNoticesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tin-tuc" element={<NewsListPage />} />
        <Route path="tin-tuc/:slug" element={<NewsDetailPage />} />
        <Route path="gioi-thieu" element={<AboutPage />} />
        <Route path="van-ban" element={<DocumentsPage />} />
        <Route path="van-ban/:id" element={<DocumentDetailPage />} />
        <Route path="danh-ba-cong-doan-vien" element={<UnionMembersPage />} />
        <Route path="tien-ich-so-cong-doan" element={<DigitalUtilitiesPage />} />
        <Route path="tien-ich-so-cong-doan/bieu-mau" element={<DigitalFormsPage />} />
        <Route path="tien-ich-so-cong-doan/dang-ky-hoat-dong" element={<EventsPage />} />
        <Route path="tien-ich-so-cong-doan/dang-ky-hoat-dong/:id" element={<EventDetailPage />} />
        <Route path="tien-ich-so-cong-doan/khao-sat" element={<SurveysPage />} />
        <Route path="tien-ich-so-cong-doan/khao-sat/:id" element={<SurveyDetailPage />} />
        <Route path="tien-ich-so-cong-doan/dich-vu-cong" element={<PublicServiceHubPage />} />
        <Route path="tien-ich-so-cong-doan/dich-vu-cong/thu-tuc" element={<PublicServiceProceduresPage />} />
        <Route path="tien-ich-so-cong-doan/dich-vu-cong/thu-tuc/:slug" element={<PublicServiceProcedureDetailPage />} />
        <Route path="tien-ich-so-cong-doan/dich-vu-cong/lien-ket" element={<PublicServiceLinksPage />} />
        <Route path="tien-ich-so-cong-doan/dich-vu-cong/ho-tro" element={<PublicServiceSupportPage />} />
        <Route path="tien-ich-so-cong-doan/dich-vu-cong/thong-bao" element={<PublicServiceNoticesPage />} />
        <Route
          path="tien-ich-so-cong-doan/cong-cu-ai"
          element={
            <ProtectedRoute>
              <AiToolsPage />
            </ProtectedRoute>
          }
        />
        <Route path="lien-he" element={<ContactPage />} />
        <Route path="dang-nhap" element={<LoginPage />} />
        <Route
          path="cong-doan-vien"
          element={
            <ProtectedRoute>
              <MemberPortalPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
