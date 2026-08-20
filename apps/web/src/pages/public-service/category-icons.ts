import {
  Baby,
  Bike,
  Car,
  HeartPulse,
  HelpCircle,
  Home,
  IdCard,
  Receipt,
  ScrollText,
  type LucideIcon
} from "lucide-react";
import type { PublicServiceProcedureCategory } from "@congdoan/types";

/** Icon minh hoạ cho từng nhóm thủ tục ở lưới "Tra cứu nhanh dịch vụ công" — thuần trang trí, không
 * ảnh hưởng logic, tách riêng file để dùng chung giữa PublicServiceHubPage và PublicServiceProceduresPage. */
export const PUBLIC_SERVICE_CATEGORY_ICONS: Record<PublicServiceProcedureCategory, LucideIcon> = {
  CAN_CUOC: IdCard,
  CU_TRU: Home,
  HO_TICH: Baby,
  BHXH_BHYT: HeartPulse,
  THUE_TNCN: Receipt,
  LY_LICH_TU_PHAP: ScrollText,
  GPLX: Car,
  DANG_KY_PHUONG_TIEN: Bike,
  KHAC: HelpCircle
};
