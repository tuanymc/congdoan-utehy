/**
 * Domain Event — "Đăng ký hoạt động" (Tiện ích số, Phase 4b). Xem chú thích domain block ở model
 * Event/EventRegistration trong prisma/schema.prisma (đặc biệt lý do EventRegistration.email bắt
 * buộc, không optional).
 */

export interface EventDto {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string | null;
  endAt: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  isPublic: boolean;
  /** Chỉ có ở bản chi tiết quản trị (xem EventDetailDto) — số lượt đã đăng ký, để so với capacity. */
  registrationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventDetailDto extends EventDto {
  registrationCount: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  location?: string;
  /** ISO datetime string. */
  startAt?: string;
  /** ISO datetime string. */
  endAt?: string;
  /** ISO datetime string. */
  registrationDeadline?: string;
  capacity?: number;
  isPublic?: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

/** Biến thể CÔNG KHAI — CỐ Ý bỏ registrationCount (không cần lộ số người đã đăng ký ra ngoài). */
export interface PublicEventDto {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string | null;
  endAt: string | null;
  registrationDeadline: string | null;
  /** true nếu đã đủ capacity (server tự tính, xem EventsService.toPublicDetail) — FE dùng để khoá form đăng ký. */
  isFull: boolean;
}

export interface EventRegistrationDto {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  note: string | null;
  registeredAt: string;
}

export interface CreateEventRegistrationRequest {
  fullName: string;
  email: string;
  phone?: string;
  note?: string;
}
