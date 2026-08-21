import type { PostStatus } from "./content";
import type { PublicServiceSupportRequestStatus } from "./public-service";

export interface DashboardKpisDto {
  posts: number;
  publishedPosts: number;
  draftPosts: number;
  categories: number;
  unionMembers: number;
  unionMembersWithLogin: number;
  unionDepartments: number;
  officialDocuments: number;
  contacts: number;
  unreadContacts: number;
  events: number;
  surveys: number;
  openSurveys: number;
  supportNew: number;
  supportInProgress: number;
  users: number;
  homeSlides: number;
}

export interface DashboardRecentPostDto {
  id: string;
  title: string;
  status: PostStatus;
  createdAt: string;
}

export interface DashboardRecentContactDto {
  id: string;
  name: string;
  email: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardRecentSupportDto {
  id: string;
  fullName: string;
  status: PublicServiceSupportRequestStatus;
  createdAt: string;
}

export interface DashboardRecentDocumentDto {
  id: string;
  title: string;
  documentNumber: string | null;
  createdAt: string;
}

export interface DashboardUpcomingEventDto {
  id: string;
  title: string;
  location: string | null;
  startAt: string | null;
}

/** Tổng quan trang quản trị — một round-trip cho dashboard, không gọi từng resource. */
export interface DashboardOverviewDto {
  kpis: DashboardKpisDto;
  recentPosts: DashboardRecentPostDto[];
  recentContacts: DashboardRecentContactDto[];
  recentSupportRequests: DashboardRecentSupportDto[];
  recentDocuments: DashboardRecentDocumentDto[];
  upcomingEvents: DashboardUpcomingEventDto[];
}
