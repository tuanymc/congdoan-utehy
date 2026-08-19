/**
 * Domain HomeSlide — banner/slide ảnh trang chủ (thay tblSlide web cũ). Xem chú thích domain block
 * HOMESLIDE trong prisma/schema.prisma.
 */

export interface HomeSlideDto {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateHomeSlideRequest {
  name: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateHomeSlideRequest extends Partial<CreateHomeSlideRequest> {}
