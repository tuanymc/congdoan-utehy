-- Mở rộng yêu cầu duyệt hồ sơ: họ tên, SĐT, email (cùng ảnh / chức vụ / trình độ).
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD [fullName] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD [phone] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD [email] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD [currentFullName] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD [currentPhone] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[union_member_profile_change_requests] ADD [currentEmail] NVARCHAR(1000) NULL;
