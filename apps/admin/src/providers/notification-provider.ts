import type { NotificationProvider } from "@refinedev/core";
import { dismissToast, pushToast } from "../components/common/toast-store";

/** NotificationProvider cho Refine — hiển thị toast (components/common/Toaster.tsx) thay vì console. */
export const notificationProvider: NotificationProvider = {
  open: ({ key, message, description, type }) => {
    pushToast({
      id: key,
      message,
      description,
      variant: type === "error" ? "error" : type === "success" ? "success" : "info"
    });
  },
  close: (key) => {
    dismissToast(key);
  }
};
