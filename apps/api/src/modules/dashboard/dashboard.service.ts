import { Injectable } from "@nestjs/common";
import type {
  DashboardOverviewDto,
  PublicServiceSupportRequestStatus
} from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(): Promise<DashboardOverviewDto> {
    const now = new Date();
    const [
      posts,
      publishedPosts,
      draftPosts,
      categories,
      unionMembers,
      unionMembersWithLogin,
      unionDepartments,
      officialDocuments,
      contacts,
      unreadContacts,
      events,
      surveys,
      openSurveys,
      supportNew,
      supportInProgress,
      users,
      homeSlides,
      recentPosts,
      recentContacts,
      recentSupportRequests,
      recentDocuments,
      upcomingEvents
    ] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: "PUBLISHED" } }),
      this.prisma.post.count({ where: { status: "DRAFT" } }),
      this.prisma.category.count(),
      this.prisma.unionMember.count(),
      this.prisma.unionMember.count({ where: { userId: { not: null } } }),
      this.prisma.unionDepartment.count(),
      this.prisma.officialDocument.count(),
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
      this.prisma.event.count(),
      this.prisma.survey.count(),
      this.prisma.survey.count({ where: { isOpen: true } }),
      this.prisma.publicServiceSupportRequest.count({ where: { status: "NEW" } }),
      this.prisma.publicServiceSupportRequest.count({ where: { status: "IN_PROGRESS" } }),
      this.prisma.user.count(),
      this.prisma.homeSlide.count(),
      this.prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, status: true, createdAt: true }
      }),
      this.prisma.contactMessage.findMany({
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
        take: 6,
        select: { id: true, name: true, email: true, isRead: true, createdAt: true }
      }),
      this.prisma.publicServiceSupportRequest.findMany({
        where: { status: { in: ["NEW", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, fullName: true, status: true, createdAt: true }
      }),
      this.prisma.officialDocument.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, documentNumber: true, createdAt: true }
      }),
      this.prisma.event.findMany({
        where: { startAt: { gte: now } },
        orderBy: { startAt: "asc" },
        take: 5,
        select: { id: true, title: true, location: true, startAt: true }
      })
    ]);

    return {
      kpis: {
        posts,
        publishedPosts,
        draftPosts,
        categories,
        unionMembers,
        unionMembersWithLogin,
        unionDepartments,
        officialDocuments,
        contacts,
        unreadContacts,
        events,
        surveys,
        openSurveys,
        supportNew,
        supportInProgress,
        users,
        homeSlides
      },
      recentPosts: recentPosts.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status as DashboardOverviewDto["recentPosts"][number]["status"],
        createdAt: p.createdAt.toISOString()
      })),
      recentContacts: recentContacts.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        isRead: c.isRead,
        createdAt: c.createdAt.toISOString()
      })),
      recentSupportRequests: recentSupportRequests.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        status: r.status as PublicServiceSupportRequestStatus,
        createdAt: r.createdAt.toISOString()
      })),
      recentDocuments: recentDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        documentNumber: d.documentNumber,
        createdAt: d.createdAt.toISOString()
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        startAt: e.startAt ? e.startAt.toISOString() : null
      }))
    };
  }
}
